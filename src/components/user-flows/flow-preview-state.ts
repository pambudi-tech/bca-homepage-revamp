import type { FlowJourney, FlowScenario } from './flow-data';

export type FlowStage = 0 | 1 | 2 | 3;
export type FlowScene = 'home' | 'search' | 'directory' | 'detail' | 'login' | 'overview' | 'portfolio' | 'otp' | 'vouchers' | 'medical' | 'banking' | 'bankingDetail' | 'kurs' | 'magazine' | 'branches' | 'contact' | 'logout' | 'preview' | 'notFound';
export type FlowPreviewState = { scene: FlowScene; state: string };
const ui = (scene: FlowScene, state = 'default'): FlowPreviewState => ({ scene, state });

// Stages are source, action/condition, observed result, and continuation.
// External/unhandled outcomes retain the actual on-site UI, never fake success.
export function flowPreviewState(journey: FlowJourney, scenario: FlowScenario, stage: FlowStage): FlowPreviewState {
  const id = scenario.id;
  const after = stage >= 2;
  switch (journey.id) {
    case 'navigation':
      if (id === 'language') return ui('home', stage === 1 ? 'language' : after ? 'translated' : 'default');
      if (id === 'closeMenu') return ui('home', stage === 1 ? 'menu' : 'default');
      if (id === 'menu') return after ? ui('home', 'otherBrand') : ui('home', stage === 1 ? 'menu' : 'default');
      return stage === 0 ? ui('home') : ui('directory', 'lifestyle');
    case 'search':
      if (stage === 0 || id === 'cancel' && after) return ui('home');
      if (id === 'history') return ui('search', stage === 1 ? 'history' : 'historyCleared');
      return ui('search', stage === 3 && id === 'empty' ? 'blank' : id === 'cancel' ? 'blank' : id);
    case 'directory':
      if (id === 'browse') return after ? ui('detail', 'read') : ui('directory', 'signature');
      if (id === 'tabChange') return ui('directory', after ? 'event' : 'lifestyleFiltered');
      return ui('directory', stage === 0 || stage === 3 && ['none', 'birthday', 'combined', 'pagination'].includes(id) ? 'browse' : id);
    case 'detail':
      if (id === 'missing' && after) return ui('notFound');
      if (id === 'signIn' && stage === 2) return ui('login');
      if (id === 'signIn' && stage === 3 || id === 'solitaire') return ui('detail', 'member');
      return ui('detail', id === 'restricted' ? 'restricted' : 'read');
    case 'login':
      if (['valid', 'email', 'otherBrand', 'unsafe'].includes(id) && after) return ui('overview', id === 'otherBrand' ? 'otherBrand' : 'default');
      if (id === 'cancel' && after) return ui('home');
      if (stage === 0) return ui('login');
      if (id === 'requestFailed') return ui('login', stage === 1 ? 'filled' : 'pending');
      return ui('login', stage === 3 && ['wrong', 'invalidFormat'].includes(id) || stage === 1 && ['wrong', 'help'].includes(id) ? 'filled' : id);
    case 'access':
      if (id === 'unknown' && after) return ui('notFound');
      if (['missing', 'mismatch', 'cookieBlocked'].includes(id) && (after || id === 'missing' && stage === 1)) return ui('login');
      return ui('overview');
    case 'portfolio':
      if (id === 'reload') return ui('portfolio', 'visible');
      if (['hideAgain', 'expiry'].includes(id)) return ui('portfolio', after ? 'masked' : 'visible');
      if (id === 'reportUnknown') return ui('portfolio', 'masked');
      if (stage === 0 || id === 'cancel' && after || id === 'noPhone' && stage === 3) return ui('portfolio', 'masked');
      if (['verified', 'expiredCode'].includes(id) && after) return ui('portfolio', 'visible');
      if (id === 'noPhone') return ui('otp', 'noPhone');
      if (stage === 1) return ui('otp', id === 'resend' ? 'resend' : id === 'expiredCode' ? 'expiredCode' : ['partial', 'rejected', 'resend', 'failure'].includes(id) ? 'verify' : 'request');
      if (stage === 3 && ['noSelection', 'rejected', 'partial', 'resend'].includes(id)) return ui('otp', id === 'noSelection' ? 'request' : 'verify');
      return ui('otp', id === 'resend' ? 'verify' : id);
    case 'vouchers':
      if (['used', 'unlimited', 'penalty', 'exhausted'].includes(id)) return ui('vouchers', id);
      return ui('vouchers', stage < 2 && ['copy', 'copyDenied', 'expand'].includes(id) ? 'transfer' : id);
    case 'medical': return ui('medical', stage === 0 || stage === 1 && id === 'copy' ? 'default' : id === 'copy' && after ? 'copied' : 'selected');
    case 'banking':
      if (id === 'benefit') return ui(after ? 'bankingDetail' : 'banking', 'benefit');
      if (id === 'wealth') return ui('banking', 'wealth');
      if (id === 'converter') return ui('kurs', stage === 0 ? 'rates' : after ? 'swapped' : 'converter');
      return ui('kurs', stage === 0 || stage === 3 && id === 'invalidAmount' || after && id === 'refresh' ? 'rates' : id);
    case 'magazine':
      if (id === 'invalidIssue') return ui('login');
      if (['read', 'memberRead'].includes(id) && after) return ui('login');
      return ui('magazine', id === 'list' && after ? 'page2' : id === 'memberRead' ? 'member' : 'default');
    case 'branches':
      if (stage === 0 || stage === 3 && ['denied', 'unavailable', 'noPlace'].includes(id)) return ui('branches');
      if (stage === 1 && ['gps', 'denied', 'unavailable'].includes(id)) return ui('branches', 'primer');
      return ui('branches', id === 'place' && after ? 'placeSelected' : id);
    case 'contact':
      if (id === 'branch' && after) return ui('branches');
      return ui('contact', stage === 1 && ['channel', 'cancelDisclosure'].includes(id) ? 'disclosure' : id);
    case 'logout':
      if (id === 'back') return after ? ui('login') : ui('home');
      if (stage === 0 || id === 'cancel' && after) return ui('overview', stage === 0 && id !== 'segment' && id !== 'back' ? 'accountMenu' : 'default');
      if (stage === 1 || id === 'failure') return ui('logout');
      return ui('home', id === 'segment' ? 'individual' : 'default');
    case 'resilience':
      if (['period', 'download'].includes(id)) return ui('portfolio', stage < 2 ? 'tax' : id === 'download' ? 'notice' : 'year');
      if (id === 'fallback') return ui('home');
      if (id === 'pending') return ui('otp', after ? 'failure' : 'verify');
      return ui('home');
    case 'preview': return id === 'disabled' || id === 'correct' && stage === 3 ? ui('home') : id === 'idle' && stage === 0 ? ui('home') : ui('preview', after ? id : 'default');
    default: throw new Error(`Missing flow preview: ${journey.id}`);
  }
}
