function Clean-Registry {
    Write-Host "`n[Nettoyage avancé du registre (optionnel)]" -ForegroundColor Yellow
    $foundKeys = @()
    $locations = @("HKCU:\Software", "HKLM:\Software")

    try {
        foreach ($loc in $locations) {
            Write-Host "Recherche dans $loc ..." -ForegroundColor Cyan
            $keys = Get-ChildItem -Path $loc -Recurse -ErrorAction SilentlyContinue | Where-Object { $_.Name -match "Kiro" }
            if ($keys) {
                $foundKeys += $keys
            }
        }

        if ($foundKeys.Count -eq 0) {
            Write-Host "Aucune clé de registre liée à 'Kiro' n'a été trouvée." -ForegroundColor Gray
            Pause
            return
        }

        Write-Host "`nClés trouvées : $($foundKeys.Count)" -ForegroundColor Green
        foreach ($key in $foundKeys) {
            Write-Host " - $($key.PSPath)" -ForegroundColor DarkGray
        }

        $confirm = Read-Host "`nSouhaitez-vous supprimer toutes ces clés ? (o/n)"
        if ($confirm -ne 'o') {
            Write-Host "Suppression annulée par l'utilisateur." -ForegroundColor Red
            Pause
            return
        }

        foreach ($key in $foundKeys) {
            try {
                Remove-Item -Path $key.PSPath -Recurse -Force -ErrorAction Stop
                Write-Host "Supprimée : $($key.PSPath)" -ForegroundColor Green
            } catch {
                Write-Host "Erreur suppression $($key.PSPath) : $($_.Exception.Message)" -ForegroundColor Red
            }
        }

    } catch {
        Write-Host "Erreur globale : $($_.Exception.Message)" -ForegroundColor Red
    }

    Pause
}
