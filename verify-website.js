const fs  = require('fs');
const { execSync } = require('child_process');
require('dotenv').config();

const OK   = s => console.log('\x1b[32m  ✓\x1b[0m', s);
const FAIL = s => { console.log('\x1b[31m  ✗\x1b[0m', s); fails++; };
let fails = 0;
const section = s => console.log('\n\x1b[1m' + s + '\x1b[0m');

console.log('\n══ OnPurpose Website Pre-Flight Scan ══\n');

section('Server Integrity');
try {
  execSync('node --check server.js', { stdio:'pipe' });
  OK('server.js syntax clean');
} catch(e) { FAIL('server.js syntax error: ' + e.stderr.toString()); }

const sv = fs.readFileSync('server.js','utf8');
const sl = sv.split('\n');
sl.filter(l=>/^\s*const PORT\s*=/.test(l)).length===1
  ? OK('PORT declared once') : FAIL('PORT declared multiple times');
sl.filter(l=>l.includes('app.listen')).length===1
  ? OK('app.listen called once') : FAIL('app.listen called multiple times');
sl.some(l=>l.includes("'0.0.0.0'"))
  ? OK("Binds to '0.0.0.0'") : FAIL("Missing '0.0.0.0' binding");
!sv.includes('<<<<<<<')
  ? OK('No git conflict markers') : FAIL('Git conflict markers found');
sl.some(l=>l.includes("app.options('*'"))
  ? OK('CORS preflight handler present') : FAIL('Missing CORS preflight');

section('Environment');
[['JWT_SECRET',v=>v&&v.length>=64,'64+ char hex string'],
 ['DATABASE_URL',v=>v&&v.startsWith('postgres'),'PostgreSQL URL'],
 ['CORS_ORIGINS',v=>v&&v.includes('onpurpose.earth'),'Must include domain'],
 ['STRIPE_SECRET_KEY',v=>v&&(v.startsWith('sk_live')||v.startsWith('sk_test')),'Stripe key'],
 ['RESEND_API_KEY',v=>v&&v.startsWith('re_'),'Resend key'],
].forEach(([k,fn,hint])=>{
  const v=process.env[k];
  fn(v) ? OK(`${k} set`) : FAIL(`${k} — ${hint}`);
});

section('Required Files');
['server.js','package.json','railway.toml','netlify.toml','Procfile',
 'config/config.json','middleware/auth.js','middleware/security.js',
 'services/emailService.js','services/trustScore.js',
 'frontend/index.html','frontend/services.html','frontend/dashboard.html',
 'frontend/provider.html','frontend/contact.html',
 'frontend/assets/logo.png','frontend/_redirects'
].forEach(f=>fs.existsSync(f)?OK(f):FAIL(f+' MISSING'));

section('Frontend Health');
['frontend/index.html','frontend/services.html',
 'frontend/dashboard.html'].forEach(f=>{
  if(!fs.existsSync(f))return;
  const h=fs.readFileSync(f,'utf8'), n=f.split('/').pop();
  h.includes('/assets/logo.png') ? OK(`${n} has logo`) : FAIL(`${n} missing logo`);
  h.includes('op_token') ? OK(`${n} uses op_token key`) : FAIL(`${n} wrong token key`);
  h.includes('Playfair Display') ? OK(`${n} has Playfair Display`) : FAIL(`${n} missing font`);
});

console.log('\n' + '═'.repeat(46));
if(fails===0){
  console.log('\x1b[32m  ✓ All checks passed. Website is healthy.\x1b[0m\n');
  process.exit(0);
} else {
  console.log(`\x1b[31m  ✗ ${fails} failure(s). Fix before proceeding.\x1b[0m\n`);
  process.exit(1);
}
