const fs = require('fs');
const path = require('path');

const dir = __dirname;
const files = fs.readdirSync(dir).filter(f => f.endsWith('.html'));

files.forEach(file => {
  let content = fs.readFileSync(path.join(dir, file), 'utf8');
  
  // Remove existing auth guard if present to avoid duplication
  content = content.replace(/<script>\s*Auth\.requireRole\([^)]+\);\s*<\/script>\s*/g, '');
  
  let roleCheck = '';
  if (file === 'admin.html') roleCheck = "['admin']";
  else if (file === 'dashboard-productor.html') roleCheck = "['productor', 'admin']";
  else if (file === 'dashboard-comprador.html') roleCheck = "['comprador', 'admin']";
  else if (['pedidos.html', 'catalogo.html', 'resenas.html'].includes(file)) roleCheck = "['comprador', 'productor', 'admin']";
  else if (['mensajeria.html', 'envios.html'].includes(file)) roleCheck = "['comprador', 'productor', 'admin']";

  if (roleCheck) {
    const script = `\n    <script>Auth.requireRole(${roleCheck});</script>\n  </body>`;
    content = content.replace(/\s*<\/body>/, script);
    fs.writeFileSync(path.join(dir, file), content);
    console.log(`Added auth guard to ${file}`);
  }
});
