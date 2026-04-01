const fs = require('fs');
const { execSync } = require('child_process');
require('dotenv').config();

const ok  = m => console.log('\x1b[32m✓\x1b[0m', m);
const bad = m => console.log('\x1b[31m✗\x1b[0m', m);

// Syntax
try { execSync('node --check server.js',{stdio:'pipe'}); ok('server.js syntax clean'); }
catch(e){ bad('server.js SYNTAX ERROR: ' + e.stderr.toString().trim()); }

// Duplicate PORT
const lines = fs.readFileSync('server.js','utf8').split('\n');
const ports = lines.filter(l=>/^\s*const PORT\s*=/.test(l));
ports.length===1 ? ok('PORT declared once') : bad('PORT declared '+ports.length+' times — fix this');

// app.listen
const listens = lines.filter(l=>l.includes('app.listen'));
listens.length===1 ? ok('app.listen once') : bad('app.listen called '+listens.length+' times');

// 0.0.0.0
lines.some(l=>l.includes("'0.0.0.0'"))
  ? ok("app.listen binds to '0.0.0.0'")
  : bad("app.listen missing '0.0.0.0' — Railway cannot receive traffic");

// Conflicts
const conflicts = lines.filter(l=>l.startsWith('<<<<<<<')||l.startsWith('>>>>>>>'));
conflicts.length===0 ? ok('No git conflict markers') : bad(conflicts.length+' conflict markers — resolve them');

// Env vars
const needed = ['JWT_SECRET','REFRESH_TOKEN_SECRET','DATABASE_URL',
  'NODE_ENV','CORS_ORIGINS','STRIPE_SECRET_KEY','RESEND_API_KEY'];
needed.forEach(k=>{
  const v=process.env[k];
  if(!v){ bad(k+' — MISSING from environment'); }
  else if(k==='JWT_SECRET'&&v.length<32){ bad(k+' — too short (need 32+ chars)'); }
  else { ok(k+' set'); }
});

// Critical files
['server.js','package.json','railway.toml','netlify.toml',
 'config/config.json','services/emailService.js',
 'index.html','frontend/services.html',
 'frontend/dashboard.html','assets/logo.png'
].forEach(f=>{
  fs.existsSync(f)?ok(f):bad(f+' MISSING');
});

// netlify.toml proxy
try{
  const nt=fs.readFileSync('netlify.toml','utf8');
  nt.includes('/api/*')?ok('netlify.toml proxies /api/*')
    :bad('netlify.toml missing /api/* proxy — API calls will 404');
  nt.includes('Authorization')?ok('netlify.toml passes Authorization header')
    :bad('netlify.toml strips Authorization — auth will fail');
}catch{bad('netlify.toml missing');}

// config.json
try{
  const cfg=JSON.parse(fs.readFileSync('config/config.json','utf8'));
  cfg.production?.use_env_variable==='DATABASE_URL'
    ?ok('config.json uses DATABASE_URL')
    :bad('config.json must use use_env_variable: DATABASE_URL');
}catch{bad('config/config.json missing or invalid JSON');}
