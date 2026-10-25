@echo off
title PLATEFORME TEMU - VALIDATION COMMANDE
color 0E

echo ====================================================================
echo        LANCEMENT DE LA PLATEFORME TEMU (Whaleco Tech Ireland)
echo ====================================================================
echo.

where node >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [ATTENTION] Node.js n'a pas ete detecte dans le PATH.
    echo Ouverture directe de index.html dans votre navigateur...
    start "" "index.html"
    pause
    exit /b
)

echo [1/2] Demarrage du serveur local sur le port 8181...
start /b "" node server.js >nul 2>&1

echo [2/2] Ouverture de l'application dans votre navigateur...
timeout /t 1 /nobreak >nul
start "" "http://localhost:8181"

echo.
echo ====================================================================
echo  [SUCCES] Plateforme operationnelle sur : http://localhost:8181
echo ====================================================================
echo.
pause
