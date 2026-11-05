@echo off
chcp 65001 >nul
title PLATEFORME TEMU - SERVEUR LOCAL
color 0E

:: Se positionner impérativement dans le dossier courant du script
cd /d "%~dp0"

echo ====================================================================
echo        LANCEMENT DE LA PLATEFORME TEMU (Whaleco Tech)
echo ====================================================================
echo.

where node >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [ATTENTION] Node.js n'a pas été détecté dans votre PATH.
    echo Ouverture directe du fichier index.html...
    start "" "%~dp0index.html"
    echo.
    pause
    exit /b
)

:: Vérifier si le serveur tourne déjà sur le port 8181
netstat -ano | findstr :8181 | findstr LISTENING >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo [INFO] Le serveur Node.js est déjà actif sur le port 8181.
) else (
    echo [1/2] Démarrage du serveur local sur le port 8181...
    start "SERVEUR TEMU - PORT 8181" node server.js
    timeout /t 2 /nobreak >nul
)

echo [2/2] Ouverture de la plateforme dans votre navigateur...
start "" "http://localhost:8181"

echo.
echo ====================================================================
echo  [SUCCÈS] Plateforme ouverte : http://localhost:8181
echo  (Laissez la fenêtre du serveur ouverte en arrière-plan)
echo ====================================================================
echo.
pause
