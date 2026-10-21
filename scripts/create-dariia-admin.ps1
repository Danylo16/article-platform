$ErrorActionPreference = "Stop"
Set-Location (Split-Path $PSScriptRoot -Parent)
$previousEmail = $env:ADMIN_BOOTSTRAP_EMAIL
$previousPassword = $env:ADMIN_BOOTSTRAP_PASSWORD
$secret = Read-Host "Password for dariia.skrypnyk.sd@gmail.com (15-128 characters)" -AsSecureString
$pointer = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secret)
try {
    $env:ADMIN_BOOTSTRAP_EMAIL = "dariia.skrypnyk.sd@gmail.com"
    $env:ADMIN_BOOTSTRAP_PASSWORD = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($pointer)
    yarn workspace api admin:create
    if ($LASTEXITCODE -ne 0) { throw "Admin creation failed. Existing accounts are not overwritten." }
}
finally {
    [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($pointer)
    $secret.Dispose()
    $env:ADMIN_BOOTSTRAP_EMAIL = $previousEmail
    $env:ADMIN_BOOTSTRAP_PASSWORD = $previousPassword
}
