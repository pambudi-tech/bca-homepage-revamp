export const assetGroups = ['hero', 'banking', 'financial', 'logos', 'icons', 'decorations', 'products', 'illustrations', 'flags'] as const;
export type AssetGroup = typeof assetGroups[number];
export type Asset = {
  id: string; name: string; labelKey?: string; previewTone?: string; path: string; thumbnail: string; group: string; brand: string; format: string;
  width: number | null; height: number | null; bytes: number; sources: string[]; inline: boolean;
};
export const assetUrl = (asset: Asset, thumbnail = false) => (thumbnail ? asset.thumbnail : asset.path).split('/').map(encodeURIComponent).join('/');
export const assetSize = (asset: Asset) => asset.width && asset.height ? `${asset.width} × ${asset.height}` : '—';
export const fileSize = (bytes: number) => bytes < 1024 ? `${bytes} B` : bytes < 1048576 ? `${(bytes / 1024).toFixed(1)} KB` : `${(bytes / 1048576).toFixed(1)} MB`;
