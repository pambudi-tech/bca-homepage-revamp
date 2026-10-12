import type { FlowJourney, FlowScenario } from './flow-data';
import type { FlowPreviewState, FlowStage } from './flow-preview-state';

export type FlowAnnotationKind = 'click' | 'input' | 'select' | 'response';
export type FlowAnnotation = { element: HTMLElement; kind: FlowAnnotationKind };

// Resolve real controls inside the frozen source UI. A passive stage has no
// invented click target; errors are labelled as responses, never as actions.
export function flowPreviewAnnotations(root: HTMLElement, journey: FlowJourney, scenario: FlowScenario, stage: FlowStage, { scene, state }: FlowPreviewState) {
  const find = (selector: string) => Array.from(root.querySelectorAll<HTMLElement>(selector)).find(element => {
    const hidden = element.closest('[aria-hidden="true"]');
    return element.offsetWidth > 8 && element.offsetHeight > 8 && (!hidden || hidden === root) && getComputedStyle(element).visibility !== 'hidden';
  });
  const annotations: FlowAnnotation[] = [];
  const mark = (selector: string, kind: FlowAnnotationKind = 'click') => {
    const element = find(selector);
    if (element && !annotations.some(item => item.element === element)) annotations.push({ element, kind });
  };
  const id = scenario.id;
  const before = stage < 2;
  const destinationBrand = root.querySelector('[data-flow-brand]')?.getAttribute('data-flow-brand') === 'solitaire' ? 'prioritas' : 'solitaire';
  const dialog = find('[role="dialog"], [aria-labelledby="information-preview-channel-title"]');
  const error = find('[role="alert"]') ?? find('input[aria-invalid="true"]')?.parentElement;
  const status = find('[role="status"]');
  let focus = dialog ?? (scene === 'login' ? find('.member-login-card') : undefined)
    ?? find('[data-flow-preview-focus]')
    ?? (['directory', 'magazine'].includes(scene) ? find('[data-prioritas-directory]') : undefined)
    ?? (scene === 'portfolio' ? find('section') : undefined)
    ?? (scene === 'kurs' ? find(`[aria-labelledby="kurs-${['converter', 'swapped', 'invalidAmount'].includes(state) ? 'converter' : 'list'}-title"]`) : undefined);

  if (scene === 'home' && before) {
    if (journey.id === 'search') mark('button:has(img[src*="outline-search"])');
    if (journey.id === 'navigation') {
      if (id === 'language') {
        const languageMenu = find('[role="menu"]');
        focus = languageMenu?.parentElement ?? find('button:has(img[src*="flag"])')?.closest('nav') ?? undefined;
        mark(languageMenu ? '[role="menu"] button:has(img[src*="flag"])' : 'button:has(img[src*="flag"])');
      } else if (dialog) {
        mark(id === 'closeMenu' ? '[role="dialog"] header > div > button' : `[role="dialog"] nav a[href$="/${destinationBrand}"]`);
      } else if (id === 'menu') {
        mark(`nav a[href$="/${destinationBrand}"], nav button:has(img[src*="menu"])`);
        focus = annotations[0]?.element.closest('nav') ?? focus;
      } else mark('nav button:has(img[src*="menu"])');
    }
  } else if (scene === 'overview' && journey.id === 'logout' && stage === 0) {
    if (id === 'segment') mark('nav a[href="/"]');
    else mark('[data-flow-action="logout"], button[aria-haspopup="menu"]');
    focus = dialog ? annotations[0]?.element.closest<HTMLElement>('div.absolute') ?? dialog : annotations[0]?.element.closest('[role="menu"]')?.parentElement ?? annotations[0]?.element.closest('nav') ?? undefined;
  } else if (scene === 'magazine' && before) {
    mark(id === 'list' ? '[data-flow-action="next-page"]' : '[data-prioritas-directory] a[href*="magazine="]');
  } else if (scene === 'detail' && id === 'signIn' && before) {
    mark('a[href*="member/login"]');
    focus = annotations[0]?.element.parentElement ?? undefined;
  } else if (scene === 'detail' && id === 'restricted') {
    focus = find('aside[aria-label]');
  } else if (scene === 'detail' || scene === 'bankingDetail') {
    focus ??= find('[data-blueprint-part="accordionHeader"]')?.parentElement ?? undefined;
  } else if (scene === 'branches') {
    const location = find('[data-flow-location]');
    focus = dialog ?? (location && location.offsetWidth >= 1280 && state !== 'mapFailed' ? find('[data-flow-location-controls]') : location);
    if (before && ['place', 'noPlace', 'fastTyping'].includes(id)) mark('input[role="combobox"]', 'input');
    else if (before && ['gps', 'denied', 'unavailable'].includes(id)) mark(dialog ? '[role="dialog"] button:last-child' : 'button[aria-haspopup="dialog"]');
    else if (before && id === 'directions') mark('a[aria-label]');
  } else if (scene === 'portfolio' && journey.id === 'portfolio') {
    if (before && !['expiry', 'reload', 'reportUnknown'].includes(id)) mark('[data-flow-action="visibility"]');
  } else if (scene === 'otp') {
    if (id === 'cancel' && stage === 1) mark('[role="dialog"] > button');
    else if (before || stage === 3 && ['partial', 'rejected', 'noSelection', 'resend'].includes(id)) {
      if (state === 'request') {
        if (id !== 'noSelection') mark('button[aria-controls="financial-otp-phone"]', 'select');
        mark('[data-flow-action="send-otp"]');
      } else if (state === 'resend') {
        mark('[data-flow-action="resend-otp"]');
      } else if (state === 'verify') {
        mark('[data-flow-action="otp-code"]', 'input');
      }
    } else if (id === 'resend' && stage === 1) mark('[data-flow-action="resend-otp"]');
  } else if (scene === 'login' && journey.id === 'login') {
    if (before || stage === 3 && ['wrong', 'invalidFormat'].includes(id)) {
      if (id === 'invalidFormat') mark('input[name="identifier"]', 'input');
      else if (id === 'blankPassword') mark('input[name="password"]', 'input');
      else if (id === 'help') mark('[data-flow-action="login-help"]');
      else if (id === 'cancel') mark('a.member-login-back');
      else {
        if (stage === 0 || stage === 3) {
          mark('input[name="identifier"]', 'input');
          mark('input[name="password"]', 'input');
        }
        mark('button[type="submit"]');
      }
    }
  } else if (scene === 'directory' && journey.id === 'directory') {
    if (id === 'tabChange') {
      focus = find('[data-prioritas-index-tabs]')?.parentElement ?? focus;
      if (before) mark('[role="tab"][href*="section=event"]', 'select');
    }
    else if (id === 'pagination') { if (before) mark('[data-flow-action="next-page"]'); }
    else if (id === 'birthday') { if (before || stage === 3) mark('[data-prioritas-directory] label:has(input[type="checkbox"])', 'select'); }
    else if (id === 'combined' && before) {
      mark('[data-prioritas-directory] button[aria-pressed="true"], [data-prioritas-directory] button[aria-pressed]', 'select');
      mark('[data-prioritas-directory] input[aria-controls="complimentary-brand-options"]', 'input');
    } else if (id === 'none' && before) mark('[data-prioritas-directory] input[aria-controls="complimentary-brand-options"]', 'input');
  } else if (scene === 'directory' && journey.id === 'navigation') {
    focus = find('[data-prioritas-index-tabs]');
    if (before) mark('[role="tab"][aria-selected="true"], [data-prioritas-index-tabs] a[aria-current="page"]', 'select');
  } else if (scene === 'search') {
    if (id === 'cancel' && stage === 1) mark('[role="dialog"] button[aria-label]');
    else if (before || stage === 3 && id === 'empty') mark('[data-blueprint-part="searchField"]', 'input');
  } else if (scene === 'vouchers') {
    if (before && ['copy', 'copyDenied'].includes(id)) mark('[data-flow-preview-focus] button[aria-label]');
    if (before && id === 'expand') mark('[data-flow-preview-focus] button[aria-expanded]');
    if (state === 'used') focus = find('[data-transfer-voucher="used"]');
  } else if (scene === 'medical') {
    if (before) {
      if (id === 'copy') mark('[aria-labelledby="member-medical-check-up-title"] button[aria-label]');
      else if (stage === 0) mark('button[aria-controls="medical-check-up-location"]', 'select');
      else mark('[aria-labelledby="member-medical-check-up-title"] a[target="_blank"]');
    }
  } else if (scene === 'logout' && stage === 1) {
    mark(id === 'cancel' ? '[role="dialog"] button:last-child' : '[role="dialog"] button');
  } else if (scene === 'preview') {
    if (before) { mark('input[type="password"]', 'input'); mark('button[type="submit"]'); }
    focus = find('form');
  } else if (scene === 'kurs' && before && ['converter', 'invalidAmount'].includes(id)) {
    mark('[aria-labelledby="kurs-converter-title"] input', 'input');
  } else if (scene === 'portfolio' && journey.id === 'resilience' && before) {
    mark(id === 'period' ? 'button[aria-pressed]' : '[data-flow-action="download-report"]');
  } else if (scene === 'banking' && before) {
    mark(id === 'wealth' ? 'a[href*="House-View-Report"]' : 'a[href$="/banking-solution/privilege/kkb"]');
    focus = annotations[0]?.element.closest('section') ?? annotations[0]?.element.parentElement ?? focus;
  } else if (scene === 'contact' && before) {
    if (dialog) mark(id === 'cancelDisclosure' ? '[aria-labelledby="information-preview-channel-title"] button' : '[aria-labelledby="information-preview-channel-title"] button:last-child');
    else if (['channel', 'branch', 'cancelDisclosure'].includes(id)) {
      focus = find(`[aria-labelledby="contact-${id === 'branch' ? 'branch' : 'phone'}-title"]`);
      mark(`[aria-labelledby="contact-${id === 'branch' ? 'branch' : 'phone'}-title"] :is(button,a)`);
    }
  }
  if (scene === 'directory' && state === 'signature') {
    focus = find('#signature-privilege-grid');
    if (journey.id === 'directory' && before) mark('#signature-privilege-grid a[href$="executive-airport-lounge"]');
  }
  if (!before && error) annotations.push({ element: error, kind: 'response' });
  else if (!before && status) annotations.push({ element: status, kind: 'response' });
  focus ??= error?.closest('section') ?? status?.closest('section') ?? annotations[0]?.element.closest<HTMLElement>('section, form, nav, header') ?? undefined;
  // Full-screen menus/search stay readable at source width and may scroll.
  // Fit only contained dialogs (OTP, logout, permission and contact notices).
  return { focus, annotations, dialog: Boolean(dialog && !dialog.classList.contains('fade-overlay')) };
}
