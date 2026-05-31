$enc = New-Object System.Text.UTF8Encoding($false)
$legacy = [System.Text.Encoding]::GetEncoding(1252)
$files = Get-ChildItem -Path 'C:\Users\Deyner Chaverra\Asafrut\AgroMarket\frontend' -Filter *.html
foreach ($f in $files) {
  $p = $f.FullName
  $bak = $p + '.bak'
  $source = if (Test-Path $bak) { $bak } else { $p }
  $text = [System.IO.File]::ReadAllText($source)
  $bytes = $legacy.GetBytes($text)
  $fixed = [System.Text.Encoding]::UTF8.GetString($bytes)
  [System.IO.File]::WriteAllText($p, $fixed, $enc)
  Write-Host "Fixed: $p"
}
