@echo off
setlocal
set "RUNTIME=%DSH_HOME%"
if not defined RUNTIME set "RUNTIME=%USERPROFILE%\.dsh"
set "RUNTIME=%RUNTIME%\dsh-runtimes\dsh-primary-runtime\dependencies"
set "NODE=%RUNTIME%\node\node.exe"
if not exist "%NODE%" set "NODE=%RUNTIME%\node\bin\node.exe"
if not exist "%NODE%" set "NODE=node.exe"
if "%~1"=="" goto install
"%NODE%" "%~dp0setup.mjs" %*
exit /b %ERRORLEVEL%
:install
"%NODE%" "%~dp0setup.mjs" --install
set "RESULT=%ERRORLEVEL%"
echo.
echo If setup failed, open README.md for configuration steps.
pause
exit /b %RESULT%
