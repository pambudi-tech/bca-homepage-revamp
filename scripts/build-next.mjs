import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const env = { ...process.env };
// Vercel may inject the Next 16 adapter. Its Build Output v3 is bundled later
// by the platform, so it cannot be counted by our legacy Lambda budget check.
// Produce standard Next output in both environments. Vercel's builder also
// supports this path and bundles it into the same Lambda objects we validate.
delete env.NEXT_ADAPTER_PATH;
const result = spawnSync(process.execPath, [require.resolve('next/dist/bin/next'), 'build', '--webpack'], {
  env,
  stdio: 'inherit',
});
if (result.error) throw result.error;
if (result.signal) {
  console.error(`Next build terminated by ${result.signal}`);
  process.exitCode = 1;
} else {
  process.exitCode = result.status ?? 1;
}
