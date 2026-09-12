const fs = require('fs');
const p = 'mvn-compile.log';
try {
  const s = fs.readFileSync(p, 'utf8');
  const lines = s.split(/\r?\n/);
  // show first, last, and last up to 80 lines to avoid truncation confusion
  console.log('TOTAL_LINES:', lines.length);
  console.log('---- LAST 240 ----');
  const last = lines.slice(-Math.min(240, lines.length));
  console.log(last.join('\n'));
} catch (e) {
  console.log('no log', e.message);
}
