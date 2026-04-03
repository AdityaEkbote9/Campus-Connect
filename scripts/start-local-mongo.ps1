$root = "C:\Users\User\Documents\New project"
$mongoBin = "$root\tools\mongodb\extract\mongodb-win32-x86_64-windows-8.2.6\bin\mongod.exe"
$dbPath = "$root\data\db"
$logPath = "$root\data\mongod-persistent.log"
$launchScript = "$root\scripts\run-mongo-hidden.cmd"

if (-not (Test-Path $mongoBin)) {
  throw "mongod.exe was not found. Expected it at: $mongoBin"
}

New-Item -ItemType Directory -Force -Path $dbPath | Out-Null

$existing = Get-NetTCPConnection -LocalPort 27017 -State Listen -ErrorAction SilentlyContinue
if ($existing) {
  Write-Output "MongoDB is already listening on port 27017."
  exit 0
}

@"
@echo off
start "" /min "$mongoBin" --dbpath "$dbPath" --bind_ip 127.0.0.1 --port 27017 --logpath "$logPath" --logappend
"@ | Set-Content -Path $launchScript -Encoding ASCII

Start-Process -FilePath "cmd.exe" -ArgumentList "/c", $launchScript | Out-Null
Start-Sleep -Seconds 10

$tcp = Test-NetConnection -ComputerName "127.0.0.1" -Port 27017 -WarningAction SilentlyContinue
if (-not $tcp.TcpTestSucceeded) {
  throw "MongoDB did not start successfully. Check data\\mongod-persistent.log."
}

Write-Output "MongoDB started on 127.0.0.1:27017 with persistent data in data\\db."
