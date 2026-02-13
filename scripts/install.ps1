# PHANTOM installer (PowerShell)
# Intended endpoint target: GitHub-hosted installer script

param(
  [string]$ManifestUrl = "https://raw.githubusercontent.com/sir-ad/Phantom/main/releases/manifest.json",
  [string]$InstallDir = "$HOME\.local\bin",
  [string]$NpmFallbackPackage = "github:sir-ad/Phantom",
  [switch]$Upgrade
)

$ErrorActionPreference = "Stop"

function Write-Info([string]$Message) {
  Write-Host $Message
}

function Write-Warn([string]$Message) {
  Write-Warning $Message
}

function Fail([string]$Message) {
  throw $Message
}

function Show-Banner {
  Write-Host "░█▀█░█░█░█▀█░█▀█░▀█▀░█▀█░█▄█" -ForegroundColor Green
  Write-Host "░█▀▀░█▀█░█▀█░█░█░░█░░█░█░█░█" -ForegroundColor Green
  Write-Host "░▀░░░▀░▀░▀░▀░▀░▀░░▀░░▀▀▀░▀░▀" -ForegroundColor Green
  Write-Host ""
  Write-Host "PHANTOM — The invisible force behind every great product."
  Write-Host ""
}

function Check-Node {
  try {
    $nodeVersion = node -v
    Write-Info "Node detected: $nodeVersion"
  }
  catch {
    Write-Warn "Node.js not detected. npm fallback may fail."
  }
}

function Install-NpmFallback {
  $failed = $false
  try {
    Write-Info "Falling back to npm install from GitHub ($NpmFallbackPackage)"
    npm install -g $NpmFallbackPackage
    Write-Info "Installed via npm fallback. Run: phantom --version"
  }
  catch {
    $failed = $true
  }

  if ($failed) {
    Write-Warn "npm fallback install failed."
    try {
      npx --yes $NpmFallbackPackage --help | Out-Null
      Write-Warn "Temporary usage without install: npx --yes $NpmFallbackPackage --help"
    }
    catch {
      # no-op: keep primary failure below
    }
    Fail "fallback install failed"
  }
}

function Get-Platform {
  $arch = $env:PROCESSOR_ARCHITECTURE.ToLowerInvariant()
  if ($arch -eq "amd64" -or $arch -eq "x86_64") {
    $arch = "x64"
  }
  elseif ($arch -eq "arm64") {
    $arch = "arm64"
  }
  else {
    Fail "Unsupported architecture: $arch"
  }

  return "win-$arch"
}

function Update-UserPath([string]$TargetDir) {
  $userPath = [Environment]::GetEnvironmentVariable("Path", "User")
  if (-not $userPath) {
    $userPath = ""
  }

  $segments = $userPath -split ";" | Where-Object { $_ -and $_.Trim() -ne "" }
  if ($segments -notcontains $TargetDir) {
    $newPath = ($segments + $TargetDir) -join ";"
    [Environment]::SetEnvironmentVariable("Path", $newPath, "User")
    $env:Path = "$TargetDir;$env:Path"
  }
}

function Resolve-Asset($Manifest, [string]$Platform) {
  if (-not $Manifest.version) {
    Fail "Manifest missing version"
  }
  if (-not $Manifest.assets) {
    Fail "Manifest missing assets"
  }

  $asset = $Manifest.assets | Where-Object { $_.platform -eq $Platform } | Select-Object -First 1
  if (-not $asset) {
    return $null
  }

  if (-not $asset.asset_url -or -not $asset.sha256 -or -not $asset.signature) {
    Fail "Manifest asset missing required fields"
  }

  return $asset
}

function Install-FromManifest {
  $platform = Get-Platform
  Write-Info "Detected platform: $platform"
  Write-Info "Fetching manifest: $ManifestUrl"

  $manifest = Invoke-RestMethod -Uri $ManifestUrl -Method Get
  $asset = Resolve-Asset -Manifest $manifest -Platform $platform
  if (-not $asset) {
    Write-Warn "No binary asset for $platform"
    return $false
  }

  $tmpDir = Join-Path ([System.IO.Path]::GetTempPath()) ("phantom-install-" + [Guid]::NewGuid().ToString("N"))
  New-Item -ItemType Directory -Path $tmpDir -Force | Out-Null

  try {
    $assetExt = [System.IO.Path]::GetExtension($asset.asset_url)
    if (-not $assetExt) {
      $assetExt = ".zip"
    }
    $archivePath = Join-Path $tmpDir ("phantom" + $assetExt)
    Write-Info "Downloading binary asset..."
    Invoke-WebRequest -Uri $asset.asset_url -OutFile $archivePath

    $hash = (Get-FileHash -Path $archivePath -Algorithm SHA256).Hash.ToLowerInvariant()
    if ($hash -ne $asset.sha256.ToLowerInvariant()) {
      Fail "Checksum mismatch. Expected $($asset.sha256), got $hash"
    }

    $extractDir = Join-Path $tmpDir "extract"
    New-Item -ItemType Directory -Path $extractDir -Force | Out-Null

    if ($archivePath.ToLowerInvariant().EndsWith(".zip")) {
      Expand-Archive -Path $archivePath -DestinationPath $extractDir -Force
    }
    else {
      tar -xzf $archivePath -C $extractDir
    }

    $candidate = Get-ChildItem -Path $extractDir -Recurse -File | Where-Object {
      $_.Name -eq "phantom.exe" -or $_.Name -eq "phantom"
    } | Select-Object -First 1

    if (-not $candidate) {
      Fail "No phantom binary found in extracted archive"
    }

    New-Item -ItemType Directory -Path $InstallDir -Force | Out-Null
    $candidateRoot = Split-Path -Parent $candidate.FullName
    $libPath = Join-Path $candidateRoot "lib"
    if (Test-Path $libPath) {
      Copy-Item -Path (Join-Path $candidateRoot "*") -Destination $InstallDir -Recurse -Force
      $targetPath = Join-Path $InstallDir "phantom"
      if (-not (Test-Path $targetPath)) {
        $targetPath = Join-Path $InstallDir "phantom.exe"
      }
    }
    else {
      $targetPath = Join-Path $InstallDir "phantom.exe"
      Copy-Item -Path $candidate.FullName -Destination $targetPath -Force
    }

    Update-UserPath -TargetDir $InstallDir
    Write-Info "Installed PHANTOM $($manifest.version) to $targetPath"

    try {
      & $targetPath --version | Out-Null
      & $targetPath doctor | Out-Null
      Write-Info "Environment check: phantom doctor completed"
    }
    catch {
      Write-Warn "Post-install checks returned warnings. Run 'phantom doctor'."
    }

    return $true
  }
  finally {
    Remove-Item -Path $tmpDir -Recurse -Force -ErrorAction SilentlyContinue
  }
}

Show-Banner
if ($Upgrade) {
  Write-Info "PHANTOM upgrade"
}
else {
  Write-Info "PHANTOM installer"
}
Check-Node

try {
  $installed = Install-FromManifest
  if (-not $installed) {
    Install-NpmFallback
  }
}
catch {
  Write-Warn $_.Exception.Message
  Install-NpmFallback
}
