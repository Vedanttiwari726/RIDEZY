# start-backend.ps1

# Set your port
$port = 5000

# Kill any process using the port
$existingProcess = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess
if ($existingProcess) {
    Write-Host "Port $port is busy. Killing process ID: $existingProcess"
    Stop-Process -Id $existingProcess -Force
} else {
    Write-Host "Port $port is free."
}

# Start Nodemon
Write-Host "Starting server..."
npx nodemon server.js
