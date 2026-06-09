const fs = require('fs');
const path = require('path');

const dir = __dirname;
const htmlFiles = fs.readdirSync(dir).filter(f => f.endsWith('.html'));

for (const file of htmlFiles) {
  let content = fs.readFileSync(path.join(dir, file), 'utf8');

  // Add id="navActions" to navbar-right if it exists
  content = content.replace(/<div class="navbar-right">/g, '<div class="navbar-right" id="navActions">');

  // Remove existing injections if we run this multiple times
  content = content.replace(/<script src="js\/auth\.js"><\/script>\s*/g, '');
  content = content.replace(/<script src="js\/cart\.js"><\/script>\s*/g, '');
  content = content.replace(/<script src="js\/navbar\.js"><\/script>\s*/g, '');

  // Inject scripts before the first existing script or before </body>
  const scriptTags = `
    <script src="js/auth.js"></script>
    <script src="js/cart.js"></script>
    <script src="js/navbar.js"></script>
`;
  
  if (content.includes('<script src="js/')) {
    content = content.replace(/<script src="js\//, scriptTags.trim() + '\n    <script src="js/');
  } else {
    content = content.replace(/<\/body>/, scriptTags + '  </body>');
  }

  fs.writeFileSync(path.join(dir, file), content);
  console.log(`Injected scripts into ${file}`);
}
