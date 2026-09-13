@echo off
chcp 65001 >nul
echo ============================================
echo  CORRIGIENDO FRONTEND - AgroMarket
 echo ============================================
echo.

cd /d "C:\Users\Deyner Chaverra\Desktop\proyectos\Asafrut\AgroMarket\frontend"

echo [1/5] Eliminando node_modules y dist...
rmdir /s /q node_modules 2>nul
rmdir /s /q dist 2>nul
echo.

echo [2/5] Instalando dependencias...
npm install
echo.

echo [3/5] Rebuilding con React 18...
npm run build
echo.

echo [4/5] Deploying a Cloudflare...
npx wrangler pages deploy dist
echo.

echo ============================================
echo  FRONTEND CORREGIDO Y DEPLOYADO
 echo ============================================
 echo.
echo Changes made:
 echo  - React: 19.2.6 -> 18.2.0 (stable)
 echo  - react-dom: 19.2.6 -> 18.2.0 (stable)
 echo  - @vitejs/plugin-react: 6.0.1 -> 4.2.1
 echo  - vite: 8.0.12 -> 5.2.0
 echo.
echo El error "useState is not defined" deberia estar resuelto.
echo.
pause
