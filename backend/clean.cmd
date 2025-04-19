@echo off
echo Cleaning build directory...

echo Cleaning build directory...
if exist dist (
  rmdir /s /q dist
  echo Build directory cleaned
) else (
  echo Build directory does not exist
)

pause
