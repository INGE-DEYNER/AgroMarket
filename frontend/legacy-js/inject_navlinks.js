const fs = require('fs');
const path = require('path');

const dir = __dirname;
const files = fs.readdirSync(dir).filter(f => f.endsWith('.html'));

files.forEach(file => {
  let content = fs.readFileSync(path.join(dir, file), 'utf8');
  content = content.replace(/<div class="navbar-links">/g, '<div class="navbar-links" id="navLinks">');
  fs.writeFileSync(path.join(dir, file), content);
});
