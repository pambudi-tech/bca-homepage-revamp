'use client';

import { useTranslations } from 'next-intl';
import { BookOpen, FolderOpen, GitBranch, Layers, Network, Palette } from 'lucide-react';
import { Link } from '@/i18n/navigation';

const pages = [
  { id: 'index', href: '/project-index', Icon: BookOpen },
  { id: 'catalog', href: '/component-catalog', Icon: Layers },
  { id: 'assets', href: '/asset-bank', Icon: FolderOpen },
  { id: 'tokens', href: '/design-tokens', Icon: Palette },
  { id: 'map', href: '/site-map', Icon: Network },
  { id: 'flows', href: '/user-flows', Icon: GitBranch },
] as const;

export default function WorkspaceNav({ active }: { active: typeof pages[number]['id'] }) {
  const t = useTranslations('siteMap');
  return <nav aria-label={t('workspace')} className="flex shrink-0 items-center gap-1 text-size-body-m">
    {/* User Flows is temporarily hidden from workspace navigation. */}
    {pages.filter(({ id }) => id !== 'flows').map(({ id, href, Icon }) => <Link key={id} href={href} prefetch={false} aria-current={active === id ? 'page' : undefined} className={`flex items-center gap-2 rounded-lg px-2 py-2 xl:px-3 outline-none transition-colors focus-visible:ring-2 focus-visible:ring-neutral-600 ${active === id ? 'bg-neutral-200 font-semibold text-neutral-900' : 'text-neutral-700 hover:bg-neutral-200 hover:text-neutral-900'}`}>
      <Icon aria-hidden className="size-4 shrink-0" /><span className="sr-only xl:not-sr-only">{t(`nav.${id}`)}</span>
    </Link>)}
  </nav>;
}
