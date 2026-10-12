'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';

export default function WorkspaceTitle({ href }: { href?: '/asset-bank' | '/site-map' | '/design-tokens' | '/user-flows' }) {
  const t = useTranslations('siteMap');
  const title = t('workspaceTitle');
  const className = 'line-clamp-3 min-w-0 text-size-body-l font-semibold leading-5';
  return href ? <Link href={href} className={className} title={title}>{title}</Link> : <h1 className={className} title={title}>{title}</h1>;
}
