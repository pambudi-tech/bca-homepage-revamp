import type { ComponentProps, ReactNode } from 'react';

export function WorkspaceSidebarLayout({ children }: { children: ReactNode }) {
  return <div className="lg:grid lg:grid-cols-[240px_minmax(0,1fr)]">{children}</div>;
}

export function WorkspaceSidebar({ children, ...props }: ComponentProps<'aside'>) {
  return <aside {...props} className="border-b border-neutral-400 px-5 py-5 lg:sticky lg:top-0 lg:h-dvh lg:overflow-y-auto lg:border-b-0 lg:border-r lg:py-8" data-lenis-prevent>{children}</aside>;
}

export function WorkspaceMenuItem({ active, children, ...props }: ComponentProps<'button'> & { active: boolean }) {
  return <button {...props} type="button" aria-current={active ? 'page' : undefined} className={`flex shrink-0 items-center justify-between gap-4 rounded-lg px-3 py-2.5 text-left text-size-body-m outline-none focus-visible:ring-2 focus-visible:ring-neutral-600 lg:w-full ${active ? 'bg-neutral-200 font-semibold' : 'text-neutral-700 hover:bg-neutral-200'}`}>{children}</button>;
}
