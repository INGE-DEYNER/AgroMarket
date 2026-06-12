const fs = require('fs');
const path = require('path');

// 1. Crear el hook useStyles
const hookDir = 'C:\\Users\\Deyner Chaverra\\Asafrut\\AgroMarket\\frontend\\src\\hooks';
const hookPath = path.join(hookDir, 'useStyles.js');
const hookContent = `import { useEffect } from 'react';

export default function useStyles(stylesArray) {
  useEffect(() => {
    const links = [];
    stylesArray.forEach((href) => {
      let link = document.querySelector(\`link[href="\${href}"]\`);
      if (!link) {
        link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = href;
        document.head.appendChild(link);
      }
      links.push(link);
    });

    return () => {
      links.forEach((link) => {
        if (link && link.parentNode) {
          link.parentNode.removeChild(link);
        }
      });
    };
  }, [stylesArray]);
}
`;
fs.writeFileSync(hookPath, hookContent);

// 2. Modificar los componentes para usar el hook
const pagesDir = 'C:\\Users\\Deyner Chaverra\\Asafrut\\AgroMarket\\frontend\\src\\pages';
const files = fs.readdirSync(pagesDir);

const cssMap = {
  'Home.jsx': ['/css/home.css'],
  'Login.jsx': ['/css/login.css'],
  'Registro.jsx': ['/css/registro.css'],
  'VerificarCorreo.jsx': ['/css/login.css'],
  'RecuperarContrasena.jsx': ['/css/login.css'],
  'RestablecerContrasena.jsx': ['/css/login.css'],
  'Catalogo.jsx': ['/css/styles.css', '/css/catalogo.css'],
  'DashboardComprador.jsx': ['/css/styles.css'],
  'DashboardProductor.jsx': ['/css/styles.css'],
  'Admin.jsx': ['/css/styles.css'],
  'Pedidos.jsx': ['/css/styles.css'],
  'Envios.jsx': ['/css/styles.css', '/css/envios.css'],
  'Mensajeria.jsx': ['/css/styles.css', '/css/mensajeria.css'],
  'Resenas.jsx': ['/css/styles.css', '/css/resenas.css'],
  'Perfil.jsx': ['/css/styles.css'],
};

files.forEach(file => {
  if (!file.endsWith('.jsx')) return;
  const filePath = path.join(pagesDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Remove existing CSS imports
  content = content.replace(/import\s+['"]\.\.\/styles\/.*?\.css['"];\n/g, '');
  
  // Inject useStyles hook import at the top (after the first import)
  if (!content.includes('useStyles')) {
    content = content.replace(/^(import .*?['"];\n)/m, "$1import useStyles from '../hooks/useStyles';\n");
  }
  
  // Inject hook call inside the component
  const styles = cssMap[file];
  if (styles) {
    const hookCall = `  useStyles(${JSON.stringify(styles)});\n`;
    content = content.replace(/(export default function \w+\(.*\) {\n)/, `$1${hookCall}`);
  }
  
  fs.writeFileSync(filePath, content);
});

// 3. Remove from main.jsx
const mainPath = 'C:\\Users\\Deyner Chaverra\\Asafrut\\AgroMarket\\frontend\\src\\main.jsx';
let mainContent = fs.readFileSync(mainPath, 'utf8');
mainContent = mainContent.replace(/import\s+['"]\.\/styles\/styles\.css['"];\n/g, '');
fs.writeFileSync(mainPath, mainContent);

// 4. Update fonts in index.html
const indexPath = 'C:\\Users\\Deyner Chaverra\\Asafrut\\AgroMarket\\frontend\\index.html';
let indexContent = fs.readFileSync(indexPath, 'utf8');
indexContent = indexContent.replace(
  '<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Playfair+Display:wght@600;700&display=swap" rel="stylesheet">',
  '<link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;800&family=Inter:wght@400;500;600&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Playfair+Display:wght@600;700&display=swap" rel="stylesheet">'
);
fs.writeFileSync(indexPath, indexContent);
