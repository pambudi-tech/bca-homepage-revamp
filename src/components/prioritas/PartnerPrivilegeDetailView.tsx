'use client';
import type { ComponentProps } from 'react';
import PrioritasDetailExperience from './PrioritasDetailExperience';
import BackToTop from '@/components/home/BackToTop';

export type PartnerDetailViewData = { surface: string; detail: ComponentProps<typeof PrioritasDetailExperience> };
export default function PartnerPrivilegeDetailView({ surface, detail }: PartnerDetailViewData) {
  return <main id="main-content" className={surface}>
    <PrioritasDetailExperience {...detail} />
    <BackToTop bottomInset="24px" revealAtBottom />
  </main>;
}
