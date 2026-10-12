export type MapBrand = 'prioritas' | 'solitaire';
export type MapArea = 'public' | 'member';
export type NodeKind = 'home' | 'directory' | 'detail' | 'information' | 'login' | 'tab';

export type SiteOrigin = {
  status: 'retained' | 'renamed' | 'split' | 'combined' | 'new' | 'newPage' | 'moved';
  note: string;
  previousName?: string;
  sources: Array<{ label: string; href: string }>;
};

export type SiteNode = {
  id: string;
  label: string;
  kind: NodeKind;
  brand: MapBrand;
  area: MapArea;
  path: string;
  href: string;
  origin?: SiteOrigin;
  note?: 'otp' | 'voucher' | 'magazine' | 'login' | 'wealth';
  children?: SiteNode[];
};

export function flattenNodes(nodes: SiteNode[]): SiteNode[] {
  return nodes.flatMap(node => [node, ...flattenNodes(node.children ?? [])]);
}

export function findTrail(nodes: SiteNode[], id: string): SiteNode[] {
  for (const node of nodes) {
    if (node.id === id) return [node];
    const trail = findTrail(node.children ?? [], id);
    if (trail.length) return [node, ...trail];
  }
  return [];
}
