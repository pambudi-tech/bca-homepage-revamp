import type { FlowJourney } from './flow-data';
import type { FlowStage } from './flow-preview-state';

// The starting path belongs to the actual journey. Cases branch from it;
// outcomes and recovery come from the audited scenario, not a fixed four-step template.
export type FlowTrackNode = { key: string; stage: FlowStage };
const node = (key: string, stage: FlowStage): FlowTrackNode => ({ key, stage });
const tracks: Record<string, FlowTrackNode[]> = {
  navigation: [node('homepage', 0), node('navigation', 1)],
  search: [node('homepage', 0), node('search', 1)],
  directory: [node('privilege', 0), node('filters', 1)],
  detail: [node('benefitDetail', 0)],
  login: [node('login', 0), node('credentials', 1)],
  access: [node('memberUrl', 0)],
  portfolio: [node('financialReport', 0), node('otp', 1)],
  vouchers: [node('memberBenefit', 0)],
  medical: [node('medical', 0), node('location', 1)],
  banking: [node('banking', 0)],
  magazine: [node('magazine', 0), node('issue', 1)],
  branches: [node('branches', 0), node('origin', 1)],
  contact: [node('information', 0)],
  logout: [node('memberArea', 0), node('logout', 1)],
  resilience: [node('reportOrContent', 0)],
  preview: [node('website', 0), node('previewGate', 1)],
};
export function flowTrack(journey: FlowJourney): FlowTrackNode[] {
  const result = tracks[journey.id];
  if (!result) throw new Error(`Missing flow track: ${journey.id}`);
  return result;
}
