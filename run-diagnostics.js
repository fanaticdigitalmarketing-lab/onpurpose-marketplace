const fs  = require('fs');
const { execSync } = require('child_process');
require('dotenv').config();

const PASS = (msg) => console.log('\x1b[32m  ✓ PASS\x1b[0m', msg);
const FAIL = (msg) => console.log('\x1b[31m  ✗ FAIL\x1b[0m', msg);
const HEAD = (msg) => console.log('\n\x1b[1m' + msg + '\x1b[0m');

let failCount = 0;
const fail = (msg) => { FAIL(msg); failCount++; };

HEAD('═══ OnPurpose Full System Diagnostic ═══');

// ── A. Syntax & Structure ─────────────────────────────────────────────
HEAD('A. Syntax & Structure');
try {
  execSync('node --check server.js', { stdio: 'pipe' });
  PASS('server.js syntax is clean');
} catch(e) {
  fail('server.js has syntax errors: ' + e.stderr.toString().trim());
}

const code  = fs.readFileSync('server.js', 'utf8');
const lines = code.split('\n');

// PORT declaration
const portDecls = lines.filter(l => /^\s*const PORT\s*=/.test(l));
portDecls.length === 1
  ? PASS('const PORT declared exactly once')
  : fail(`const PORT declared ${portDecls.length} times — delete the duplicate`);

// app.listen
const listens = lines.filter(l => l.includes('app.listen'));
listens.length === 1
  ? PASS('app.listen called exactly once')
  : fail(`app.listen called ${listens.length} times`);

// 0.0.0.0 binding
listens.some(l => l.includes("'0.0.0.0'") || l.includes('"0.0.0.0"'))
  ? PASS("app.listen binds to '0.0.0.0' (Railway requirement)")
  : fail("app.listen missing '0.0.0.0' — Railway cannot receive traffic");

// Git conflicts
const conflicts = lines.filter(l =>
  l.startsWith('<<<<<<<') || l.startsWith('>>>>>>>') || l === '=======');
conflicts.length === 0
  ? PASS('No git conflict markers found')
  : fail(`${conflicts.length} git conflict markers in server.js — resolve them`);

// Stripe before express.json
const stripeIdx  = lines.findIndex(l => l.includes('/api/webhooks/stripe'));
const jsonIdx    = lines.findIndex(l =>
  l.includes('express.json') && !l.includes('//'));
stripeIdx < jsonIdx
  ? PASS('Stripe webhook route registered before express.json()')
  : fail('Stripe webhook MUST be registered before express.json() — raw body required');

// CORS options handler
lines.some(l => l.includes("app.options('*'") || l.includes('app.options("*"'))
  ? PASS("CORS preflight handler app.options('*') present")
  : fail("Missing app.options('*', cors()) — CORS preflight requests will fail");

// module.exports
lines.some(l => l.trim() === 'module.exports = app;')
  ? PASS('module.exports = app present')
  : fail('Missing module.exports = app at end of server.js');

// ── B. Environment Variables ──────────────────────────────────────────
HEAD('B. Environment Variables');
const envChecks = [
  ['JWT_SECRET',           v => v && v.length >= 64,
    'Must be 64+ character hex string'],
  ['REFRESH_TOKEN_SECRET', v => v && v.length >= 32,
    'Must be set and at least 32 chars'],
  ['DATABASE_URL',         v => v && v.startsWith('postgres'),
    'Must be a PostgreSQL connection string'],
  ['NODE_ENV',             v => v === 'production',
    'Must be "production" on Railway'],
  ['CORS_ORIGINS',         v => v && v.includes('onpurpose.earth'),
    'Must include https://onpurpose.earth'],
  ['FRONTEND_URL',         v => v && v.includes('onpurpose.earth'),
    'Must be https://onpurpose.earth'],
  ['STRIPE_SECRET_KEY',    v => v && (v.startsWith('sk_live') || v.startsWith('sk_test')),
    'Must be a valid Stripe secret key'],
  ['STRIPE_WEBHOOK_SECRET',v => v && v.startsWith('whsec_'),
    'Must be a Stripe webhook secret (whsec_...)'],
  ['RESEND_API_KEY',       v => v && v.startsWith('re_'),
    'Must be a valid Resend API key (re_...)'],
  ['EMAIL_FROM',           v => !!v, 'Must be set'],
  ['BCRYPT_PEPPER',        v => !!v, 'Must be set'],
];
envChecks.forEach(([key, check, hint]) => {
  const val = process.env[key];
  check(val)
    ? PASS(`${key} = ${val.slice(0,8)}...`)
    : fail(`${key} — ${hint}`);
});

// ── C. Dependencies ───────────────────────────────────────────────────
HEAD('C. npm Dependencies');
const required = [
  'express','sequelize','pg','pg-hstore','bcrypt','jsonwebtoken',
  'cors','helmet','express-rate-limit','express-validator',
  'dotenv','resend','stripe','uuid','crypto'
];
required.forEach(dep => {
  try {
    require(dep);
    PASS(dep);
  } catch {
    fail(`${dep} not installed — run: npm install ${dep}`);
  }
});

// ── D. Critical Files ─────────────────────────────────────────────────
HEAD('D. File System');
const files = [
  ['server.js',                    'Main server file'],
  ['package.json',                 'Package config'],
  ['railway.toml',                 'Railway deployment config'],
  ['netlify.toml',                 'Netlify config'],
  ['Procfile',                     'Process file'],
  ['config/config.json',           'Sequelize config'],
  ['middleware/auth.js',           'Auth middleware'],
  ['middleware/security.js',       'Security middleware'],
  ['services/emailService.js',     'Email service'],
  ['services/trustScore.js',       'Trust score service'],
  ['routes/checkin.js',            'Check-in routes'],
  ['frontend/index.html',          'Homepage'],
  ['frontend/services.html',       'Services browse page'],
  ['frontend/dashboard.html',      'User dashboard'],
  ['frontend/provider.html',       'Provider onboarding'],
  ['frontend/contact.html',        'Contact page'],
  ['frontend/assets/logo.png',     'OnPurpose logo image'],
  ['frontend/_redirects',          'Netlify redirects'],
];
files.forEach(([f, desc]) => {
  fs.existsSync(f)
    ? PASS(`${f} — ${desc}`)
    : fail(`${f} MISSING — ${desc}`);
});

// ── E. Config File Correctness ────────────────────────────────────────
HEAD('E. Configuration Files');
try {
  const cfg  = JSON.parse(fs.readFileSync('config/config.json','utf8'));
  const prod = cfg.production;
  prod?.use_env_variable === 'DATABASE_URL'
    ? PASS('config/config.json production uses DATABASE_URL env var')
    : fail('config/config.json production section must use use_env_variable: DATABASE_URL');
  prod?.dialectOptions?.ssl?.rejectUnauthorized === false
    ? PASS('config/config.json has SSL rejectUnauthorized:false for Railway')
    : fail('config/config.json missing SSL config — Railway PostgreSQL requires it');
} catch(e) { fail('config/config.json missing or invalid JSON'); }

try {
  const pkg   = JSON.parse(fs.readFileSync('package.json','utf8'));
  const start = pkg.scripts?.start || '';
  start.includes('db:migrate') && start.includes('node server.js')
    ? PASS('package.json start runs migration then server')
    : fail(`package.json start="${start}" — must run db:migrate THEN node server.js`);
  pkg.engines?.node
    ? PASS(`package.json engines.node = ${pkg.engines.node}`)
    : fail('package.json missing engines.node field — set to ">=18.0.0"');
} catch { fail('package.json missing or invalid'); }

try {
  const rt = fs.readFileSync('railway.toml','utf8');
  rt.includes('healthcheckPath')
    ? PASS('railway.toml has healthcheckPath')
    : fail('railway.toml missing healthcheckPath = "/health"');
  const hasSecret = /JWT_SECRET|SECRET_KEY|PASSWORD|API_KEY/.test(rt);
  !hasSecret
    ? PASS('railway.toml contains no embedded secrets')
    : fail('CRITICAL: railway.toml contains secrets — REMOVE IMMEDIATELY and rotate them');
} catch { fail('railway.toml missing'); }

try {
  const nt = fs.readFileSync('netlify.toml','utf8');
  nt.includes('/api/*')
    ? PASS('netlify.toml proxies /api/* to Railway')
    : fail('netlify.toml missing /api/* proxy — API calls will 404');
  nt.includes('Authorization')
    ? PASS('netlify.toml passes Authorization header through proxy')
    : fail('netlify.toml not passing Authorization header — all authenticated API calls will fail');
  nt.includes('publish = "frontend"')
    ? PASS('netlify.toml publish = "frontend"')
    : fail('netlify.toml missing publish = "frontend"');
} catch { fail('netlify.toml missing'); }

// ── F. Frontend Quick Checks ──────────────────────────────────────────
HEAD('F. Frontend Asset Checks');
const htmlFiles = [
  'frontend/index.html',
  'frontend/services.html',
  'frontend/dashboard.html',
  'frontend/provider.html',
  'frontend/contact.html'
];
htmlFiles.forEach(f => {
  if (!fs.existsSync(f)) return;
  const html = fs.readFileSync(f,'utf8');
  const fname = f.split('/').pop();

  html.includes('/assets/logo.png')
    ? PASS(`${fname} uses real logo image`)
    : fail(`${fname} missing logo image — add <img src="/assets/logo.png">`);

  html.includes('op_token')
    ? PASS(`${fname} uses correct token key op_token`)
    : fail(`${fname} uses wrong token key — must be op_token not 'token'`);

  html.includes("'Playfair Display'")
    ? PASS(`${fname} uses Playfair Display font`)
    : fail(`${fname} missing Playfair Display font`);

  html.includes('#1a2744') || html.includes('--navy')
    ? PASS(`${fname} uses design system colors`)
    : fail(`${fname} may have incorrect colors — check against design system`);
});

// ── Summary ───────────────────────────────────────────────────────────
console.log('\n' + '═'.repeat(50));
if (failCount === 0) {
  console.log('\x1b[32m\n  ✓ ALL DIAGNOSTICS PASSED — System ready\n\x1b[0m');
} else {
  console.log(`\x1b[31m\n  ✗ ${failCount} FAILURE${failCount>1?'S':''} FOUND\x1b[0m`);
  console.log('  Fix every failure above before proceeding.\n');
  process.exit(1);
}
