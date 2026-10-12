/** Regenerate the asset inventory after adding artwork or changing inline icons. */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import ts from 'typescript';
import sharp from 'sharp';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import * as lucide from 'lucide-react';
import { execFileSync } from 'node:child_process';
execFileSync('python3', ['scripts/build-unified-icons.py'], { stdio: 'inherit' });
const iconRecords = JSON.parse(fs.readFileSync('src/components/icons/icon-source-data.json', 'utf8'));
const walk = dir => fs.readdirSync(dir, {withFileTypes:true}).flatMap(e => e.isDirectory() ? walk(path.join(dir,e.name)) : [path.join(dir,e.name)]);
const hash = value => crypto.createHash('sha256').update(value).digest('hex').slice(0,16);
const out = 'public/assets/asset-bank/icons';
fs.mkdirSync(out,{recursive:true});
const thumbnails = 'public/assets/asset-bank/thumbnails';
fs.mkdirSync(thumbnails,{recursive:true});
const inline = new Map();
const escape = value => String(value).replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;');
const literal = node => ts.isStringLiteral(node) || ts.isNumericLiteral(node) ? node.text : node.kind === ts.SyntaxKind.TrueKeyword ? 'true' : node.kind === ts.SyntaxKind.FalseKeyword ? 'false' : undefined;
function svgMarkup(node) {
  if(ts.isJsxText(node)) return node.text.trim() ? escape(node.text.trim()) : '';
  if(ts.isJsxExpression(node)) { const value=node.expression && literal(node.expression); if(value === undefined) throw Error('dynamic'); return escape(value); }
  if(!ts.isJsxElement(node) && !ts.isJsxSelfClosingElement(node)) throw Error('dynamic');
  const opening=ts.isJsxElement(node) ? node.openingElement : node;
  const tag=opening.tagName.getText();
  if(!/^[a-z]+$/.test(tag)) throw Error('component');
  const attrs=[];
  for(const attr of opening.attributes.properties) {
    if(ts.isJsxSpreadAttribute(attr)) throw Error('spread');
    const name=attr.name.getText();
    if(['className','style','role','tabIndex','width','height'].includes(name) || name.startsWith('aria-') || name.startsWith('on')) continue;
    let value = attr.initializer ? ts.isStringLiteral(attr.initializer) ? attr.initializer.text : ts.isJsxExpression(attr.initializer) && attr.initializer.expression ? literal(attr.initializer.expression) : undefined : '';
    if(value === undefined) throw Error('dynamic');
    const xmlName = ['viewBox','preserveAspectRatio','xmlns'].includes(name) ? name : name.replace(/[A-Z]/g,m=>'-'+m.toLowerCase());
    attrs.push(`${xmlName}="${escape(value)}"`);
  }
  if(tag==='svg' && !attrs.some(a=>a.startsWith('xmlns='))) attrs.push('xmlns="http://www.w3.org/2000/svg"');
  return `<${tag} ${attrs.join(' ')}>${ts.isJsxElement(node) ? node.children.map(svgMarkup).join('') : ''}</${tag}>`;
}
const sources=walk('src').filter(p=>/\.(tsx?|css)$/.test(p) && !p.includes('/catalog/') && !p.includes('/asset-bank/'));
// Inventory belongs to the two private-banking experiences, not the general site.
const isBrandSource = file => /\/(prioritas|solitaire|member)\//.test(file);
const sharedIconSources = new Set([
  'src/components/ui/TextField.tsx', 'src/components/ui/InfoTip.tsx',
  'src/components/ui/LocaleSwitcher.tsx', 'src/components/home/SectionAnchor.tsx',
  'src/components/home/SoliprioSegmentSelector.tsx', 'src/components/home/BackToTop.tsx',
]);
const scopedSources = sources.filter(file => isBrandSource(file) || sharedIconSources.has(file));
const sharedArtwork = new Set(['/assets/cycle1/bca-logo.svg']);
const redirects = JSON.parse(fs.readFileSync('src/components/asset-bank/asset-redirects.json', 'utf8'));
const curated = {
  '/assets/solitaire/banking-solution/background.webp': { labelKey: 'backgroundBankingSolitaire', group: 'decorations' },
  '/assets/solitaire/event-promo/background.webp': { labelKey: 'backgroundEventSolitaire', group: 'decorations' },
  '/assets/solitaire/privilege/background.webp': { labelKey: 'wavePrivilegeSolitaire', group: 'decorations' },
  '/assets/prioritas/banking-solution/content-decoration.webp': { labelKey: 'backgroundPageSolitaire', group: 'decorations', brand: 'solitaire' },
  '/assets/prioritas/member-overview/decoration.webp': { labelKey: 'backgroundPagePrioritas', group: 'decorations' },
  '/assets/member-login/login-background.webp': { labelKey: 'backgroundMemberLogin', group: 'decorations' },
  '/assets/prioritas/card/prio-glow.webp': { labelKey: 'glowPrioritas', group: 'decorations' },
  '/assets/prioritas/financial-report/otp-email.svg': { labelKey: 'otpEmailPrioritas', group: 'financial', priority: 2 },
  '/assets/solitaire/financial-report/otp-email.svg': { labelKey: 'otpEmailSolitaire', group: 'financial', priority: 3 },
  '/assets/soliprio/personal-banker.webp': { labelKey: 'personalBanker', group: 'banking' },
  '/assets/prioritas/financial/decoration-art-pgold-300.webp': { labelKey: 'visualGold', group: 'products', priority: 4 },
  '/assets/prioritas/financial/decoration-art.webp': { labelKey: 'visualGrey', group: 'products', brand: 'solitaire', priority: 5 },
  '/assets/prioritas/hero-banner.webp': { labelKey: 'heroPrioritas', group: 'hero', priority: 0 },
  '/assets/soliprio/solitaire-image.webp': { labelKey: 'heroSolitaire', group: 'hero', brand: 'solitaire', priority: 1 },
  '/assets/prioritas/card/prio-card.webp': { labelKey: 'cardPrioritas', group: 'products', priority: 0 },
  '/assets/solitaire/solitaire-card.webp': { labelKey: 'cardSolitaire', group: 'products', priority: 1 },
  '/assets/prioritas/financial/background.webp': { labelKey: 'financialPrioritas', group: 'financial', priority: 0 },
  '/assets/solitaire/financial-report/background.webp': { labelKey: 'financialSolitaire', group: 'financial', priority: 1 },
  '/assets/cycle1/bca-logo.svg': { labelKey: 'logoBca', group: 'logos', priority: 0, previewTone: 'dark' },
  '/assets/prioritas/logo.svg': { labelKey: 'logoPrioritas', group: 'logos', priority: 1 },
  '/assets/soliprio/solitaire-logo.svg': { labelKey: 'logoSolitaire', group: 'logos', brand: 'solitaire', priority: 2, previewTone: 'dark' },
  '/assets/solitaire/privilege/health-source.webp': { labelKey: 'health', group: 'illustrations', brand: 'shared', priority: 0 },
  '/assets/prioritas/privilege/lounge.webp': { labelKey: 'loungePrioritas', group: 'illustrations', priority: 1 },
  '/assets/solitaire/privilege/lounge-source.webp': { labelKey: 'loungeSolitaire', group: 'illustrations', priority: 2 },
  '/assets/prioritas/privilege/event.webp': { labelKey: 'eventPrioritas', group: 'illustrations', priority: 3 },
  '/assets/solitaire/privilege/event-source.webp': { labelKey: 'eventSolitaire', group: 'illustrations', priority: 4 },
};
const excluded = new Set([
  // Unused legacy card mask; retain the original file outside the inventory.
  '/assets/prioritas/card/visual-mask-a.webp',
  // Used by the general homepage's Soliprio section, outside the brand pages.
  '/assets/soliprio/soliprio-pattern.svg',
  '/assets/prioritas/banking-solution/bg-decoration-1.svg',
  '/assets/prioritas/event-promo/bg-decoration-2.svg',
  '/assets/prioritas/privilege/decoration.svg',

  '/prioritas-icon.svg', '/solitaire-icon.svg',
  '/assets/prioritas/member-overview/signature-padel.webp',
  '/assets/prioritas/member-overview/signature-prodia.webp',
  '/assets/prioritas/banking-solution/content-decoration-mask.svg',
  '/assets/prioritas/financial-report/otp-envelope.svg',
  '/assets/prioritas/financial/raw-3.png', '/assets/prioritas/financial/raw-4.png',
  '/assets/prioritas/member-airport-transfer/goldenbird-2m.png',
  '/assets/prioritas/member-airport-transfer/goldenbird-750k.png',
]);
// Retain shared file icons only when a branded page/component explicitly uses them.
for (const file of scopedSources) {
  for (const match of fs.readFileSync(file, 'utf8').matchAll(/\/assets\/[^\s"'`()<>{}]+\.svg/g)) sharedArtwork.add(match[0]);
}
for(const file of scopedSources.filter(p=>p.endsWith('.tsx'))) {
  const source=ts.createSourceFile(file,fs.readFileSync(file,'utf8'),ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);
  function record(svg,name) { const id=hash(svg); const current=inline.get(id); if(current) current.sources.push(file); else inline.set(id,{svg,name,sources:[file]}); }
  for(const statement of source.statements) {
    if(ts.isImportDeclaration(statement) && statement.moduleSpecifier.text==='lucide-react') {
      for(const spec of statement.importClause?.namedBindings?.elements ?? []) { const name=spec.propertyName?.text ?? spec.name.text; if(lucide[name]) record(renderToStaticMarkup(React.createElement(lucide[name])),name); }
    }
  }
  function visit(node) {
    if((ts.isJsxElement(node) ? node.openingElement.tagName.getText(source) : ts.isJsxSelfClosingElement(node) ? node.tagName.getText(source) : '') === 'svg') {
      try { const svg=svgMarkup(node); if(/<(path|circle|rect|line|polyline|polygon|ellipse)\b/.test(svg)) { let parent=node; while(parent.parent && !ts.isFunctionDeclaration(parent) && !ts.isVariableDeclaration(parent)) parent=parent.parent; const name=parent.name?.getText(source) ?? path.basename(file,'.tsx'); record(svg,name); }} catch { /* Interactive charts and dynamic artwork remain owned by their components. */ }
      return;
    }
    ts.forEachChild(node,visit);
  }
  visit(source);
}
for(const [id,item] of inline) fs.writeFileSync(`${out}/${item.name.replace(/[^a-zA-Z0-9-]/g,'-')}-${id}.svg`,item.svg);
const inlineSources=new Map([...inline].map(([id,item])=>[`${out}/${item.name.replace(/[^a-zA-Z0-9-]/g,'-')}-${id}.svg`,item]));
const bankingText=fs.readFileSync('src/components/prioritas/banking-privilege-data.ts','utf8').replaceAll('${root}','/assets/prioritas/banking-solution').replaceAll('${banking}','/assets/prioritas/banking');
const bankingImages=new Set([...bankingText.matchAll(/image: [`"]([^`"]+)/g)].map(m=>m[1]));
const pageBackgroundReferences = sources.filter(file => /BrandPage(Surface|Background)|MemberPageSurface/.test(fs.readFileSync(file, 'utf8')));
const privilegeReferences = new Map();
const privilegeRegistry = fs.readFileSync('src/components/prioritas/privilege-assets.ts', 'utf8');
for (const [, key, assetPath] of privilegeRegistry.matchAll(/(\w+): "([^\"]+)"/g)) {
  privilegeReferences.set(assetPath, sources.filter(file => fs.readFileSync(file, 'utf8').includes(`privilegeArtwork.${key}`)));
}
function include(file) {
  if(!/\.(svg|png|jpe?g|webp|gif|avif|ico)$/i.test(file) || file.includes('/asset-bank/thumbnails/')) return false;
  const assetPath = file.slice(6);
  if (redirects[assetPath] || excluded.has(assetPath)) return false;
  if (/logo(?=[-/.]|$)/.test(file) && !curated[assetPath]) return false;
  if (/\/magazine\//.test(file)) return false;
  if (/\/banking-solution\/(house-view|weekly-market|market-|wealth-card-overlay)/.test(file) || /\/banking\/wealth-/.test(file)) return false;
  if(/\/(ads|partners|partner-logos|source-promo|signature-privilege)\//.test(file)) return false;
  if(/\/detail\//.test(file) && !file.endsWith('.svg')) return false;
  if(/\/solitaire\/event-promo\//.test(file) && !/background/.test(file)) return false;
  if(/\/promo\/(card\d|event-banner)/.test(file) || /\/promo-page\/campaigns\//.test(file)) return false;
  return /^public\/assets\/(prioritas|solitaire|soliprio|member-login|icons)\//.test(file)
    || ['public/prioritas-icon.svg', 'public/solitaire-icon.svg'].includes(file)
    || inlineSources.has(file)
    || sharedArtwork.has(file.slice(6));
}
function group(file) {
  if(curated[file.slice(6)]) return curated[file.slice(6)].group;
  if(file.startsWith('public/assets/icons/')) return 'icons';
  if(/\/member-overview\/signature-.*\.webp$/.test(file)) return 'illustrations';
  if(file.includes('/asset-bank/icons/')) return 'icons';
  if(/financial/.test(file)) return 'financial';
  if(bankingImages.has(file.slice(6))) return 'banking';
  if(/logo(?=[-/.]|$)/.test(file)) return 'logos';
  if(/flags\/|flag-/.test(file)) return 'flags';
  if(/decoration|background|pattern|mask|glow|confetti|gradien|bg-/.test(file)) return 'decorations';
  if(/\.svg$/.test(file) || /icon|\/member-overview\//.test(file)) return 'icons';
  if(/\/card\//.test(file)) return 'products';
  if(/hero|\/soliprio\/(prioritas|solitaire)-image/.test(file)) return 'hero';
  if(/card|\/product\/|\/megamenu\/|\/banking-solution\/|\/banking\//.test(file)) return 'products';
  return 'illustrations';
}
const items=[];
for(const file of walk('public').filter(include).sort()) {
  const buffer=fs.readFileSync(file);
  let meta={}; try {meta=await sharp(buffer).metadata();} catch { /* ICO retains its original format. */ }
  const embedded=inlineSources.get(file);
  const references=embedded?.sources ?? scopedSources.filter(p=>fs.readFileSync(p,'utf8').includes(file.slice(6)));
  if (file.startsWith('public/assets/icons/')) {
    const legacy = iconRecords.filter(record => `/assets/icons/${record.name}.svg` === file.slice(6));
    references.push(...legacy.flatMap(record => record.sources), ...sources.filter(p => legacy.some(record => fs.readFileSync(p,'utf8').includes(record.path))));
  }
  references.push(...privilegeReferences.get(file.slice(6)) ?? []);
  if (['/assets/prioritas/member-overview/decoration.webp', '/assets/prioritas/banking-solution/content-decoration.webp'].includes(file.slice(6))) references.push(...pageBackgroundReferences);
  if(bankingImages.has(file.slice(6))) references.push('src/components/prioritas/banking-privilege-data.ts');
  let thumbnail=file.slice(6);
  if(meta.width && meta.height && (path.extname(file) !== '.svg' || buffer.length > 100000)) {
    const thumbPath=`${thumbnails}/${hash(file)}.webp`;
    await sharp(buffer).resize({width:480,height:360,fit:'inside',withoutEnlargement:true}).webp({quality:78}).toFile(thumbPath);
    thumbnail=thumbPath.slice(6);
  }
  const format=path.extname(file).slice(1).toUpperCase();
  const brand=/solitaire/.test(file) ? 'solitaire' : /prioritas/.test(file) ? 'prioritas' : /soliprio/.test(file) ? 'shared' : references.length && references.every(p=>p.includes('/prioritas/')) ? 'prioritas' : 'shared';
  items.push({id:hash(file),name:embedded?.name ?? path.basename(file,path.extname(file)).replace(/[-_]/g,' '),path:file.slice(6),thumbnail,group:group(file),brand,format,width:meta.width ?? null,height:meta.height ?? null,bytes:buffer.length,sources:[...new Set(references)],inline:!!embedded,...curated[file.slice(6)]});
}
// Keep the main imagery first; filenames remain searchable without renaming originals.
const order=['hero','banking','financial','logos','icons','decorations','products','illustrations','flags'];
items.sort((a,b)=>order.indexOf(a.group)-order.indexOf(b.group)||(a.priority ?? 100)-(b.priority ?? 100)||a.name.localeCompare(b.name));
fs.writeFileSync('src/components/asset-bank/asset-manifest.json',JSON.stringify(items,null,2)+'\n');
const aliases = Object.fromEntries(Object.entries(redirects).filter(([, to]) => items.some(item => item.path === to)).map(([from, to]) => [hash('public' + from), hash('public' + to)]));
for (const [from, to] of Object.entries(redirects)) {
  if (!fs.existsSync('public' + to) || redirects[to]) throw new Error(`Invalid canonical asset redirect: ${from} -> ${to}`);
}
fs.writeFileSync('src/components/asset-bank/asset-aliases.json', JSON.stringify(aliases, null, 2) + '\n');
// Remove only obsolete generated previews/exports, never original artwork.
const generatedFiles = new Set(items.flatMap(item => ['public' + item.path, 'public' + item.thumbnail]));
for (const file of [...walk(out), ...walk(thumbnails)]) if (!generatedFiles.has(file)) fs.unlinkSync(file);
console.log(`Asset bank: ${items.length} assets, including ${inline.size} inline icons.`,Object.fromEntries(order.map(g=>[g,items.filter(x=>x.group===g).length])));
