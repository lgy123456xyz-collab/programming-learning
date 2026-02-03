@echo off
:again
r > input
a < input > output.a
b < input > output.b
echo Checking... 
fc output.a output.b > nul
if not errorlevel 1 goto again
pause