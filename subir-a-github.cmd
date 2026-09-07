@echo off
setlocal
title Actualizar portafolio en GitHub
cd /d "%~dp0"
if errorlevel 1 goto error

set "PORTFOLIO_ROOT=%CD:\=/%"
set "PORTFOLIO_GIT="
for /f "delims=" %%G in ('where git.exe 2^>nul') do if not defined PORTFOLIO_GIT set "PORTFOLIO_GIT=%%G"
if not defined PORTFOLIO_GIT if exist "%ProgramFiles%\Git\cmd\git.exe" set "PORTFOLIO_GIT=%ProgramFiles%\Git\cmd\git.exe"
if not defined PORTFOLIO_GIT if exist "%LOCALAPPDATA%\Programs\Git\cmd\git.exe" set "PORTFOLIO_GIT=%LOCALAPPDATA%\Programs\Git\cmd\git.exe"
if not defined PORTFOLIO_GIT if exist "%USERPROFILE%\.cache\codex-runtimes\codex-primary-runtime\dependencies\native\git\cmd\git.exe" set "PORTFOLIO_GIT=%USERPROFILE%\.cache\codex-runtimes\codex-primary-runtime\dependencies\native\git\cmd\git.exe"
if not defined PORTFOLIO_GIT (
    echo No se encontro Git en PATH ni en las ubicaciones locales conocidas.
    goto error
)

"%PORTFOLIO_GIT%" -c safe.directory="%PORTFOLIO_ROOT%" rev-parse --is-inside-work-tree >nul
if errorlevel 1 (
    echo No se pudo abrir el repositorio de esta carpeta.
    goto error
)

if /i "%~1"=="--verificar" (
    echo Git encontrado: "%PORTFOLIO_GIT%"
    "%PORTFOLIO_GIT%" -c safe.directory="%PORTFOLIO_ROOT%" --version
    exit /b
)

echo Preparando cambios del portafolio...
echo Se publicaran los archivos nuevos, modificaciones y eliminaciones.
echo Se respetan las exclusiones de .gitignore.
echo.
"%PORTFOLIO_GIT%" -c safe.directory="%PORTFOLIO_ROOT%" add --all
if errorlevel 1 goto error

"%PORTFOLIO_GIT%" -c safe.directory="%PORTFOLIO_ROOT%" diff --cached --quiet
if errorlevel 2 goto error
if not errorlevel 1 goto subir

"%PORTFOLIO_GIT%" -c safe.directory="%PORTFOLIO_ROOT%" -c user.name="Josue Islas" -c user.email="josue22islas@users.noreply.github.com" commit -m "Actualizar portafolio"
if errorlevel 1 goto error

:subir
echo.
echo Enviando a GitHub. Si se solicita, inicia sesion en el navegador.
"%PORTFOLIO_GIT%" -c safe.directory="%PORTFOLIO_ROOT%" push origin HEAD:main
if errorlevel 1 goto error

echo.
echo Listo. Tu portafolio esta actualizado en GitHub:
echo https://github.com/josue22islas/Mi-portafolio
echo.
pause
exit /b 0

:error
echo.
echo No se pudo completar la actualizacion. Revisa el mensaje anterior.
echo Si el commit se guardo, puedes volver a ejecutar este archivo para enviarlo.
echo Si GitHub tiene cambios nuevos, pide ayuda para integrarlos antes de reintentar.
echo.
pause
exit /b 1
