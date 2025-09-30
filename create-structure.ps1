# create-structure.ps1
# Run from the folder that will contain ophthalmology-device-service-platform
# Requires PowerShell 7+

$ErrorActionPreference = "Stop"

$root = "ophthalmology-device-service-platform"

# --- create folders ---
$folders = @(
    "$root/backend/src/config",
    "$root/backend/src/controllers",
    "$root/backend/src/middleware",
    "$root/backend/src/routes",
    "$root/backend/src/services",
    "$root/db/migrations"
)

$folders | ForEach-Object {
    New-Item -ItemType Directory -Path $_ -Force | Out-Null
}

# --- create empty files ---
$files = @(
    "$root/backend/src/config/db.js",
    "$root/backend/src/controllers/authController.js",
    "$root/backend/src/middleware/rbac.js",
    "$root/backend/src/middleware/session.js",
    "$root/backend/src/routes/authRoutes.js",
    "$root/backend/src/services/mfaService.js",
    "$root/backend/src/server.js",
    "$root/backend/package.json",
    "$root/backend/.env.example",
    "$root/db/migrations/001_init_schema.sql"
)

$files | ForEach-Object {
    New-Item -ItemType File -Path $_ -Force | Out-Null
}

Write-Host "Project structure created under $(Resolve-Path $root)"