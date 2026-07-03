const { spawn } = require('child_process');

const nodeVersion = process.versions.node.split('.').map(Number);
const env = { ...process.env };

// Node 22+ enables `--experimental-detect-module` by default, which breaks
// ESM resolution in CJS files (like in expo-image config plugins) due to extensionless imports.
if (nodeVersion[0] >= 22) {
  env.NODE_OPTIONS = `${env.NODE_OPTIONS || ''} --no-experimental-detect-module`.trim();
} else {
  env.NODE_OPTIONS = `${env.NODE_OPTIONS || ''} --experimental-specifier-resolution=node`.trim();
}

console.log('Setting NODE_OPTIONS to:', env.NODE_OPTIONS);

const args = process.argv.slice(2);
const isWindows = process.platform === 'win32';
const cmd = isWindows ? 'npx.cmd' : 'npx';

const child = spawn(cmd, ['expo', 'start', ...args], {
  stdio: 'inherit',
  shell: true,
  env
});

child.on('exit', (code) => {
  process.exit(code || 0);
});

child.on('error', (err) => {
  console.error('Failed to start Expo process:', err);
  process.exit(1);
});
