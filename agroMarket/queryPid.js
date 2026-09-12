const { execSync } = require('child_process');

// PID of the running Maven process
const pid = '36116';

// Build a PowerShell command to extract the CommandLine of that PID
// Use single quotes inside the PowerShell snippet so Node doesn't fight with quotes
const psCommand =
  'powershell -NoProfile -Command \"' +
  '(Get-WmiObject Win32_Process -Filter \"ProcessId=' + pid + '\").CommandLine' +
  '\"';

console.log('Running:', psCommand);

try {
  const out = execSync(psCommand, { encoding: 'utf8', timeout: 10000 });
  console.log('OUT:', out.trim());
} catch (e) {
  console.log('ERROR:', e.message);
}
