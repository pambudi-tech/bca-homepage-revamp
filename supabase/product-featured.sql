-- Menandai produk mana yang tampil di layout Accordion homepage.
-- Jalankan di Supabase dashboard → SQL Editor → New query → Run.
-- Aman dijalankan ulang (idempotent).
--
-- Latar belakang: satu kategori boleh punya berapa pun produk di database
-- (Simpanan sekarang 9). Layout "Curved Carousel" memutar semuanya, tapi layout
-- "Accordion" hanya punya ruang untuk 3 kartu. Kolom di bawah yang memilih
-- ketiganya — jadi menambah produk baru tidak otomatis merusak layout accordion.

-- ---------------------------------------------------------------- kolom ----

alter table public.products
  add column if not exists is_featured boolean not null default false;

comment on column public.products.is_featured is
  'Tampil di layout Accordion homepage. Maksimal 3 per kategori (dijaga trigger).';

-- Query homepage memfilter kolom ini, jadi index-nya ikut category_key.
create index if not exists products_category_featured_idx
  on public.products (category_key, sort_order)
  where is_featured;

-- ------------------------------------------------------------- backfill ----
-- Kolom baru default false, yang berarti tanpa langkah ini layout accordion
-- akan kosong pada instalasi yang sudah berisi data. Tandai 3 produk aktif
-- dengan sort_order terkecil di tiap kategori.
--
-- `where not exists (...)` per kategori: hanya kategori yang belum punya
-- pilihan sama sekali yang diisi, sehingga menjalankan ulang file ini tidak
-- menimpa pilihan yang sudah diatur lewat Table Editor.

with ranked as (
  select id,
         category_key,
         row_number() over (
           partition by category_key
           order by sort_order, id
         ) as rn
    from public.products
   where is_active
),
kandidat as (
  select r.id
    from ranked r
   where r.rn <= 3
     and not exists (
           select 1
             from public.products p
            where p.category_key = r.category_key
              and p.is_featured
         )
)
update public.products p
   set is_featured = true
  from kandidat k
 where p.id = k.id;

-- ---------------------------------------------------------------- jaga 3 ----
-- Accordion punya tepat 3 slot. Tanpa penjaga ini, mencentang kartu keempat di
-- Table Editor akan lolos diam-diam dan kartu keempat itu tidak pernah muncul
-- di mana pun — bug yang membingungkan karena datanya terlihat benar.
-- Batasnya ditegakkan di database supaya berlaku juga untuk perubahan lewat
-- dashboard, bukan hanya lewat aplikasi.

create or replace function public.products_featured_limit()
returns trigger
language plpgsql
as $$
declare
  jumlah int;
begin
  if not new.is_featured then
    return new;
  end if;

  select count(*)
    into jumlah
    from public.products
   where category_key = new.category_key
     and is_featured
     and id is distinct from new.id;

  if jumlah >= 3 then
    raise exception
      'Kategori % sudah punya 3 produk pilihan. Hapus centang salah satunya dulu.',
      new.category_key
      using errcode = 'check_violation';
  end if;

  return new;
end;
$$;

drop trigger if exists products_featured_limit_trg on public.products;
create trigger products_featured_limit_trg
  before insert or update of is_featured, category_key on public.products
  for each row execute function public.products_featured_limit();

-- ------------------------------------------------------------- verifikasi ----
-- Jalankan untuk melihat hasilnya. Setiap kategori seharusnya menunjukkan 3.
--
-- select category_key,
--        count(*) filter (where is_featured) as pilihan,
--        count(*)                            as total
--   from public.products
--  where is_active
--  group by category_key
--  order by category_key;

-- Mengganti pilihan untuk satu kategori (contoh: Simpanan) — hapus dulu, lalu
-- set yang baru, karena trigger di atas menolak melebihi 3.
--
-- update public.products set is_featured = false where category_key = 'Simpanan';
-- update public.products set is_featured = true
--  where category_key = 'Simpanan' and title in ('Tahapan BCA', 'Tapres', 'BCA Dollar');
