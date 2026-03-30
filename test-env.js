console.log('Node.js version:', process.version);
console.log('Platform:', process.platform);
console.log('Architecture:', process.arch);
console.log('Current directory:', process.cwd());
console.log('Environment variables:', Object.keys(process.env).filter(key => 
  key.includes('NODE') || 
  key.includes('NPM') || 
  key.includes('PATH')
).reduce((obj, key) => ({
  ...obj,
  [key]: process.env[key]
}), {}));
