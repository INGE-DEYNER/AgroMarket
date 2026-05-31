 $enc = New-Object System.Text.UTF8Encoding($false)
 $a = [char]0x00E1
 $e = [char]0x00E9
 $i = [char]0x00ED
 $o = [char]0x00F3
 $dash = [char]0x2014
 $arrow = [char]0x2192
 $bullet = [char]0x2022
 $phone = [char]0x260E
 $pin = [string]::Concat([char]0xD83D,[char]0xDCCD)

 $files = Get-ChildItem -Path 'C:\Users\Deyner Chaverra\Asafrut\AgroMarket\frontend' -Filter *.html
 foreach ($f in $files) {
   $p = $f.FullName
   $bak = $p + '.bak'
   if (Test-Path $bak) { $t = [System.IO.File]::ReadAllText($bak) } else { $t = [System.IO.File]::ReadAllText($p) }

   $t = $t.Replace('catlogo.html', 'catalogo.html')
   $t = [regex]::Replace($t, '(?i)catlogo', 'cat' + $a + 'logo')
   $t = [regex]::Replace($t, '\bCmo\b', 'C' + $o + 'mo')
   $t = [regex]::Replace($t, 'sesin', 'sesi' + $o + 'n')
   $t = [regex]::Replace($t, 'agrcolas', 'agr' + $i + 'colas')
   $t = [regex]::Replace($t, 'comercializacin', 'comercializaci' + $o + 'n')
   $t = [regex]::Replace($t, 'Regstrate', 'Reg' + $i + 'strate')
   $t = [regex]::Replace($t, 'fcil', 'f' + $a + 'cil')
   $t = [regex]::Replace($t, 'Conectamos productores agrcolas', 'Conectamos productores agr' + $i + 'colas')
   $t = [regex]::Replace($t, 'Plataforma oficial de comercializacin agrcola', 'Plataforma oficial de comercializaci' + $o + 'n agr' + $i + 'cola')
   $t = [regex]::Replace($t, 'Calificacin', 'Calificaci' + $o + 'n')
   $t = [regex]::Replace($t, 'calificacin', 'calificaci' + $o + 'n')
   $t = [regex]::Replace($t, '\bMs de\b', 'M' + $a + 's de')
   $t = [regex]::Replace($t, 'Urab', 'Urab' + $a)

   $t = $t.Replace('€”', $dash)
   $t = $t.Replace('†’', $arrow)
   $t = $t.Replace('ŸŒ', $bullet)
   $t = $t.Replace('Ÿšš', $bullet)
   $t = $t.Replace('Ÿ“ž', $phone)
   $t = $t.Replace('Ÿ“', $pin)
   $t = $t.Replace('Ÿ', $bullet)

   [System.IO.File]::WriteAllText($p, $t, $enc)
   Write-Host "Fixed: $p"
 }
