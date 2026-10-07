const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const cp = require('node:child_process');

// Keep local assets live while making third-party integrations deterministic.
function isolateNetwork(page) {
  return page.route('**/*', route => new URL(route.request().url()).hostname === '127.0.0.1'
    ? route.continue() : route.fulfill({ status: 200, body: '', contentType: 'text/plain' }));
}

function copySource(prefix) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), prefix));
  fs.cpSync('source', path.join(root, 'source'), { recursive: true });
  return root;
}

// Callers own fixture edits and cleanup; errors retain the complete build log.
function buildSource(root, { config = path.resolve('_config.yml'), destination = 'public' } = {}) {
  const output = path.join(root, destination);
  const result = cp.spawnSync('bundle', ['exec', 'jekyll', 'build', '--trace', '--config', config,
    '--source', path.join(root, 'source'), '--destination', output], { encoding: 'utf8', env: process.env });
  if (result.status !== 0) throw new Error(result.stdout + '\n' + result.stderr);
  return output;
}

module.exports = { isolateNetwork, copySource, buildSource };
