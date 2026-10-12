/** Standalone export of the same sRGB grayscale used by CSS grayscale(1). */
import fs from 'node:fs';
import path from 'node:path';

const source = 'public/assets/prioritas/financial-report/otp-email.svg';
const destination = 'public/assets/solitaire/financial-report/otp-email.svg';
const svg = fs.readFileSync(source, 'utf8');
const opening = svg.indexOf('>') + 1;
const defs = svg.indexOf('<defs>');
if (!opening || defs < opening) throw Error('Unexpected OTP SVG structure');
const grayscale = '<filter id="solitaire-grayscale" filterUnits="userSpaceOnUse" x="0" y="0" width="80" height="80" color-interpolation-filters="sRGB"><feColorMatrix type="saturate" values="0"/></filter>';
const exported = svg.slice(0, opening)
  + '\n<g filter="url(#solitaire-grayscale)">'
  + svg.slice(opening, defs)
  + '</g>\n'
  + svg.slice(defs).replace('<defs>', '<defs>\n' + grayscale);
fs.mkdirSync(path.dirname(destination), { recursive: true });
fs.writeFileSync(destination, exported);
console.log(`Exported standalone Solitaire OTP SVG: ${destination}`);
