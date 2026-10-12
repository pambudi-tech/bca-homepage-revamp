'use client';

import { useSearchParams } from 'next/navigation';
import type { ComponentProps } from 'react';
import PublicPrivilegeView from './PublicPrivilegeView';
import type { PrioritasIndexTab } from './PrioritasIndexTabs';

export type PublicPrivilegeSections = Record<PrioritasIndexTab, ComponentProps<typeof PublicPrivilegeView>>;

/** URL tabs stay interactive without turning the public page into an SSR function. */
export default function PublicPrivilegeRouter({ sections }: { sections: PublicPrivilegeSections }) {
  const values = useSearchParams().getAll('section');
  const value = values.length === 1 ? values[0] : undefined;
  const active = value === 'lifestyle' || value === 'event' || value === 'promo' ? value : 'signature';
  return <PublicPrivilegeView {...sections[active]} />;
}
