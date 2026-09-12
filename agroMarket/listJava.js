const { execSync } = require('child_process');

const ps = 'powershell -Command "Get-WmiObject Win32_Process | Where-Object { $_.Name -eq ' + "'java.exe'" + ' } | Select-Object -ExpandProperty CommandLine"';
console.log('CMD:', ps);
try {
  console.log(execSync(ps, { encoding: 'utf8', timeout: 12000 }));
} catch (e) {
  console.log('ERR', e.message);
}
