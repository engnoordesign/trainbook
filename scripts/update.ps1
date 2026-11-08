# One-command update for the Docker container (Windows PowerShell):  .\scripts\update.ps1
# Pulls the latest code (if this folder is a git clone), rebuilds the image and restarts the container.
$ErrorActionPreference = 'Stop'
Set-Location (Split-Path -Parent $PSScriptRoot)

if (Test-Path .git) {
  Write-Host '> git pull' -ForegroundColor Cyan
  git pull --ff-only
}
Write-Host '> docker compose up -d --build' -ForegroundColor Cyan
docker compose up -d --build
docker image prune -f | Out-Null
Write-Host 'TrainBook is running at http://localhost:8080' -ForegroundColor Green
