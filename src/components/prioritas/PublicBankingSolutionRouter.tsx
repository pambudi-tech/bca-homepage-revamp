'use client';

import { useSearchParams } from 'next/navigation';
import PublicBankingSolutionView, { type PublicBankingSolutionProps } from './PublicBankingSolutionView';

export default function PublicBankingSolutionRouter(props: Omit<PublicBankingSolutionProps, 'activeSection'>) {
  const values = useSearchParams().getAll('section');
  const activeSection = values.length === 1 && values[0] === 'wealth' ? 'wealth' : 'privilege';
  return <PublicBankingSolutionView {...props} activeSection={activeSection} />;
}
