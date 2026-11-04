@echo off
chcp 65001 >nul
title Plateforme TEMU - Envoi vers GitHub
color 0E

echo ====================================================================
echo        PUBLICATION DE LA PLATEFORME TEMU SUR GITHUB
echo ====================================================================
echo.
cd /d "%~dp0"

echo 1. Si ce n'est pas encore fait, creez un nouveau depot vide sur GitHub :
echo    Lien direct : https://github.com/new
echo    Nom suggere  : temu-commande (ou temu-platform)
echo    Visibilite   : Public ou Prive
echo    (Ne cochez pas 'Add README', laissez vide)
echo.
echo ====================================================================
echo.
set /p REPO_NAME="Entrez le nom de votre depot GitHub (ex: temu-commande) : "
if "%REPO_NAME%"=="" set REPO_NAME=temu-commande

git remote remove origin >nul 2>&1
git remote add origin https://github.com/blvcki1/%REPO_NAME%.git

echo.
echo Depot configure : https://github.com/blvcki1/%REPO_NAME%.git
echo.
echo ====================================================================
echo   Methode d'envoi :
echo   1. Envoi direct (utilise vos identifiants GitHub deja enregistres)
echo   2. Coller un Token GitHub Personnel (PAT ghp_...)
echo ====================================================================
set /p METHOD="Votre choix (1 ou 2) : "

if "%METHOD%"=="2" (
    echo.
    set /p GH_TOKEN="Collez votre Token GitHub (ghp_...) : "
    if not "%GH_TOKEN%"=="" (
        git remote set-url origin https://blvcki1:%GH_TOKEN%@github.com/blvcki1/%REPO_NAME%.git
    )
)

echo.
echo Envoi en cours vers GitHub (branche main)...
git add -A
git commit -m "Mise a jour logo Banque de France fenetre chargement annulation" >nul 2>&1
git branch -M main
git push -u origin main --force

echo.
if %ERRORLEVEL% EQU 0 (
    echo ====================================================================
    echo   [SUCCES TOTAL] La plateforme TEMU est desormais sur GitHub !
    echo   Lien : https://github.com/blvcki1/%REPO_NAME%
    echo ====================================================================
    echo Vous pouvez maintenant la deployer sur Render en 1 clic !
) else (
    echo ====================================================================
    echo   [ATTENTION] L'envoi a echoue.
    echo   Assurez-vous que le depot https://github.com/blvcki1/%REPO_NAME%
    echo   existe bien sur votre compte GitHub.
    echo ====================================================================
)
echo.
pause
