# Kiro Reset Tool - Script PowerShell interactif (Version Améliorée)
# Auteur : Ryan & Claude
# Description : Ce script permet de désinstaller Kiro, de supprimer les fichiers AppData, 
#               de nettoyer le registre, de réinitialiser la Machine ID et bien plus encore.
# Version : 2.0

#Requires -RunAsAdministrator

# Configuration globale
$Global:LogFile = "$env:TEMP\KiroResetTool_$(Get-Date -Format 'yyyyMMdd_HHmmss').log"
$Global:BackupFolder = "$env:TEMP\KiroResetBackup_$(Get-Date -Format 'yyyyMMdd_HHmmss')"
$Global:VerboseMode = $false

# Fonction de logging
function Write-Log {
    param(
        [string]$Message,
        [string]$Level = "INFO"
    )
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $logEntry = "[$timestamp] [$Level] $Message"
    Add-Content -Path $Global:LogFile -Value $logEntry -ErrorAction SilentlyContinue
    
    switch ($Level) {
        "ERROR" { Write-Host $Message -ForegroundColor Red }
        "WARNING" { Write-Host $Message -ForegroundColor Yellow }
        "SUCCESS" { Write-Host $Message -ForegroundColor Green }
        "INFO" { Write-Host $Message -ForegroundColor White }
        default { Write-Host $Message }
    }
}

function Test-AdminRights {
    $currentUser = [Security.Principal.WindowsIdentity]::GetCurrent()
    $principal = New-Object Security.Principal.WindowsPrincipal($currentUser)
    return $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
}

function Show-Banner {
    Clear-Host
    Write-Host @"
╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║                     KIRO RESET TOOL v2.0                     ║
║                                                               ║
║        Script complet de désinstallation et nettoyage        ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
"@ -ForegroundColor Cyan
    
    if (-not (Test-AdminRights)) {
        Write-Host "⚠️  ATTENTION : Ce script nécessite des droits administrateur." -ForegroundColor Red
        Write-Host "   Certaines fonctionnalités peuvent ne pas fonctionner correctement." -ForegroundColor Yellow
    } else {
        Write-Host "✅ Droits administrateur détectés." -ForegroundColor Green
    }
    
    Write-Host "`nFichier de log : $Global:LogFile" -ForegroundColor Gray
    if ($Global:VerboseMode) {
        Write-Host "🔍 Mode verbose activé" -ForegroundColor Magenta
    }
    Write-Host ""
}

function Show-Menu {
    Show-Banner
    Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
    Write-Host " 1.  Analyser l'installation de Kiro"
    Write-Host " 2.  Désinstaller Kiro (tous les méthodes)"
    Write-Host " 3.  Supprimer fichiers AppData et ProgramData"
    Write-Host " 4.  Nettoyer le registre"
    Write-Host " 5.  Réinitialiser Machine ID"
    Write-Host " 6.  Nettoyer les services Windows"
    Write-Host " 7.  Supprimer les tâches planifiées"
    Write-Host " 8.  Nettoyer les traces réseau"
    Write-Host " 9.  Vider les caches système"
    Write-Host " 10. Effectuer un reset complet"
    Write-Host " 11. Créer une sauvegarde avant nettoyage"
    Write-Host " 12. Restaurer depuis une sauvegarde"
    Write-Host " 13. Générer un rapport détaillé"
    Write-Host " 14. Basculer le mode verbose"
    Write-Host " 15. Ouvrir le dossier des logs"
    Write-Host " 0.  Quitter"
    Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
}

function Pause {
    Write-Host "`n⏸️  Appuyez sur une touche pour continuer..." -ForegroundColor Yellow
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
}

function Confirm-Action {
    param([string]$Message)
    Write-Host "`n$Message" -ForegroundColor Yellow
    do {
        $response = Read-Host "Confirmez-vous cette action ? (O/N)"
    } while ($response -notmatch '^[OoNn]$')
    return ($response -match '^[Oo]$')
}

function Write-Log {
    param(
        [string]$Message,
        [string]$Level = "INFO"
    )
    
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $logEntry = "[$timestamp] [$Level] $Message"
    
    # Afficher selon le niveau
    switch ($Level) {
        "ERROR" { Write-Host $logEntry -ForegroundColor Red }
        "WARNING" { Write-Host $logEntry -ForegroundColor Yellow }
        "SUCCESS" { Write-Host $logEntry -ForegroundColor Green }
        default { Write-Host $logEntry }
    }
    
    # Écrire dans le fichier de log si défini
    if ($Global:LogFile) {
        try {
            Add-Content -Path $Global:LogFile -Value $logEntry -Encoding UTF8
        } catch {
            Write-Host "Erreur lors de l'écriture du log : $_" -ForegroundColor Red
        }
    }
}

function Analyze-KiroInstallation {
    Write-Log "═══ ANALYSE DE L'INSTALLATION KIRO ═══"
    $analysis = @{
        WingetInstalled = $false
        MSIInstalled = $false
        PortableFound = $false
        AppDataFound = $false
        RegistryKeys = @()
        Services = @()
        ScheduledTasks = @()
        ProcessesRunning = @()
    }
    
    try {
        # Vérification Winget
        Write-Host "🔍 Recherche via Winget..." -ForegroundColor Blue
        try {
            $wingetResult = winget list --name "Kiro" 2>$null | Select-String "Kiro"
            if ($wingetResult) {
                $analysis.WingetInstalled = $true
                Write-Log "✅ Installation Winget détectée" "SUCCESS"
            }
        } catch {
            Write-Log "⚠️  Impossible de vérifier Winget : $_" "WARNING"
        }
        
        # Vérification MSI/Programs
        Write-Host "🔍 Recherche dans les programmes installés..." -ForegroundColor Blue
        try {
            $msiApps = Get-WmiObject -Class Win32_Product | Where-Object { $_.Name -like "*Kiro*" }
            if ($msiApps) {
                $analysis.MSIInstalled = $true
                Write-Log "✅ Installation MSI détectée : $($msiApps.Name)" "SUCCESS"
            }
        } catch {
            Write-Log "⚠️  Impossible de vérifier les programmes installés : $_" "WARNING"
        }
        
        # Recherche de processus actifs
        Write-Host "🔍 Recherche de processus actifs..." -ForegroundColor Blue
        try {
            $processes = Get-Process | Where-Object { $_.ProcessName -like "*Kiro*" }
            if ($processes) {
                $analysis.ProcessesRunning = $processes.ProcessName
                Write-Log "⚠️  Processus Kiro en cours d'exécution : $($processes.ProcessName -join ', ')" "WARNING"
            }
        } catch {
            Write-Log "⚠️  Impossible de vérifier les processus : $_" "WARNING"
        }
        
        # Vérification AppData
        Write-Host "🔍 Recherche des fichiers utilisateur..." -ForegroundColor Blue
        $paths = @(
            "$env:LOCALAPPDATA\Kiro",
            "$env:APPDATA\Kiro",
            "$env:PROGRAMDATA\Kiro"
        )
        foreach ($path in $paths) {
            if (Test-Path $path) {
                $analysis.AppDataFound = $true
                Write-Log "✅ Dossier trouvé : $path" "SUCCESS"
            }
        }
        
        # Recherche dans le registre
        Write-Host "🔍 Analyse du registre..." -ForegroundColor Blue
        $regPaths = @(
            "HKCU:\Software",
            "HKLM:\Software",
            "HKLM:\SOFTWARE\WOW6432Node"
        )
        
        foreach ($regPath in $regPaths) {
            try {
                $keys = Get-ChildItem -Path $regPath -Recurse -ErrorAction SilentlyContinue | 
                        Where-Object { $_.Name -match "Kiro" }
                if ($keys) {
                    $analysis.RegistryKeys += $keys.PSPath
                }
            } catch {
                Write-Log "⚠️  Impossible d'analyser $regPath" "WARNING"
            }
        }
        
        # Recherche de services
        Write-Host "🔍 Recherche de services..." -ForegroundColor Blue
        try {
            $services = Get-Service | Where-Object { $_.Name -like "*Kiro*" -or $_.DisplayName -like "*Kiro*" }
            if ($services) {
                $analysis.Services = $services.Name
                Write-Log "✅ Services détectés : $($services.DisplayName -join ', ')" "SUCCESS"
            }
        } catch {
            Write-Log "⚠️  Impossible de vérifier les services : $_" "WARNING"
        }
        
        # Recherche de tâches planifiées
        Write-Host "🔍 Recherche de tâches planifiées..." -ForegroundColor Blue
        try {
            $tasks = Get-ScheduledTask | Where-Object { $_.TaskName -like "*Kiro*" }
            if ($tasks) {
                $analysis.ScheduledTasks = $tasks.TaskName
                Write-Log "✅ Tâches planifiées détectées : $($tasks.TaskName -join ', ')" "SUCCESS"
            }
        } catch {
            Write-Log "⚠️  Impossible d'analyser les tâches planifiées" "WARNING"
        }
        
        # Affichage du résumé
        Write-Host "`n📊 RÉSUMÉ DE L'ANALYSE:" -ForegroundColor Cyan
        Write-Host "  • Installation Winget : $(if($analysis.WingetInstalled){'✅ Oui'}else{'❌ Non'})"
        Write-Host "  • Installation MSI : $(if($analysis.MSIInstalled){'✅ Oui'}else{'❌ Non'})"
        Write-Host "  • Fichiers AppData : $(if($analysis.AppDataFound){'✅ Trouvés'}else{'❌ Non trouvés'})"
        Write-Host "  • Clés de registre : $($analysis.RegistryKeys.Count) trouvée(s)"
        Write-Host "  • Services : $($analysis.Services.Count) trouvé(s)"
        Write-Host "  • Tâches planifiées : $($analysis.ScheduledTasks.Count) trouvée(s)"
        Write-Host "  • Processus actifs : $($analysis.ProcessesRunning.Count) trouvé(s)"
        
    } catch {
        Write-Log "❌ Erreur lors de l'analyse : $_" "ERROR"
    }
    
    Pause
}

# Fonction pour corriger les problèmes d'encodage dans les rapports HTML
function Generate-HtmlReport {
    param([hashtable]$Analysis)
    
    $htmlContent = @"
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Rapport d'analyse Kiro</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { background-color: #f0f0f0; padding: 10px; border-radius: 5px; }
        .success { color: green; }
        .warning { color: orange; }
        .error { color: red; }
        .info { color: blue; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Rapport d'analyse Kiro - $(Get-Date)</h1>
    </div>
    
    <h2>Résultats de l'analyse</h2>
    <ul>
        <li>Installation Winget : $(if($Analysis.WingetInstalled){'<span class="success">✅ Détectée</span>'}else{'<span class="info">❌ Non détectée</span>'})</li>
        <li>Installation MSI : $(if($Analysis.MSIInstalled){'<span class="success">✅ Détectée</span>'}else{'<span class="info">❌ Non détectée</span>'})</li>
        <li>Fichiers AppData : $(if($Analysis.AppDataFound){'<span class="success">✅ Trouvés</span>'}else{'<span class="info">❌ Non trouvés</span>'})</li>
        <li>Clés de registre : $($Analysis.RegistryKeys.Count) trouvée(s)</li>
        <li>Services : $($Analysis.Services.Count) trouvé(s)</li>
        <li>Tâches planifiées : $($Analysis.ScheduledTasks.Count) trouvée(s)</li>
        <li>Processus actifs : $($Analysis.ProcessesRunning.Count) trouvé(s)</li>
    </ul>
"@

    if ($Analysis.ProcessesRunning.Count -gt 0) {
        $htmlContent += "<p class='warning'><strong>🔴 Processus actifs détectés :</strong> $($Analysis.ProcessesRunning -join ', ')</p>"
    } else {
        $htmlContent += "<p class='success'><strong>✅ Système propre :</strong> Aucun processus Kiro actif</p>"
    }
    
    $htmlContent += "</body></html>"
    
    return $htmlContent
}

# Initialisation des variables globales
$Global:LogFile = "$env:TEMP\KiroReset_$(Get-Date -Format 'yyyyMMdd_HHmmss').log"
$Global:VerboseMode = $false

Write-Log "Script Kiro Reset Tool démarré" "SUCCESS"
function Stop-KiroProcesses {
    Write-Log "Arrêt des processus Kiro en cours..."
    try {
        $processes = Get-Process | Where-Object { $_.ProcessName -like "*Kiro*" }
        foreach ($process in $processes) {
            Write-Log "Arrêt du processus : $($process.ProcessName) (PID: $($process.Id))"
            $process.Kill()
            Start-Sleep -Milliseconds 500
        }
        if ($processes) {
            Write-Log "✅ Tous les processus Kiro ont été arrêtés" "SUCCESS"
        }
    } catch {
        Write-Log "❌ Erreur lors de l'arrêt des processus : $_" "ERROR"
    }
}

function Uninstall-Kiro {
    Write-Log "═══ DÉSINSTALLATION COMPLÈTE DE KIRO ═══"
    
    if (-not (Confirm-Action "⚠️  Cela va désinstaller Kiro par toutes les méthodes disponibles.")) {
        return
    }
    
    try {
        # Arrêt des processus
        Stop-KiroProcesses
        
        # Méthode 1: Winget
        Write-Host "🔄 Tentative de désinstallation via Winget..." -ForegroundColor Blue
        try {
            $wingetResult = winget list --name "Kiro" 2>$null | Select-String "Kiro"
            if ($wingetResult) {
                winget uninstall --name "Kiro" --silent --accept-source-agreements
                Write-Log "✅ Désinstallation Winget réussie" "SUCCESS"
            } else {
                Write-Log "ℹ️ Aucune installation Winget trouvée" "INFO"
            }
        } catch {
            Write-Log "❌ Erreur Winget : $_" "ERROR"
        }
        
        # Méthode 2: MSI/WMI
        Write-Host "🔄 Tentative de désinstallation via MSI..." -ForegroundColor Blue
        try {
            $msiApps = Get-WmiObject -Class Win32_Product | Where-Object { $_.Name -like "*Kiro*" }
            foreach ($app in $msiApps) {
                Write-Log "Désinstallation MSI : $($app.Name)"
                $app.Uninstall() | Out-Null
                Write-Log "✅ Désinstallation MSI réussie : $($app.Name)" "SUCCESS"
            }
        } catch {
            Write-Log "❌ Erreur MSI : $_" "ERROR"
        }
        
        # Méthode 3: Registre Uninstall
        Write-Host "🔄 Recherche dans le registre des programmes..." -ForegroundColor Blue
        $uninstallPaths = @(
            "HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall\*",
            "HKLM:\SOFTWARE\WOW6432Node\Microsoft\Windows\CurrentVersion\Uninstall\*",
            "HKCU:\SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall\*"
        )
        
        foreach ($path in $uninstallPaths) {
            try {
                $apps = Get-ItemProperty $path | Where-Object { $_.DisplayName -like "*Kiro*" }
                foreach ($app in $apps) {
                    if ($app.UninstallString) {
                        Write-Log "Exécution de la désinstallation : $($app.UninstallString)"
                        Start-Process -FilePath "cmd.exe" -ArgumentList "/c", $app.UninstallString, "/S" -Wait -NoNewWindow
                        Write-Log "✅ Désinstallation registry réussie : $($app.DisplayName)" "SUCCESS"
                    }
                }
            } catch {
                Write-Log "❌ Erreur registry uninstall : $_" "ERROR"
            }
        }
        
    } catch {
        Write-Log "❌ Erreur générale lors de la désinstallation : $_" "ERROR"
    }
    
    Write-Log "✅ Processus de désinstallation terminé" "SUCCESS"
    Pause
}

function Delete-AppData {
    Write-Log "═══ SUPPRESSION DES FICHIERS UTILISATEUR ═══"
    
    $paths = @(
        "$env:LOCALAPPDATA\Kiro",
        "$env:APPDATA\Kiro",
        "$env:PROGRAMDATA\Kiro",
        "$env:PUBLIC\Desktop\Kiro.lnk",
        "$env:USERPROFILE\Desktop\Kiro.lnk",
        "$env:APPDATA\Microsoft\Windows\Start Menu\Programs\Kiro",
        "$env:PROGRAMDATA\Microsoft\Windows\Start Menu\Programs\Kiro"
    )
    
    # Ajout de chemins supplémentaires potentiels
    $additionalPaths = @(
        "$env:TEMP\Kiro*",
        "$env:LOCALAPPDATA\Temp\Kiro*"
    )
    
    try {
        foreach ($path in $paths) {
            if (Test-Path $path) {
                if ($Global:VerboseMode) {
                    Write-Log "Suppression : $path"
                }
                Remove-Item -Path $path -Recurse -Force -ErrorAction SilentlyContinue
                Write-Log "✅ Supprimé : $path" "SUCCESS"
            } else {
                if ($Global:VerboseMode) {
                    Write-Log "ℹ️ Non trouvé : $path" "INFO"
                }
            }
        }
        
        # Suppression des fichiers temporaires avec wildcard
        foreach ($wildPath in $additionalPaths) {
            $items = Get-ChildItem -Path (Split-Path $wildPath) -Filter (Split-Path $wildPath -Leaf) -ErrorAction SilentlyContinue
            foreach ($item in $items) {
                Remove-Item -Path $item.FullName -Recurse -Force -ErrorAction SilentlyContinue
                Write-Log "✅ Supprimé (temp) : $($item.FullName)" "SUCCESS"
            }
        }
        
    } catch {
        Write-Log "❌ Erreur lors de la suppression des fichiers : $_" "ERROR"
    }
    
    Pause
}

function Clean-Registry {
    Write-Log "═══ NETTOYAGE DU REGISTRE ═══"
    
    if (-not (Test-AdminRights)) {
        Write-Log "❌ Droits administrateur requis pour le nettoyage du registre" "ERROR"
        Pause
        return
    }
    
    if (-not (Confirm-Action "⚠️  Cela va supprimer toutes les clés de registre liées à Kiro.")) {
        return
    }
    
    $registryPaths = @(
        "HKCU:\Software",
        "HKLM:\Software",
        "HKLM:\SOFTWARE\WOW6432Node",
        "HKCU:\SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall",
        "HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall",
        "HKLM:\SOFTWARE\WOW6432Node\Microsoft\Windows\CurrentVersion\Uninstall"
    )
    
    $foundKeys = @()
    
    try {
        foreach ($regPath in $registryPaths) {
            if ($Global:VerboseMode) {
                Write-Log "Analyse de : $regPath"
            }
            
            try {
                $keys = Get-ChildItem -Path $regPath -Recurse -ErrorAction SilentlyContinue | 
                        Where-Object { $_.Name -match "Kiro" -or $_.PSChildName -match "Kiro" }
                $foundKeys += $keys
            } catch {
                if ($Global:VerboseMode) {
                    Write-Log "⚠️  Impossible d'analyser $regPath : $_" "WARNING"
                }
            }
        }
        
        if ($foundKeys.Count -gt 0) {
            Write-Log "🔍 $($foundKeys.Count) clé(s) de registre trouvée(s)"
            
            foreach ($key in $foundKeys) {
                try {
                    if ($Global:VerboseMode) {
                        Write-Log "Suppression : $($key.PSPath)"
                    }
                    Remove-Item -Path $key.PSPath -Recurse -Force -ErrorAction Stop
                    Write-Log "✅ Supprimé : $($key.Name)" "SUCCESS"
                } catch {
                    Write-Log "❌ Impossible de supprimer : $($key.Name) - $_" "ERROR"
                }
            }
        } else {
            Write-Log "ℹ️ Aucune clé de registre trouvée pour Kiro" "INFO"
        }
        
    } catch {
        Write-Log "❌ Erreur lors du nettoyage du registre : $_" "ERROR"
    }
    
    Pause
}

function Reset-MachineID {
    Write-Log "═══ RÉINITIALISATION DE LA MACHINE ID ═══"
    
    if (-not (Test-AdminRights)) {
        Write-Log "❌ Droits administrateur requis pour réinitialiser la Machine ID" "ERROR"
        Pause
        return
    }
    
    if (-not (Confirm-Action "⚠️  Cela va générer un nouvel identifiant unique pour cette machine.")) {
        return
    }
    
    try {
        $regPath = "HKLM:\SOFTWARE\Microsoft\Cryptography"
        $currentGuid = (Get-ItemProperty -Path $regPath -Name "MachineGuid" -ErrorAction SilentlyContinue).MachineGuid
        
        if ($currentGuid) {
            Write-Log "Machine ID actuelle : $currentGuid"
        }
        
        $newGuid = [guid]::NewGuid().ToString()
        Set-ItemProperty -Path $regPath -Name "MachineGuid" -Value $newGuid -Force
        
        Write-Log "✅ Nouvelle Machine ID : $newGuid" "SUCCESS"
        
        # Réinitialisation d'autres identifiants système
        $additionalPaths = @{
            "HKLM:\SOFTWARE\Microsoft\Windows NT\CurrentVersion" = "InstallDate"
            "HKLM:\SYSTEM\CurrentControlSet\Control\IDConfigDB\Hardware Profiles\0001" = "HwProfileGuid"
        }
        
        foreach ($path in $additionalPaths.Keys) {
            try {
                $property = $additionalPaths[$path]
                if ($property -eq "InstallDate") {
                    $newValue = [int][double]::Parse((Get-Date -UFormat %s))
                } else {
                    $newValue = [guid]::NewGuid().ToString()
                }
                
                Set-ItemProperty -Path $path -Name $property -Value $newValue -Force -ErrorAction SilentlyContinue
                Write-Log "✅ Réinitialisé : $path\$property" "SUCCESS"
            } catch {
                Write-Log "⚠️  Impossible de réinitialiser $path\$($additionalPaths[$path])" "WARNING"
            }
        }
        
    } catch {
        Write-Log "❌ Erreur lors de la réinitialisation de la Machine ID : $_" "ERROR"
    }
    
    Pause
}

function Clean-Services {
    Write-Log "═══ NETTOYAGE DES SERVICES WINDOWS ═══"
    
    if (-not (Test-AdminRights)) {
        Write-Log "❌ Droits administrateur requis pour gérer les services" "ERROR"
        Pause
        return
    }
    
    try {
        $services = Get-Service | Where-Object { 
            $_.Name -like "*Kiro*" -or 
            $_.DisplayName -like "*Kiro*" 
        }
        
        if ($services) {
            Write-Log "🔍 $($services.Count) service(s) Kiro trouvé(s)"
            
            foreach ($service in $services) {
                try {
                    Write-Log "Traitement du service : $($service.DisplayName) ($($service.Name))"
                    
                    if ($service.Status -eq 'Running') {
                        Stop-Service -Name $service.Name -Force -ErrorAction Stop
                        Write-Log "✅ Service arrêté : $($service.Name)" "SUCCESS"
                    }
                    
                    # Suppression du service
                    sc.exe delete $service.Name | Out-Null
                    Write-Log "✅ Service supprimé : $($service.Name)" "SUCCESS"
                    
                } catch {
                    Write-Log "❌ Erreur avec le service $($service.Name) : $_" "ERROR"
                }
            }
        } else {
            Write-Log "ℹ️ Aucun service Kiro trouvé" "INFO"
        }
        
    } catch {
        Write-Log "❌ Erreur lors du nettoyage des services : $_" "ERROR"
    }
    
    Pause
}

function Clean-ScheduledTasks {
    Write-Log "═══ SUPPRESSION DES TÂCHES PLANIFIÉES ═══"
    
    if (-not (Test-AdminRights)) {
        Write-Log "❌ Droits administrateur requis pour gérer les tâches planifiées" "ERROR"
        Pause
        return
    }
    
    try {
        $tasks = Get-ScheduledTask | Where-Object { 
            $_.TaskName -like "*Kiro*" -or 
            $_.Description -like "*Kiro*" 
        }
        
        if ($tasks) {
            Write-Log "🔍 $($tasks.Count) tâche(s) planifiée(s) trouvée(s)"
            
            foreach ($task in $tasks) {
                try {
                    Unregister-ScheduledTask -TaskName $task.TaskName -Confirm:$false -ErrorAction Stop
                    Write-Log "✅ Tâche supprimée : $($task.TaskName)" "SUCCESS"
                } catch {
                    Write-Log "❌ Erreur lors de la suppression de la tâche $($task.TaskName) : $_" "ERROR"
                }
            }
        } else {
            Write-Log "ℹ️ Aucune tâche planifiée Kiro trouvée" "INFO"
        }
        
    } catch {
        Write-Log "❌ Erreur lors du nettoyage des tâches planifiées : $_" "ERROR"
    }
    
    Pause
}

function Clean-NetworkTraces {
    Write-Log "═══ NETTOYAGE DES TRACES RÉSEAU ═══"
    
    try {
        # Vider le cache DNS
        Write-Host "🔄 Vidage du cache DNS..." -ForegroundColor Blue
        ipconfig /flushdns | Out-Null
        Write-Log "✅ Cache DNS vidé" "SUCCESS"
        
        # Réinitialiser les paramètres réseau
        Write-Host "🔄 Réinitialisation des paramètres réseau..." -ForegroundColor Blue
        netsh winsock reset | Out-Null
        netsh int ip reset | Out-Null
        Write-Log "✅ Paramètres réseau réinitialisés" "SUCCESS"
        
        # Vider l'ARP cache
        arp -d * | Out-Null
        Write-Log "✅ Cache ARP vidé" "SUCCESS"
        
        # Supprimer les entrées hosts potentielles
        $hostsFile = "$env:SystemRoot\System32\drivers\etc\hosts"
        if (Test-Path $hostsFile) {
            $hostsContent = Get-Content $hostsFile
            $filteredContent = $hostsContent | Where-Object { $_ -notmatch "kiro" -and $_ -notmatch "Kiro" }
            if ($hostsContent.Count -ne $filteredContent.Count) {
                Set-Content -Path $hostsFile -Value $filteredContent
                Write-Log "✅ Entrées Kiro supprimées du fichier hosts" "SUCCESS"
            }
        }
        
    } catch {
        Write-Log "❌ Erreur lors du nettoyage des traces réseau : $_" "ERROR"
    }
    
    Pause
}

function Clear-SystemCaches {
    Write-Log "═══ VIDAGE DES CACHES SYSTÈME ═══"
    
    try {
        # Cache Windows Update
        Write-Host "🔄 Nettoyage du cache Windows Update..." -ForegroundColor Blue
        Stop-Service -Name wuauserv -Force -ErrorAction SilentlyContinue
        Remove-Item -Path "$env:SystemRoot\SoftwareDistribution\Download\*" -Recurse -Force -ErrorAction SilentlyContinue
        Start-Service -Name wuauserv -ErrorAction SilentlyContinue
        Write-Log "✅ Cache Windows Update nettoyé" "SUCCESS"
        
        # Cache Prefetch
        Write-Host "🔄 Nettoyage du cache Prefetch..." -ForegroundColor Blue
        Remove-Item -Path "$env:SystemRoot\Prefetch\*KIRO*" -Force -ErrorAction SilentlyContinue
        Write-Log "✅ Cache Prefetch nettoyé" "SUCCESS"
        
        # Cache Thumbnail
        Write-Host "🔄 Nettoyage du cache des miniatures..." -ForegroundColor Blue
        Remove-Item -Path "$env:LOCALAPPDATA\Microsoft\Windows\Explorer\thumbcache_*.db" -Force -ErrorAction SilentlyContinue
        Write-Log "✅ Cache des miniatures nettoyé" "SUCCESS"
        
        # Cache Icon
        Remove-Item -Path "$env:LOCALAPPDATA\IconCache.db" -Force -ErrorAction SilentlyContinue
        Write-Log "✅ Cache des icônes nettoyé" "SUCCESS"
        
        # Temp files
        Write-Host "🔄 Nettoyage des fichiers temporaires..." -ForegroundColor Blue
        $tempPaths = @(
            "$env:TEMP\*kiro*",
            "$env:WINDIR\Temp\*kiro*",
            "$env:LOCALAPPDATA\Temp\*kiro*"
        )
        
        foreach ($tempPath in $tempPaths) {
            $basePath = Split-Path $tempPath
            $filter = Split-Path $tempPath -Leaf
            if (Test-Path $basePath) {
                Get-ChildItem -Path $basePath -Filter $filter -ErrorAction SilentlyContinue |
                Remove-Item -Recurse -Force -ErrorAction SilentlyContinue
            }
        }
        Write-Log "✅ Fichiers temporaires nettoyés" "SUCCESS"
        
    } catch {
        Write-Log "❌ Erreur lors du vidage des caches : $_" "ERROR"
    }
    
    Pause
}

function Create-Backup {
    Write-Log "═══ CRÉATION D'UNE SAUVEGARDE ═══"
    
    try {
        if (-not (Test-Path $Global:BackupFolder)) {
            New-Item -Path $Global:BackupFolder -ItemType Directory -Force | Out-Null
        }
        
        Write-Host "🔄 Création de la sauvegarde dans : $Global:BackupFolder" -ForegroundColor Blue
        
        # Sauvegarde du registre
        Write-Host "🔄 Sauvegarde du registre..." -ForegroundColor Blue
        reg export "HKEY_CURRENT_USER\Software" "$Global:BackupFolder\HKCU_Software_Backup.reg" /y | Out-Null
        reg export "HKEY_LOCAL_MACHINE\Software" "$Global:BackupFolder\HKLM_Software_Backup.reg" /y | Out-Null
        Write-Log "✅ Sauvegarde du registre créée" "SUCCESS"
        
        # Sauvegarde des fichiers AppData
        $pathsToBackup = @(
            "$env:LOCALAPPDATA\Kiro",
            "$env:APPDATA\Kiro",
            "$env:PROGRAMDATA\Kiro"
        )
        
        foreach ($path in $pathsToBackup) {
            if (Test-Path $path) {
                $backupName = Split-Path $path -Leaf
                $backupPath = Join-Path $Global:BackupFolder "AppData_$backupName"
                Copy-Item -Path $path -Destination $backupPath -Recurse -Force -ErrorAction SilentlyContinue
                Write-Log "✅ Sauvegardé : $path" "SUCCESS"
            }
        }
        
        # Sauvegarde de la Machine ID
        $machineGuid = (Get-ItemProperty -Path "HKLM:\SOFTWARE\Microsoft\Cryptography" -Name "MachineGuid" -ErrorAction SilentlyContinue).MachineGuid
        if ($machineGuid) {
            $machineGuid | Out-File -FilePath "$Global:BackupFolder\MachineGuid_Backup.txt"
            Write-Log "✅ Machine ID sauvegardée : $machineGuid" "SUCCESS"
        }
        
        # Création d'un rapport de sauvegarde
        $backupReport = @"
RAPPORT DE SAUVEGARDE KIRO RESET TOOL
=====================================
Date : $(Get-Date)
Dossier de sauvegarde : $Global:BackupFolder

Éléments sauvegardés :
- Registre HKCU\Software
- Registre HKLM\Software  
- Fichiers AppData (si présents)
- Machine ID actuelle

Pour restaurer, utilisez l'option 12 du menu principal.
"@
        
        $backupReport | Out-File -FilePath "$Global:BackupFolder\LISEZ-MOI.txt"
        Write-Log "✅ Sauvegarde créée avec succès dans : $Global:BackupFolder" "SUCCESS"
        
    } catch {
        Write-Log "❌ Erreur lors de la création de la sauvegarde : $_" "ERROR"
    }
    
    Pause
}

function Restore-Backup {
    Write-Log "═══ RESTAURATION DEPUIS UNE SAUVEGARDE ═══"
    
    # Lister les sauvegardes disponibles
    $backupFolders = Get-ChildItem -Path $env:TEMP -Directory | Where-Object { $_.Name -like "KiroResetBackup_*" }
    
    if (-not $backupFolders) {
        Write-Log "❌ Aucune sauvegarde trouvée" "ERROR"
        Pause
        return
    }
    
    Write-Host "`n📁 Sauvegardes disponibles :" -ForegroundColor Cyan
    for ($i = 0; $i -lt $backupFolders.Count; $i++) {
        Write-Host "  $($i + 1). $($backupFolders[$i].Name) - $(Get-Date $backupFolders[$i].CreationTime -Format 'dd/MM/yyyy HH:mm')"
    }
    
    do {
        $selection = Read-Host "`nSélectionnez une sauvegarde (1-$($backupFolders.Count)) ou 0 pour annuler"
        if ($selection -eq "0") { return }
    } while (-not ($selection -match '^\d+ -and [int]$selection -ge 1 -and [int]$selection -le $backupFolders.Count))
    
    $selectedBackup = $backupFolders[[int]$selection - 1].FullName
    
    if (-not (Confirm-Action "⚠️  Confirmer la restauration depuis : $($backupFolders[[int]$selection - 1].Name) ?")) {
        return
    }
    
    try {
        # Restauration du registre
        $regFiles = Get-ChildItem -Path $selectedBackup -Filter "*.reg"
        foreach ($regFile in $regFiles) {
            Write-Host "🔄 Restauration : $($regFile.Name)" -ForegroundColor Blue
            reg import $regFile.FullName | Out-Null
            Write-Log "✅ Registre restauré : $($regFile.Name)" "SUCCESS"
        }
        
        # Restauration de la Machine ID
        $machineGuidFile = Join-Path $selectedBackup "MachineGuid_Backup.txt"
        if (Test-Path $machineGuidFile) {
            $savedGuid = Get-Content $machineGuidFile
            Set-ItemProperty -Path "HKLM:\SOFTWARE\Microsoft\Cryptography" -Name "MachineGuid" -Value $savedGuid -Force
            Write-Log "✅ Machine ID restaurée : $savedGuid" "SUCCESS"
        }
        
        Write-Log "✅ Restauration terminée avec succès" "SUCCESS"
        
    } catch {
        Write-Log "❌ Erreur lors de la restauration : $_" "ERROR"
    }
    
    Pause
}

function Generate-DetailedReport {
    Write-Log "═══ GÉNÉRATION DU RAPPORT DÉTAILLÉ ═══"
    
    $reportPath = "$env:TEMP\KiroResetReport_$(Get-Date -Format 'yyyyMMdd_HHmmss').html"
    
    try {
        # Collecte des informations système
        $systemInfo = @{
            ComputerName = $env:COMPUTERNAME
            UserName = $env:USERNAME
            OSVersion = (Get-WmiObject -Class Win32_OperatingSystem).Caption
            OSArchitecture = (Get-WmiObject -Class Win32_OperatingSystem).OSArchitecture
            PowerShellVersion = $PSVersionTable.PSVersion.ToString()
            ExecutionTime = Get-Date
            AdminRights = Test-AdminRights
        }
        
        # Analyse complète
        Write-Host "🔍 Analyse en cours..." -ForegroundColor Blue
        
        $analysisResults = @{
            Processes = @(Get-Process | Where-Object { $_.ProcessName -like "*Kiro*" })
            Services = @(Get-Service | Where-Object { $_.Name -like "*Kiro*" -or $_.DisplayName -like "*Kiro*" })
            ScheduledTasks = @()
            RegistryKeys = @()
            Files = @()
        }
        
        # Tâches planifiées
        try {
            $analysisResults.ScheduledTasks = @(Get-ScheduledTask | Where-Object { $_.TaskName -like "*Kiro*" })
        } catch { }
        
        # Clés de registre
        $regPaths = @("HKCU:\Software", "HKLM:\Software", "HKLM:\SOFTWARE\WOW6432Node")
        foreach ($regPath in $regPaths) {
            try {
                $keys = Get-ChildItem -Path $regPath -Recurse -ErrorAction SilentlyContinue | Where-Object { $_.Name -match "Kiro" }
                $analysisResults.RegistryKeys += $keys
            } catch { }
        }
        
        # Fichiers
        $filePaths = @(
            "$env:LOCALAPPDATA\Kiro",
            "$env:APPDATA\Kiro", 
            "$env:PROGRAMDATA\Kiro"
        )
        
        foreach ($path in $filePaths) {
            if (Test-Path $path) {
                $analysisResults.Files += Get-ChildItem -Path $path -Recurse -ErrorAction SilentlyContinue
            }
        }
        
        # Génération du HTML
        $htmlContent = @"
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Rapport Kiro Reset Tool</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background-color: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        h1 { color: #2c3e50; text-align: center; border-bottom: 3px solid #3498db; padding-bottom: 10px; }
        h2 { color: #34495e; border-left: 4px solid #3498db; padding-left: 10px; }
        .info-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; margin: 20px 0; }
        .info-card { background: #ecf0f1; padding: 15px; border-radius: 5px; border-left: 4px solid #3498db; }
        .status-good { color: #27ae60; font-weight: bold; }
        .status-warning { color: #f39c12; font-weight: bold; }
        .status-error { color: #e74c3c; font-weight: bold; }
        table { width: 100%; border-collapse: collapse; margin: 10px 0; }
        th, td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
        th { background-color: #3498db; color: white; }
        tr:nth-child(even) { background-color: #f2f2f2; }
        .summary { background: #d5dbdb; padding: 15px; border-radius: 5px; margin: 20px 0; }
        .timestamp { text-align: center; color: #7f8c8d; font-style: italic; margin-top: 20px; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🔍 RAPPORT D'ANALYSE KIRO RESET TOOL</h1>
        
        <div class="summary">
            <h2>📋 Résumé Exécutif</h2>
            <div class="info-grid">
                <div class="info-card">
                    <strong>Processus actifs:</strong> <span class="$(if($analysisResults.Processes.Count -gt 0){'status-warning'}else{'status-good'})">$($analysisResults.Processes.Count)</span>
                </div>
                <div class="info-card">
                    <strong>Services:</strong> <span class="$(if($analysisResults.Services.Count -gt 0){'status-warning'}else{'status-good'})">$($analysisResults.Services.Count)</span>
                </div>
                <div class="info-card">
                    <strong>Tâches planifiées:</strong> <span class="$(if($analysisResults.ScheduledTasks.Count -gt 0){'status-warning'}else{'status-good'})">$($analysisResults.ScheduledTasks.Count)</span>
                </div>
                <div class="info-card">
                    <strong>Clés de registre:</strong> <span class="$(if($analysisResults.RegistryKeys.Count -gt 0){'status-warning'}else{'status-good'})">$($analysisResults.RegistryKeys.Count)</span>
                </div>
                <div class="info-card">
                    <strong>Fichiers trouvés:</strong> <span class="$(if($analysisResults.Files.Count -gt 0){'status-warning'}else{'status-good'})">$($analysisResults.Files.Count)</span>
                </div>
                <div class="info-card">
                    <strong>Droits admin:</strong> <span class="$(if($systemInfo.AdminRights){'status-good'}else{'status-warning'})">$(if($systemInfo.AdminRights){'✅ Oui'}else{'❌ Non'})</span>
                </div>
            </div>
        </div>

        <h2>💻 Informations Système</h2>
        <table>
            <tr><th>Propriété</th><th>Valeur</th></tr>
            <tr><td>Ordinateur</td><td>$($systemInfo.ComputerName)</td></tr>
            <tr><td>Utilisateur</td><td>$($systemInfo.UserName)</td></tr>
            <tr><td>Système d'exploitation</td><td>$($systemInfo.OSVersion)</td></tr>
            <tr><td>Architecture</td><td>$($systemInfo.OSArchitecture)</td></tr>
            <tr><td>PowerShell</td><td>$($systemInfo.PowerShellVersion)</td></tr>
            <tr><td>Droits administrateur</td><td>$(if($systemInfo.AdminRights){'✅ Oui'}else{'❌ Non'})</td></tr>
        </table>
"@

        # Ajout des sections détaillées
        if ($analysisResults.Processes.Count -gt 0) {
            $htmlContent += @"
        <h2>⚡ Processus Actifs</h2>
        <table>
            <tr><th>Nom du processus</th><th>PID</th><th>Mémoire (MB)</th><th>Chemin</th></tr>
"@
            foreach ($process in $analysisResults.Processes) {
                $memory = [math]::Round($process.WorkingSet64 / 1MB, 2)
                $path = try { $process.MainModule.FileName } catch { "N/A" }
                $htmlContent += "<tr><td>$($process.ProcessName)</td><td>$($process.Id)</td><td>$memory</td><td>$path</td></tr>"
            }
            $htmlContent += "</table>"
        }

        if ($analysisResults.Services.Count -gt 0) {
            $htmlContent += @"
        <h2>🔧 Services</h2>
        <table>
            <tr><th>Nom du service</th><th>Nom d'affichage</th><th>Statut</th><th>Type de démarrage</th></tr>
"@
            foreach ($service in $analysisResults.Services) {
                $htmlContent += "<tr><td>$($service.Name)</td><td>$($service.DisplayName)</td><td>$($service.Status)</td><td>$($service.StartType)</td></tr>"
            }
            $htmlContent += "</table>"
        }

        if ($analysisResults.ScheduledTasks.Count -gt 0) {
            $htmlContent += @"
        <h2>📅 Tâches Planifiées</h2>
        <table>
            <tr><th>Nom de la tâche</th><th>État</th><th>Dernière exécution</th></tr>
"@
            foreach ($task in $analysisResults.ScheduledTasks) {
                $lastRun = try { $task.LastRunTime } catch { "N/A" }
                $htmlContent += "<tr><td>$($task.TaskName)</td><td>$($task.State)</td><td>$lastRun</td></tr>"
            }
            $htmlContent += "</table>"
        }

        if ($analysisResults.RegistryKeys.Count -gt 0) {
            $htmlContent += @"
        <h2>🗂️ Clés de Registre</h2>
        <table>
            <tr><th>Chemin de la clé</th><th>Nombre de sous-clés</th></tr>
"@
            foreach ($key in $analysisResults.RegistryKeys) {
                $subKeyCount = try { ($key | Get-ChildItem -ErrorAction SilentlyContinue).Count } catch { 0 }
                $htmlContent += "<tr><td>$($key.Name)</td><td>$subKeyCount</td></tr>"
            }
            $htmlContent += "</table>"
        }

        if ($analysisResults.Files.Count -gt 0) {
            $htmlContent += @"
        <h2>📁 Fichiers et Dossiers</h2>
        <table>
            <tr><th>Nom</th><th>Type</th><th>Taille</th><th>Dernière modification</th><th>Chemin</th></tr>
"@
            foreach ($file in ($analysisResults.Files | Select-Object -First 50)) {
                $size = if ($file.PSIsContainer) { "Dossier" } else { "$([math]::Round($file.Length / 1KB, 2)) KB" }
                $htmlContent += "<tr><td>$($file.Name)</td><td>$(if($file.PSIsContainer){'📁 Dossier'}else{'📄 Fichier'})</td><td>$size</td><td>$($file.LastWriteTime)</td><td>$($file.FullName)</td></tr>"
            }
            $htmlContent += "</table>"
            
            if ($analysisResults.Files.Count -gt 50) {
                $htmlContent += "<p><em>Note: Seuls les 50 premiers éléments sont affichés. Total: $($analysisResults.Files.Count) éléments.</em></p>"
            }
        }

        $htmlContent += @"
        <h2>📝 Recommandations</h2>
        <div class="info-card">
"@

        if ($analysisResults.Processes.Count -gt 0) {
            $htmlContent += "<p>🔴 <strong>Processus actifs détectés:</strong> Il est recommandé d'arrêter ces processus avant de procéder à la désinstallation.</p>"
        }
        
        if ($analysisResults.Services.Count -gt 0) {
            $htmlContent += "<p>🟡 <strong>Services détectés:</strong> Ces services doivent être arrêtés et supprimés.</p>"
        }
        
        if ($analysisResults.RegistryKeys.Count -gt 0) {
            $htmlContent += "<p>🟡 <strong>Entrées de registre trouvées:</strong> Le nettoyage du registre est recommandé.</p>"
        }
        
        if (-not $systemInfo.AdminRights) {
            $htmlContent += "<p>🔴 <strong>Droits administrateur requis:</strong> Exécutez le script en tant qu'administrateur pour un nettoyage complet.</p>"
        }
        
        if ($analysisResults.Processes.Count -eq 0 -and $analysisResults.Services.Count -eq 0 -and $analysisResults.RegistryKeys.Count -eq 0 -and $analysisResults.Files.Count -eq 0) {
            $htmlContent += "<p>✅ <strong>Système propre:</strong> Aucune trace de Kiro détectée sur ce système.</p>"
        }

        $htmlContent += @"
        </div>
        
        <div class="timestamp">
            <p>Rapport généré le $($systemInfo.ExecutionTime) par Kiro Reset Tool v2.0</p>
            <p>Fichier de log: $Global:LogFile</p>
        </div>
    </div>
</body>
</html>
"@

        # Sauvegarde du rapport
        $htmlContent | Out-File -FilePath $reportPath -Encoding UTF8
        Write-Log "✅ Rapport généré : $reportPath" "SUCCESS"
        
        # Ouverture automatique
        if (Confirm-Action "Voulez-vous ouvrir le rapport dans votre navigateur ?") {
            Start-Process $reportPath
        }
        
    } catch {
        Write-Log "❌ Erreur lors de la génération du rapport : $_" "ERROR"
    }
    
    Pause
}

function Toggle-VerboseMode {
    $Global:VerboseMode = -not $Global:VerboseMode
    Write-Log "Mode verbose : $(if($Global:VerboseMode){'✅ Activé'}else{'❌ Désactivé'})" "INFO"
    Start-Sleep -Seconds 1
}

function Open-LogFolder {
    $logFolder = Split-Path $Global:LogFile
    if (Test-Path $logFolder) {
        Start-Process explorer.exe -ArgumentList $logFolder
        Write-Log "📂 Ouverture du dossier des logs : $logFolder" "INFO"
    } else {
        Write-Log "❌ Dossier des logs introuvable" "ERROR"
    }
    Start-Sleep -Seconds 1
}

function Perform-FullReset {
    Write-Log "═══ RESET COMPLET DE KIRO ═══"
    
    if (-not (Confirm-Action "⚠️  ATTENTION: Cela va effectuer un nettoyage complet de Kiro sur ce système. Cette action est irréversible.")) {
        return
    }
    
    Write-Host "`n🚀 Démarrage du reset complet..." -ForegroundColor Green
    
    # Création d'une sauvegarde automatique
    Write-Host "`n1/9 Création d'une sauvegarde de sécurité..." -ForegroundColor Cyan
    Create-Backup
    
    # Arrêt des processus
    Write-Host "`n2/9 Arrêt des processus..." -ForegroundColor Cyan
    Stop-KiroProcesses
    
    # Désinstallation
    Write-Host "`n3/9 Désinstallation..." -ForegroundColor Cyan
    Uninstall-Kiro
    
    # Suppression des fichiers
    Write-Host "`n4/9 Suppression des fichiers..." -ForegroundColor Cyan
    Delete-AppData
    
    # Nettoyage du registre
    Write-Host "`n5/9 Nettoyage du registre..." -ForegroundColor Cyan
    Clean-Registry
    
    # Nettoyage des services
    Write-Host "`n6/9 Nettoyage des services..." -ForegroundColor Cyan
    Clean-Services
    
    # Suppression des tâches planifiées
    Write-Host "`n7/9 Suppression des tâches planifiées..." -ForegroundColor Cyan
    Clean-ScheduledTasks
    
    # Nettoyage des traces réseau
    Write-Host "`n8/9 Nettoyage des traces réseau..." -ForegroundColor Cyan
    Clean-NetworkTraces
    
    # Réinitialisation de la Machine ID
    Write-Host "`n9/9 Réinitialisation de la Machine ID..." -ForegroundColor Cyan
    Reset-MachineID
    
    Write-Host "`n" + "="*70 -ForegroundColor Green
    Write-Host "🎉 RESET COMPLET TERMINÉ AVEC SUCCÈS!" -ForegroundColor Green
    Write-Host "="*70 -ForegroundColor Green
    Write-Host "`n📋 Résumé des actions effectuées:" -ForegroundColor Cyan
    Write-Host "   ✅ Sauvegarde créée dans : $Global:BackupFolder"
    Write-Host "   ✅ Processus arrêtés"
    Write-Host "   ✅ Application désinstallée"
    Write-Host "   ✅ Fichiers utilisateur supprimés"
    Write-Host "   ✅ Registre nettoyé"
    Write-Host "   ✅ Services supprimés"
    Write-Host "   ✅ Tâches planifiées supprimées"
    Write-Host "   ✅ Traces réseau nettoyées"
    Write-Host "   ✅ Machine ID réinitialisée"
    Write-Host "`n📄 Log complet disponible : $Global:LogFile" -ForegroundColor Gray
    Write-Host "`n⚠️  Un redémarrage du système est recommandé pour finaliser le nettoyage." -ForegroundColor Yellow
    
    if (Confirm-Action "Voulez-vous redémarrer le système maintenant ?") {
        Write-Log "Redémarrage du système demandé par l'utilisateur" "INFO"
        Restart-Computer -Force
    }
    
    Pause
}

# Initialisation du script
function Initialize-Script {
    # Vérification de la version PowerShell
    if ($PSVersionTable.PSVersion.Major -lt 5) {
        Write-Host "❌ Ce script nécessite PowerShell 5.0 ou supérieur" -ForegroundColor Red
        Write-Host "   Version actuelle : $($PSVersionTable.PSVersion)" -ForegroundColor Yellow
        exit 1
    }
    
    # Création du fichier de log
    try {
        "═══ NOUVEAU SESSION KIRO RESET TOOL ═══" | Out-File -FilePath $Global:LogFile -Encoding UTF8
        Write-Log "Script démarré par $env:USERNAME sur $env:COMPUTERNAME"
        Write-Log "Version PowerShell : $($PSVersionTable.PSVersion)"
        Write-Log "Droits administrateur : $(Test-AdminRights)"
        Write-Log "Dossier de sauvegarde : $Global:BackupFolder"
    } catch {
        Write-Host "⚠️  Impossible de créer le fichier de log : $_" -ForegroundColor Yellow
    }
}

# Fonction principale
function Main {
    Initialize-Script
    
    while ($true) {
        try {
            Show-Menu
            $selection = Read-Host "`n🎯 Sélectionnez une option (0-15)"
            
            switch ($selection) {
                '1'  { Analyze-KiroInstallation }
                '2'  { Uninstall-Kiro }
                '3'  { Delete-AppData }
                '4'  { Clean-Registry }
                '5'  { Reset-MachineID }
                '6'  { Clean-Services }
                '7'  { Clean-ScheduledTasks }
                '8'  { Clean-NetworkTraces }
                '9'  { Clear-SystemCaches }
                '10' { Perform-FullReset }
                '11' { Create-Backup }
                '12' { Restore-Backup }
                '13' { Generate-DetailedReport }
                '14' { Toggle-VerboseMode }
                '15' { Open-LogFolder }
                '0'  { 
                    Write-Log "Script terminé par l'utilisateur"
                    Write-Host "`n👋 Merci d'avoir utilisé Kiro Reset Tool!" -ForegroundColor Green
                    Write-Host "📄 Log sauvegardé : $Global:LogFile" -ForegroundColor Gray
                    exit 0
                }
                default { 
                    Write-Host "❌ Option invalide. Veuillez sélectionner un nombre entre 0 et 15." -ForegroundColor Red
                    Start-Sleep -Seconds 2
                }
            }
        } catch {
            Write-Log "❌ Erreur inattendue dans le menu principal : $_" "ERROR"
            Write-Host "Une erreur inattendue s'est produite. Consultez le fichier de log pour plus de détails." -ForegroundColor Red
            Pause
        }
    }
}

# Point d'entrée du script
try {
    Main
} catch {
    Write-Host "❌ Erreur critique : $_" -ForegroundColor Red
    Write-Host "Le script va se fermer. Consultez le fichier de log : $Global:LogFile" -ForegroundColor Yellow
    Pause
    exit 1
}"âœ… DÃ©sinstallation registry rÃ©ussie : $($app.DisplayName)" "SUCCESS"
                    }
                }
            } catch {
                Write-Log "âŒ Erreur registry uninstall : $_" "ERROR"
            }
        }
        
    } catch {
        Write-Log "âŒ Erreur gÃ©nÃ©rale lors de la dÃ©sinstallation : $_" "ERROR"
    }
    
    Write-Log "âœ… Processus de dÃ©sinstallation terminÃ©" "SUCCESS"
    Pause
}

function Delete-AppData {
    Write-Log "â•â•â• SUPPRESSION DES FICHIERS UTILISATEUR â•â•â•"
    
    $paths = @(
        "$env:LOCALAPPDATA\Kiro",
        "$env:APPDATA\Kiro",
        "$env:PROGRAMDATA\Kiro",
        "$env:PUBLIC\Desktop\Kiro.lnk",
        "$env:USERPROFILE\Desktop\Kiro.lnk",
        "$env:APPDATA\Microsoft\Windows\Start Menu\Programs\Kiro",
        "$env:PROGRAMDATA\Microsoft\Windows\Start Menu\Programs\Kiro"
    )
    
    # Ajout de chemins supplÃ©mentaires potentiels
    $additionalPaths = @(
        "$env:TEMP\Kiro*",
        "$env:LOCALAPPDATA\Temp\Kiro*"
    )
    
    try {
        foreach ($path in $paths) {
            if (Test-Path $path) {
                if ($Global:VerboseMode) {
                    Write-Log "Suppression : $path"
                }
                Remove-Item -Path $path -Recurse -Force -ErrorAction SilentlyContinue
                Write-Log "âœ… SupprimÃ© : $path" "SUCCESS"
            } else {
                if ($Global:VerboseMode) {
                    Write-Log "â„¹ï¸ Non trouvÃ© : $path" "INFO"
                }
            }
        }
        
        # Suppression des fichiers temporaires avec wildcard
        foreach ($wildPath in $additionalPaths) {
            $items = Get-ChildItem -Path (Split-Path $wildPath) -Filter (Split-Path $wildPath -Leaf) -ErrorAction SilentlyContinue
            foreach ($item in $items) {
                Remove-Item -Path $item.FullName -Recurse -Force -ErrorAction SilentlyContinue
                Write-Log "âœ… SupprimÃ© (temp) : $($item.FullName)" "SUCCESS"
            }
        }
        
    } catch {
        Write-Log "âŒ Erreur lors de la suppression des fichiers : $_" "ERROR"
    }
    
    Pause
}

function Clean-Registry {
    Write-Log "â•â•â• NETTOYAGE DU REGISTRE â•â•â•"
    
    if (-not (Test-AdminRights)) {
        Write-Log "âŒ Droits administrateur requis pour le nettoyage du registre" "ERROR"
        Pause
        return
    }
    
    if (-not (Confirm-Action "âš ï¸  Cela va supprimer toutes les clÃ©s de registre liÃ©es Ã  Kiro.")) {
        return
    }
    
    $registryPaths = @(
        "HKCU:\Software",
        "HKLM:\Software",
        "HKLM:\SOFTWARE\WOW6432Node",
        "HKCU:\SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall",
        "HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall",
        "HKLM:\SOFTWARE\WOW6432Node\Microsoft\Windows\CurrentVersion\Uninstall"
    )
    
    $foundKeys = @()
    
    try {
        foreach ($regPath in $registryPaths) {
            if ($Global:VerboseMode) {
                Write-Log "Analyse de : $regPath"
            }
            
            try {
                $keys = Get-ChildItem -Path $regPath -Recurse -ErrorAction SilentlyContinue | 
                        Where-Object { $_.Name -match "Kiro" -or $_.PSChildName -match "Kiro" }
                $foundKeys += $keys
            } catch {
                if ($Global:VerboseMode) {
                    Write-Log "âš ï¸  Impossible d'analyser $regPath : $_" "WARNING"
                }
            }
        }
        
        if ($foundKeys.Count -gt 0) {
            Write-Log "ðŸ” $($foundKeys.Count) clÃ©(s) de registre trouvÃ©e(s)"
            
            foreach ($key in $foundKeys) {
                try {
                    if ($Global:VerboseMode) {
                        Write-Log "Suppression : $($key.PSPath)"
                    }
                    Remove-Item -Path $key.PSPath -Recurse -Force -ErrorAction Stop
                    Write-Log "âœ… SupprimÃ© : $($key.Name)" "SUCCESS"
                } catch {
                    Write-Log "âŒ Impossible de supprimer : $($key.Name) - $_" "ERROR"
                }
            }
        } else {
            Write-Log "â„¹ï¸ Aucune clÃ© de registre trouvÃ©e pour Kiro" "INFO"
        }
        
    } catch {
        Write-Log "âŒ Erreur lors du nettoyage du registre : $_" "ERROR"
    }
    
    Pause
}

function Reset-MachineID {
    Write-Log "â•â•â• RÃ‰INITIALISATION DE LA MACHINE ID â•â•â•"
    
    if (-not (Test-AdminRights)) {
        Write-Log "âŒ Droits administrateur requis pour rÃ©initialiser la Machine ID" "ERROR"
        Pause
        return
    }
    
    if (-not (Confirm-Action "âš ï¸  Cela va gÃ©nÃ©rer un nouvel identifiant unique pour cette machine.")) {
        return
    }
    
    try {
        $regPath = "HKLM:\SOFTWARE\Microsoft\Cryptography"
        $currentGuid = (Get-ItemProperty -Path $regPath -Name "MachineGuid" -ErrorAction SilentlyContinue).MachineGuid
        
        if ($currentGuid) {
            Write-Log "Machine ID actuelle : $currentGuid"
        }
        
        $newGuid = [guid]::NewGuid().ToString()
        Set-ItemProperty -Path $regPath -Name "MachineGuid" -Value $newGuid -Force
        
        Write-Log "âœ… Nouvelle Machine ID : $newGuid" "SUCCESS"
        
        # RÃ©initialisation d'autres identifiants systÃ¨me
        $additionalPaths = @{
            "HKLM:\SOFTWARE\Microsoft\Windows NT\CurrentVersion" = "InstallDate"
            "HKLM:\SYSTEM\CurrentControlSet\Control\IDConfigDB\Hardware Profiles\0001" = "HwProfileGuid"
        }
        
        foreach ($path in $additionalPaths.Keys) {
            try {
                $property = $additionalPaths[$path]
                if ($property -eq "InstallDate") {
                    $newValue = [int][double]::Parse((Get-Date -UFormat %s))
                } else {
                    $newValue = [guid]::NewGuid().ToString()
                }
                
                Set-ItemProperty -Path $path -Name $property -Value $newValue -Force -ErrorAction SilentlyContinue
                Write-Log "âœ… RÃ©initialisÃ© : $path\$property" "SUCCESS"
            } catch {
                Write-Log "âš ï¸  Impossible de rÃ©initialiser $path\$($additionalPaths[$path])" "WARNING"
            }
        }
        
    } catch {
        Write-Log "âŒ Erreur lors de la rÃ©initialisation de la Machine ID : $_" "ERROR"
    }
    
    Pause
}

function Clean-Services {
    Write-Log "â•â•â• NETTOYAGE DES SERVICES WINDOWS â•â•â•"
    
    if (-not (Test-AdminRights)) {
        Write-Log "âŒ Droits administrateur requis pour gÃ©rer les services" "ERROR"
        Pause
        return
    }
    
    try {
        $services = Get-Service | Where-Object { 
            $_.Name -like "*Kiro*" -or 
            $_.DisplayName -like "*Kiro*" 
        }
        
        if ($services) {
            Write-Log "ðŸ” $($services.Count) service(s) Kiro trouvÃ©(s)"
            
            foreach ($service in $services) {
                try {
                    Write-Log "Traitement du service : $($service.DisplayName) ($($service.Name))"
                    
                    if ($service.Status -eq 'Running') {
                        Stop-Service -Name $service.Name -Force -ErrorAction Stop
                        Write-Log "âœ… Service arrÃªtÃ© : $($service.Name)" "SUCCESS"
                    }
                    
                    # Suppression du service
                    sc.exe delete $service.Name | Out-Null
                    Write-Log "âœ… Service supprimÃ© : $($service.Name)" "SUCCESS"
                    
                } catch {
                    Write-Log "âŒ Erreur avec le service $($service.Name) : $_" "ERROR"
                }
            }
        } else {
            Write-Log "â„¹ï¸ Aucun service Kiro trouvÃ©" "INFO"
        }
        
    } catch {
        Write-Log "âŒ Erreur lors du nettoyage des services : $_" "ERROR"
    }
    
    Pause
}

function Clean-ScheduledTasks {
    Write-Log "â•â•â• SUPPRESSION DES TÃ‚CHES PLANIFIÃ‰ES â•â•â•"
    
    if (-not (Test-AdminRights)) {
        Write-Log "âŒ Droits administrateur requis pour gÃ©rer les tÃ¢ches planifiÃ©es" "ERROR"
        Pause
        return
    }
    
    try {
        $tasks = Get-ScheduledTask | Where-Object { 
            $_.TaskName -like "*Kiro*" -or 
            $_.Description -like "*Kiro*" 
        }
        
        if ($tasks) {
            Write-Log "ðŸ” $($tasks.Count) tÃ¢che(s) planifiÃ©e(s) trouvÃ©e(s)"
            
            foreach ($task in $tasks) {
                try {
                    Unregister-ScheduledTask -TaskName $task.TaskName -Confirm:$false -ErrorAction Stop
                    Write-Log "âœ… TÃ¢che supprimÃ©e : $($task.TaskName)" "SUCCESS"
                } catch {
                    Write-Log "âŒ Erreur lors de la suppression de la tÃ¢che $($task.TaskName) : $_" "ERROR"
                }
            }
        } else {
            Write-Log "â„¹ï¸ Aucune tÃ¢che planifiÃ©e Kiro trouvÃ©e" "INFO"
        }
        
    } catch {
        Write-Log "âŒ Erreur lors du nettoyage des tÃ¢ches planifiÃ©es : $_" "ERROR"
    }
    
    Pause
}

function Clean-NetworkTraces {
    Write-Log "â•â•â• NETTOYAGE DES TRACES RÃ‰SEAU â•â•â•"
    
    try {
        # Vider le cache DNS
        Write-Host "ðŸ”„ Vidage du cache DNS..." -ForegroundColor Blue
        ipconfig /flushdns | Out-Null
        Write-Log "âœ… Cache DNS vidÃ©" "SUCCESS"
        
        # RÃ©initialiser les paramÃ¨tres rÃ©seau
        Write-Host "ðŸ”„ RÃ©initialisation des paramÃ¨tres rÃ©seau..." -ForegroundColor Blue
        netsh winsock reset | Out-Null
        netsh int ip reset | Out-Null
        Write-Log "âœ… ParamÃ¨tres rÃ©seau rÃ©initialisÃ©s" "SUCCESS"
        
        # Vider l'ARP cache
        arp -d * | Out-Null
        Write-Log "âœ… Cache ARP vidÃ©" "SUCCESS"
        
        # Supprimer les entrÃ©es hosts potentielles
        $hostsFile = "$env:SystemRoot\System32\drivers\etc\hosts"
        if (Test-Path $hostsFile) {
            $hostsContent = Get-Content $hostsFile
            $filteredContent = $hostsContent | Where-Object { $_ -notmatch "kiro" -and $_ -notmatch "Kiro" }
            if ($hostsContent.Count -ne $filteredContent.Count) {
                Set-Content -Path $hostsFile -Value $filteredContent
                Write-Log "âœ… EntrÃ©es Kiro supprimÃ©es du fichier hosts" "SUCCESS"
            }
        }
        
    } catch {
        Write-Log "âŒ Erreur lors du nettoyage des traces rÃ©seau : $_" "ERROR"
    }
    
    Pause
}

function Clear-SystemCaches {
    Write-Log "â•â•â• VIDAGE DES CACHES SYSTÃˆME â•â•â•"
    
    try {
        # Cache Windows Update
        Write-Host "ðŸ”„ Nettoyage du cache Windows Update..." -ForegroundColor Blue
        Stop-Service -Name wuauserv -Force -ErrorAction SilentlyContinue
        Remove-Item -Path "$env:SystemRoot\SoftwareDistribution\Download\*" -Recurse -Force -ErrorAction SilentlyContinue
        Start-Service -Name wuauserv -ErrorAction SilentlyContinue
        Write-Log "âœ… Cache Windows Update nettoyÃ©" "SUCCESS"
        
        # Cache Prefetch
        Write-Host "ðŸ”„ Nettoyage du cache Prefetch..." -ForegroundColor Blue
        Remove-Item -Path "$env:SystemRoot\Prefetch\*KIRO*" -Force -ErrorAction SilentlyContinue
        Write-Log "âœ… Cache Prefetch nettoyÃ©" "SUCCESS"
        
        # Cache Thumbnail
        Write-Host "ðŸ”„ Nettoyage du cache des miniatures..." -ForegroundColor Blue
        Remove-Item -Path "$env:LOCALAPPDATA\Microsoft\Windows\Explorer\thumbcache_*.db" -Force -ErrorAction SilentlyContinue
        Write-Log "âœ… Cache des miniatures nettoyÃ©" "SUCCESS"
        
        # Cache Icon
        Remove-Item -Path "$env:LOCALAPPDATA\IconCache.db" -Force -ErrorAction SilentlyContinue
        Write-Log "âœ… Cache des icÃ´nes nettoyÃ©" "SUCCESS"
        
        # Temp files
        Write-Host "ðŸ”„ Nettoyage des fichiers temporaires..." -ForegroundColor Blue
        $tempPaths = @(
            "$env:TEMP\*kiro*",
            "$env:WINDIR\Temp\*kiro*",
            "$env:LOCALAPPDATA\Temp\*kiro*"
        )
        
        foreach ($tempPath in $tempPaths) {
            $basePath = Split-Path $tempPath
            $filter = Split-Path $tempPath -Leaf
            if (Test-Path $basePath) {
                Get-ChildItem -Path $basePath -Filter $filter -ErrorAction SilentlyContinue |
                Remove-Item -Recurse -Force -ErrorAction SilentlyContinue
            }
        }
        Write-Log "âœ… Fichiers temporaires nettoyÃ©s" "SUCCESS"
        
    } catch {
        Write-Log "âŒ Erreur lors du vidage des caches : $_" "ERROR"
    }
    
    Pause
}

function Create-Backup {
    Write-Log "â•â•â• CRÃ‰ATION D'UNE SAUVEGARDE â•â•â•"
    
    try {
        if (-not (Test-Path $Global:BackupFolder)) {
            New-Item -Path $Global:BackupFolder -ItemType Directory -Force | Out-Null
        }
        
        Write-Host "ðŸ”„ CrÃ©ation de la sauvegarde dans : $Global:BackupFolder" -ForegroundColor Blue
        
        # Sauvegarde du registre
        Write-Host "ðŸ”„ Sauvegarde du registre..." -ForegroundColor Blue
        reg export "HKEY_CURRENT_USER\Software" "$Global:BackupFolder\HKCU_Software_Backup.reg" /y | Out-Null
        reg export "HKEY_LOCAL_MACHINE\Software" "$Global:BackupFolder\HKLM_Software_Backup.reg" /y | Out-Null
        Write-Log "âœ… Sauvegarde du registre crÃ©Ã©e" "SUCCESS"
        
        # Sauvegarde des fichiers AppData
        $pathsToBackup = @(
            "$env:LOCALAPPDATA\Kiro",
            "$env:APPDATA\Kiro",
            "$env:PROGRAMDATA\Kiro"
        )
        
        foreach ($path in $pathsToBackup) {
            if (Test-Path $path) {
                $backupName = Split-Path $path -Leaf
                $backupPath = Join-Path $Global:BackupFolder "AppData_$backupName"
                Copy-Item -Path $path -Destination $backupPath -Recurse -Force -ErrorAction SilentlyContinue
                Write-Log "âœ… SauvegardÃ© : $path" "SUCCESS"
            }
        }
        
        # Sauvegarde de la Machine ID
        $machineGuid = (Get-ItemProperty -Path "HKLM:\SOFTWARE\Microsoft\Cryptography" -Name "MachineGuid" -ErrorAction SilentlyContinue).MachineGuid
        if ($machineGuid) {
            $machineGuid | Out-File -FilePath "$Global:BackupFolder\MachineGuid_Backup.txt"
            Write-Log "âœ… Machine ID sauvegardÃ©e : $machineGuid" "SUCCESS"
        }
        
        # CrÃ©ation d'un rapport de sauvegarde
        $backupReport = @"
RAPPORT DE SAUVEGARDE KIRO RESET TOOL
=====================================
Date : $(Get-Date)
Dossier de sauvegarde : $Global:BackupFolder

Ã‰lÃ©ments sauvegardÃ©s :
- Registre HKCU\Software
- Registre HKLM\Software  
- Fichiers AppData (si prÃ©sents)
- Machine ID actuelle

Pour restaurer, utilisez l'option 12 du menu principal.
"@
        
        $backupReport | Out-File -FilePath "$Global:BackupFolder\LISEZ-MOI.txt"
        Write-Log "âœ… Sauvegarde crÃ©Ã©e avec succÃ¨s dans : $Global:BackupFolder" "SUCCESS"
        
    } catch {
        Write-Log "âŒ Erreur lors de la crÃ©ation de la sauvegarde : $_" "ERROR"
    }
    
    Pause
}

function Restore-Backup {
    Write-Log "â•â•â• RESTAURATION DEPUIS UNE SAUVEGARDE â•â•â•"
    
    # Lister les sauvegardes disponibles
    $backupFolders = Get-ChildItem -Path $env:TEMP -Directory | Where-Object { $_.Name -like "KiroResetBackup_*" }
    
    if (-not $backupFolders) {
        Write-Log "âŒ Aucune sauvegarde trouvÃ©e" "ERROR"
        Pause
        return
    }
    
    Write-Host "`nðŸ“ Sauvegardes disponibles :" -ForegroundColor Cyan
    for ($i = 0; $i -lt $backupFolders.Count; $i++) {
        Write-Host "  $($i + 1). $($backupFolders[$i].Name) - $(Get-Date $backupFolders[$i].CreationTime -Format 'dd/MM/yyyy HH:mm')"
    }
    
    do {
        $selection = Read-Host "`nSÃ©lectionnez une sauvegarde (1-$($backupFolders.Count)) ou 0 pour annuler"
        if ($selection -eq "0") { return }
    } while (-not ($selection -match '^\d+ -and [int]$selection -ge 1 -and [int]$selection -le $backupFolders.Count))
    
    $selectedBackup = $backupFolders[[int]$selection - 1].FullName
    
    if (-not (Confirm-Action "âš ï¸  Confirmer la restauration depuis : $($backupFolders[[int]$selection - 1].Name) ?")) {
        return
    }
    
    try {
        # Restauration du registre
        $regFiles = Get-ChildItem -Path $selectedBackup -Filter "*.reg"
        foreach ($regFile in $regFiles) {
            Write-Host "ðŸ”„ Restauration : $($regFile.Name)" -ForegroundColor Blue
            reg import $regFile.FullName | Out-Null
            Write-Log "âœ… Registre restaurÃ© : $($regFile.Name)" "SUCCESS"
        }
        
        # Restauration de la Machine ID
        $machineGuidFile = Join-Path $selectedBackup "MachineGuid_Backup.txt"
        if (Test-Path $machineGuidFile) {
            $savedGuid = Get-Content $machineGuidFile
            Set-ItemProperty -Path "HKLM:\SOFTWARE\Microsoft\Cryptography" -Name "MachineGuid" -Value $savedGuid -Force
            Write-Log "âœ… Machine ID restaurÃ©e : $savedGuid" "SUCCESS"
        }
        
        Write-Log "âœ… Restauration terminÃ©e avec succÃ¨s" "SUCCESS"
        
    } catch {
        Write-Log "âŒ Erreur lors de la restauration : $_" "ERROR"
    }
    
    Pause
}

function Generate-DetailedReport {
    Write-Log "â•â•â• GÃ‰NÃ‰RATION DU RAPPORT DÃ‰TAILLÃ‰ â•â•â•"
    
    $reportPath = "$env:TEMP\KiroResetReport_$(Get-Date -Format 'yyyyMMdd_HHmmss').html"
    
    try {
        # Collecte des informations systÃ¨me
        $systemInfo = @{
            ComputerName = $env:COMPUTERNAME
            UserName = $env:USERNAME
            OSVersion = (Get-WmiObject -Class Win32_OperatingSystem).Caption
            OSArchitecture = (Get-WmiObject -Class Win32_OperatingSystem).OSArchitecture
            PowerShellVersion = $PSVersionTable.PSVersion.ToString()
            ExecutionTime = Get-Date
            AdminRights = Test-AdminRights
        }
        
        # Analyse complÃ¨te
        Write-Host "ðŸ” Analyse en cours..." -ForegroundColor Blue
        
        $analysisResults = @{
            Processes = @(Get-Process | Where-Object { $_.ProcessName -like "*Kiro*" })
            Services = @(Get-Service | Where-Object { $_.Name -like "*Kiro*" -or $_.DisplayName -like "*Kiro*" })
            ScheduledTasks = @()
            RegistryKeys = @()
            Files = @()
        }
        
        # TÃ¢ches planifiÃ©es
        try {
            $analysisResults.ScheduledTasks = @(Get-ScheduledTask | Where-Object { $_.TaskName -like "*Kiro*" })
        } catch { }
        
        # ClÃ©s de registre
        $regPaths = @("HKCU:\Software", "HKLM:\Software", "HKLM:\SOFTWARE\WOW6432Node")
        foreach ($regPath in $regPaths) {
            try {
                $keys = Get-ChildItem -Path $regPath -Recurse -ErrorAction SilentlyContinue | Where-Object { $_.Name -match "Kiro" }
                $analysisResults.RegistryKeys += $keys
            } catch { }
        }
        
        # Fichiers
        $filePaths = @(
            "$env:LOCALAPPDATA\Kiro",
            "$env:APPDATA\Kiro", 
            "$env:PROGRAMDATA\Kiro"
        )
        
        foreach ($path in $filePaths) {
            if (Test-Path $path) {
                $analysisResults.Files += Get-ChildItem -Path $path -Recurse -ErrorAction SilentlyContinue
            }
        }
        
        # GÃ©nÃ©ration du HTML
        $htmlContent = @"
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Rapport Kiro Reset Tool</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background-color: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        h1 { color: #2c3e50; text-align: center; border-bottom: 3px solid #3498db; padding-bottom: 10px; }
        h2 { color: #34495e; border-left: 4px solid #3498db; padding-left: 10px; }
        .info-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; margin: 20px 0; }
        .info-card { background: #ecf0f1; padding: 15px; border-radius: 5px; border-left: 4px solid #3498db; }
        .status-good { color: #27ae60; font-weight: bold; }
        .status-warning { color: #f39c12; font-weight: bold; }
        .status-error { color: #e74c3c; font-weight: bold; }
        table { width: 100%; border-collapse: collapse; margin: 10px 0; }
        th, td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
        th { background-color: #3498db; color: white; }
        tr:nth-child(even) { background-color: #f2f2f2; }
        .summary { background: #d5dbdb; padding: 15px; border-radius: 5px; margin: 20px 0; }
        .timestamp { text-align: center; color: #7f8c8d; font-style: italic; margin-top: 20px; }
    </style>
</head>
<body>
    <div class="container">
        <h1>ðŸ” RAPPORT D'ANALYSE KIRO RESET TOOL</h1>
        
        <div class="summary">
            <h2>ðŸ“‹ RÃ©sumÃ© ExÃ©cutif</h2>
            <div class="info-grid">
                <div class="info-card">
                    <strong>Processus actifs:</strong> <span class="$(if($analysisResults.Processes.Count -gt 0){'status-warning'}else{'status-good'})">$($analysisResults.Processes.Count)</span>
                </div>
                <div class="info-card">
                    <strong>Services:</strong> <span class="$(if($analysisResults.Services.Count -gt 0){'status-warning'}else{'status-good'})">$($analysisResults.Services.Count)</span>
                </div>
                <div class="info-card">
                    <strong>TÃ¢ches planifiÃ©es:</strong> <span class="$(if($analysisResults.ScheduledTasks.Count -gt 0){'status-warning'}else{'status-good'})">$($analysisResults.ScheduledTasks.Count)</span>
                </div>
                <div class="info-card">
                    <strong>ClÃ©s de registre:</strong> <span class="$(if($analysisResults.RegistryKeys.Count -gt 0){'status-warning'}else{'status-good'})">$($analysisResults.RegistryKeys.Count)</span>
                </div>
                <div class="info-card">
                    <strong>Fichiers trouvÃ©s:</strong> <span class="$(if($analysisResults.Files.Count -gt 0){'status-warning'}else{'status-good'})">$($analysisResults.Files.Count)</span>
                </div>
                <div class="info-card">
                    <strong>Droits admin:</strong> <span class="$(if($systemInfo.AdminRights){'status-good'}else{'status-warning'})">$(if($systemInfo.AdminRights){'âœ… Oui'}else{'âŒ Non'})</span>
                </div>
            </div>
        </div>

        <h2>ðŸ’» Informations SystÃ¨me</h2>
        <table>
            <tr><th>PropriÃ©tÃ©</th><th>Valeur</th></tr>
            <tr><td>Ordinateur</td><td>$($systemInfo.ComputerName)</td></tr>
            <tr><td>Utilisateur</td><td>$($systemInfo.UserName)</td></tr>
            <tr><td>SystÃ¨me d'exploitation</td><td>$($systemInfo.OSVersion)</td></tr>
            <tr><td>Architecture</td><td>$($systemInfo.OSArchitecture)</td></tr>
            <tr><td>PowerShell</td><td>$($systemInfo.PowerShellVersion)</td></tr>
            <tr><td>Droits administrateur</td><td>$(if($systemInfo.AdminRights){'âœ… Oui'}else{'âŒ Non'})</td></tr>
        </table>
"@

        # Ajout des sections dÃ©taillÃ©es
        if ($analysisResults.Processes.Count -gt 0) {
            $htmlContent += @"
        <h2>⚡ Processus Actifs</h2>
        <table>
            <tr><th>Nom du processus</th><th>PID</th><th>Mémoire (MB)</th><th>Chemin</th></tr>
"@
            foreach ($process in $analysisResults.Processes) {
                $memory = [math]::Round($process.WorkingSet64 / 1MB, 2)
                $path = try { $process.MainModule.FileName } catch { "N/A" }
                $htmlContent += "<tr><td>$($process.ProcessName)</td><td>$($process.Id)</td><td>$memory</td><td>$path</td></tr>"
            }
            $htmlContent += "</table>"
        }

        if ($analysisResults.Services.Count -gt 0) {
            $htmlContent += @"
        <h2>ðŸ”§ Services</h2>
        <table>
            <tr><th>Nom du service</th><th>Nom d'affichage</th><th>Statut</th><th>Type de dÃ©marrage</th></tr>
"@
            foreach ($service in $analysisResults.Services) {
                $htmlContent += "<tr><td>$($service.Name)</td><td>$($service.DisplayName)</td><td>$($service.Status)</td><td>$($service.StartType)</td></tr>"
            }
            $htmlContent += "</table>"
        }

        if ($analysisResults.ScheduledTasks.Count -gt 0) {
            $htmlContent += @"
        <h2>ðŸ“… TÃ¢ches PlanifiÃ©es</h2>
        <table>
            <tr><th>Nom de la tÃ¢che</th><th>Ã‰tat</th><th>DerniÃ¨re exÃ©cution</th></tr>
"@
            foreach ($task in $analysisResults.ScheduledTasks) {
                $lastRun = try { $task.LastRunTime } catch { "N/A" }
                $htmlContent += "<tr><td>$($task.TaskName)</td><td>$($task.State)</td><td>$lastRun</td></tr>"
            }
            $htmlContent += "</table>"
        }

        if ($analysisResults.RegistryKeys.Count -gt 0) {
            $htmlContent += @"
        <h2>ðŸ—‚ï¸ ClÃ©s de Registre</h2>
        <table>
            <tr><th>Chemin de la clÃ©</th><th>Nombre de sous-clÃ©s</th></tr>
"@
            foreach ($key in $analysisResults.RegistryKeys) {
                $subKeyCount = try { ($key | Get-ChildItem -ErrorAction SilentlyContinue).Count } catch { 0 }
                $htmlContent += "<tr><td>$($key.Name)</td><td>$subKeyCount</td></tr>"
            }
            $htmlContent += "</table>"
        }

        if ($analysisResults.Files.Count -gt 0) {
            $htmlContent += @"
        <h2>ðŸ“ Fichiers et Dossiers</h2>
        <table>
            <tr><th>Nom</th><th>Type</th><th>Taille</th><th>DerniÃ¨re modification</th><th>Chemin</th></tr>
"@
            foreach ($file in ($analysisResults.Files | Select-Object -First 50)) {
                $size = if ($file.PSIsContainer) { "Dossier" } else { "$([math]::Round($file.Length / 1KB, 2)) KB" }
                $htmlContent += "<tr><td>$($file.Name)</td><td>$(if($file.PSIsContainer){'ðŸ“ Dossier'}else{'ðŸ“„ Fichier'})</td><td>$size</td><td>$($file.LastWriteTime)</td><td>$($file.FullName)</td></tr>"
            }
            $htmlContent += "</table>"
            
            if ($analysisResults.Files.Count -gt 50) {
                $htmlContent += "<p><em>Note: Seuls les 50 premiers Ã©lÃ©ments sont affichÃ©s. Total: $($analysisResults.Files.Count) Ã©lÃ©ments.</em></p>"
            }
        }

        $htmlContent += @"
        <h2>ðŸ“ Recommandations</h2>
        <div class="info-card">
"@

        if ($analysisResults.Processes.Count -gt 0) {
            $htmlContent += "<p>ðŸ”´ <strong>Processus actifs dÃ©tectÃ©s:</strong> Il est recommandÃ© d'arrÃªter ces processus avant de procÃ©der Ã  la dÃ©sinstallation.</p>"
        }
        
        if ($analysisResults.Services.Count -gt 0) {
            $htmlContent += "<p>🟡 <strong>Services détectés:</strong> Ces services doivent être arrêtés et supprimés.</p>"
        }
        
        if ($analysisResults.RegistryKeys.Count -gt 0) {
            $htmlContent += "<p>ðŸŸ¡ <strong>EntrÃ©es de registre trouvÃ©es:</strong> Le nettoyage du registre est recommandÃ©.</p>"
        }
        
        if (-not $systemInfo.AdminRights) {
            $htmlContent += "<p>ðŸ”´ <strong>Droits administrateur requis:</strong> ExÃ©cutez le script en tant qu'administrateur pour un nettoyage complet.</p>"
        }
        
        if ($analysisResults.Processes.Count -eq 0 -and $analysisResults.Services.Count -eq 0 -and $analysisResults.RegistryKeys.Count -eq 0 -and $analysisResults.Files.Count -eq 0) {
            $htmlContent += "<p>âœ… <strong>SystÃ¨me propre:</strong> Aucune trace de Kiro dÃ©tectÃ©e sur ce systÃ¨me.</p>"
        }

        $htmlContent += @"
        </div>
        
        <div class="timestamp">
            <p>Rapport gÃ©nÃ©rÃ© le $($systemInfo.ExecutionTime) par Kiro Reset Tool v2.0</p>
            <p>Fichier de log: $Global:LogFile</p>
        </div>
    </div>
</body>
</html>
"@

        # Sauvegarde du rapport
        $htmlContent | Out-File -FilePath $reportPath -Encoding UTF8
        Write-Log "✅ Rapport généré : $reportPath" "SUCCESS"
        
        # Ouverture automatique
        if (Confirm-Action "Voulez-vous ouvrir le rapport dans votre navigateur ?") {
            Start-Process $reportPath
        }
        
    } catch {
        Write-Log "âŒ Erreur lors de la gÃ©nÃ©ration du rapport : $_" "ERROR"
    }
    
    Pause
}

function Toggle-VerboseMode {
    $Global:VerboseMode = -not $Global:VerboseMode
    Write-Log "Mode verbose : $(if($Global:VerboseMode){'âœ… ActivÃ©'}else{'âŒ DÃ©sactivÃ©'})" "INFO"
    Start-Sleep -Seconds 1
}

function Open-LogFolder {
    $logFolder = Split-Path $Global:LogFile
    if (Test-Path $logFolder) {
        Start-Process explorer.exe -ArgumentList $logFolder
        Write-Log "ðŸ“‚ Ouverture du dossier des logs : $logFolder" "INFO"
    } else {
        Write-Log "âŒ Dossier des logs introuvable" "ERROR"
    }
    Start-Sleep -Seconds 1
}

function Perform-FullReset {
    Write-Log "â•â•â• RESET COMPLET DE KIRO â•â•â•"
    
    if (-not (Confirm-Action "âš ï¸  ATTENTION: Cela va effectuer un nettoyage complet de Kiro sur ce systÃ¨me. Cette action est irrÃ©versible.")) {
        return
    }
    
    Write-Host "`nðŸš€ DÃ©marrage du reset complet..." -ForegroundColor Green
    
    # CrÃ©ation d'une sauvegarde automatique
    Write-Host "`n1/9 CrÃ©ation d'une sauvegarde de sÃ©curitÃ©..." -ForegroundColor Cyan
    Create-Backup
    
    # ArrÃªt des processus
    Write-Host "`n2/9 ArrÃªt des processus..." -ForegroundColor Cyan
    Stop-KiroProcesses
    
    # DÃ©sinstallation
    Write-Host "`n3/9 DÃ©sinstallation..." -ForegroundColor Cyan
    Uninstall-Kiro
    
    # Suppression des fichiers
    Write-Host "`n4/9 Suppression des fichiers..." -ForegroundColor Cyan
    Delete-AppData
    
    # Nettoyage du registre
    Write-Host "`n5/9 Nettoyage du registre..." -ForegroundColor Cyan
    Clean-Registry
    
    # Nettoyage des services
    Write-Host "`n6/9 Nettoyage des services..." -ForegroundColor Cyan
    Clean-Services
    
    # Suppression des tÃ¢ches planifiÃ©es
    Write-Host "`n7/9 Suppression des tÃ¢ches planifiÃ©es..." -ForegroundColor Cyan
    Clean-ScheduledTasks
    
    # Nettoyage des traces rÃ©seau
    Write-Host "`n8/9 Nettoyage des traces rÃ©seau..." -ForegroundColor Cyan
    Clean-NetworkTraces
    
    # RÃ©initialisation de la Machine ID
    Write-Host "`n9/9 RÃ©initialisation de la Machine ID..." -ForegroundColor Cyan
    Reset-MachineID
    
    Write-Host "`n" + "="*70 -ForegroundColor Green
    Write-Host "ðŸŽ‰ RESET COMPLET TERMINÃ‰ AVEC SUCCÃˆS!" -ForegroundColor Green
    Write-Host "="*70 -ForegroundColor Green
    Write-Host "`nðŸ“‹ RÃ©sumÃ© des actions effectuÃ©es:" -ForegroundColor Cyan
    Write-Host "   âœ… Sauvegarde crÃ©Ã©e dans : $Global:BackupFolder"
    Write-Host "   âœ… Processus arrÃªtÃ©s"
    Write-Host "   âœ… Application dÃ©sinstallÃ©e"
    Write-Host "   âœ… Fichiers utilisateur supprimÃ©s"
    Write-Host "   âœ… Registre nettoyÃ©"
    Write-Host "   âœ… Services supprimÃ©s"
    Write-Host "   âœ… TÃ¢ches planifiÃ©es supprimÃ©es"
    Write-Host "   âœ… Traces rÃ©seau nettoyÃ©es"
    Write-Host "   âœ… Machine ID rÃ©initialisÃ©e"
    Write-Host "`nðŸ“„ Log complet disponible : $Global:LogFile" -ForegroundColor Gray
    Write-Host "`nâš ï¸  Un redÃ©marrage du systÃ¨me est recommandÃ© pour finaliser le nettoyage." -ForegroundColor Yellow
    
    if (Confirm-Action "Voulez-vous redÃ©marrer le systÃ¨me maintenant ?") {
        Write-Log "RedÃ©marrage du systÃ¨me demandÃ© par l'utilisateur" "INFO"
        Restart-Computer -Force
    }
    
    Pause
}

# Initialisation du script
function Initialize-Script {
    # VÃ©rification de la version PowerShell
    if ($PSVersionTable.PSVersion.Major -lt 5) {
        Write-Host "âŒ Ce script nÃ©cessite PowerShell 5.0 ou supÃ©rieur" -ForegroundColor Red
        Write-Host "   Version actuelle : $($PSVersionTable.PSVersion)" -ForegroundColor Yellow
        exit 1
    }
    
    # CrÃ©ation du fichier de log
    try {
        "â•â•â• NOUVEAU SESSION KIRO RESET TOOL â•â•â•" | Out-File -FilePath $Global:LogFile -Encoding UTF8
        Write-Log "Script dÃ©marrÃ© par $env:USERNAME sur $env:COMPUTERNAME"
        Write-Log "Version PowerShell : $($PSVersionTable.PSVersion)"
        Write-Log "Droits administrateur : $(Test-AdminRights)"
        Write-Log "Dossier de sauvegarde : $Global:BackupFolder"
    } catch {
        Write-Host "âš ï¸  Impossible de crÃ©er le fichier de log : $_" -ForegroundColor Yellow
    }
}

# Fonction principale
function Main {
    Initialize-Script
    
    while ($true) {
        try {
            Show-Menu
            $selection = Read-Host "`nðŸŽ¯ SÃ©lectionnez une option (0-15)"
            
            switch ($selection) {
                '1'  { Analyze-KiroInstallation }
                '2'  { Uninstall-Kiro }
                '3'  { Delete-AppData }
                '4'  { Clean-Registry }
                '5'  { Reset-MachineID }
                '6'  { Clean-Services }
                '7'  { Clean-ScheduledTasks }
                '8'  { Clean-NetworkTraces }
                '9'  { Clear-SystemCaches }
                '10' { Perform-FullReset }
                '11' { Create-Backup }
                '12' { Restore-Backup }
                '13' { Generate-DetailedReport }
                '14' { Toggle-VerboseMode }
                '15' { Open-LogFolder }
                '0'  { 
                    Write-Log "Script terminÃ© par l'utilisateur"
                    Write-Host "`nðŸ‘‹ Merci d'avoir utilisÃ© Kiro Reset Tool!" -ForegroundColor Green
                    Write-Host "ðŸ“„ Log sauvegardÃ© : $Global:LogFile" -ForegroundColor Gray
                    exit 0
                }
                default { 
                    Write-Host "âŒ Option invalide. Veuillez sÃ©lectionner un nombre entre 0 et 15." -ForegroundColor Red
                    Start-Sleep -Seconds 2
                }
            }
        } catch {
            Write-Log "âŒ Erreur inattendue dans le menu principal : $_" "ERROR"
            Write-Host "Une erreur inattendue s'est produite. Consultez le fichier de log pour plus de dÃ©tails." -ForegroundColor Red
            Pause
        }
    }
}

# Point d'entrÃ©e du script
try {
    Main
} catch {
    Write-Host "âŒ Erreur critique : $_" -ForegroundColor Red
    Write-Host "Le script va se fermer. Consultez le fichier de log : $Global:LogFile" -ForegroundColor Yellow
    Pause
    exit 1
}
