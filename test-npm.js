console.log('Node.js version:', process.version);
console.log('npm version:', require('child_process').execSync('npm -v').toString().trim());
console.log('Current directory:', process.cwd());
console.log('Test successful!');
