@echo off
echo Fixing case sensitivity in image filenames for local development...

REM Copy temporary files to correctly cased versions
copy /y "tools\img\Oridecon_temp.png" "tools\img\Oridecon.png"
copy /y "tools\img\Elunium_temp.png" "tools\img\Elunium.png"
copy /y "tools\img\Bradium_temp.png" "tools\img\Bradium.png"

REM Create other files if they don't exist already
if exist "tools\img\enriched-oridecon.png" copy /y "tools\img\enriched-oridecon.png" "tools\img\Enriched-Oridecon.png"
if exist "tools\img\enriched-elunium.png" copy /y "tools\img\enriched-elunium.png" "tools\img\Enriched-Elunium.png"
if exist "tools\img\enriched-bradium.png" copy /y "tools\img\enriched-bradium.png" "tools\img\Enriched-Bradium.png"
if exist "tools\img\hd-oridecon.png" copy /y "tools\img\hd-oridecon.png" "tools\img\HD-Oridecon.png"
if exist "tools\img\hd-elunium.png" copy /y "tools\img\hd-elunium.png" "tools\img\HD-Elunium.png"
if exist "tools\img\hd-bradium.png" copy /y "tools\img\hd-bradium.png" "tools\img\HD-Bradium.png"
if exist "tools\img\uhd-oridecon.png" copy /y "tools\img\uhd-oridecon.png" "tools\img\UHD-Oridecon.png"
if exist "tools\img\uhd-elunium.png" copy /y "tools\img\uhd-elunium.png" "tools\img\UHD-Elunium.png"
if exist "tools\img\uhd-bradium.png" copy /y "tools\img\uhd-bradium.png" "tools\img\UHD-Bradium.png"

echo Done!
pause 