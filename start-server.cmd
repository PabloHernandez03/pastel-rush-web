@echo off
REM Arranca el backend de Pastel Rush (doble clic).
REM
REM En esta maquina Node esta instalado con fnm y NO queda en el PATH de una
REM terminal nueva: por eso `npm start` a secas falla con "npm no se reconoce".
REM `fnm exec --using=default` resuelve la version de Node correcta y ejecuta
REM el comando con ella.

cd /d "%~dp0server"

echo ============================================
echo   Pastel Rush - Backend
echo   http://localhost:4000
echo   (Ctrl+C para detener)
echo ============================================
echo.

REM Se invoca `node` directamente (equivalente a `npm start`, ver package.json):
REM en Windows `npm` es un shim .cmd que fnm exec no logra lanzar.
fnm exec --using=default node src/index.js

REM Si el servidor termina (o falla), la ventana se queda abierta para poder
REM leer el error en vez de cerrarse de golpe.
echo.
echo El servidor se detuvo.
pause
