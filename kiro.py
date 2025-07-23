import os
import shutil
import winreg
import json
import uuid
import hashlib
import datetime
from pathlib import Path
import ctypes

def is_admin():
    try:
        return ctypes.windll.shell32.IsUserAnAdmin()
    except:
        return False

def pause():
    input("\nAppuyez sur Entrée pour continuer...")

def delete_folder(path):
    expanded = os.path.expandvars(path)
    if os.path.exists(expanded):
        try:
            shutil.rmtree(expanded)
            print(f"[✓] Dossier supprimé : {expanded}")
        except Exception as e:
            print(f"[❌] Impossible de supprimer {expanded} : {e}")
    else:
        print(f"[!] Dossier introuvable : {expanded}")

def delete_registry_key(hive, path, subkey=None):
    try:
        with winreg.ConnectRegistry(None, hive) as reg:
            if subkey:
                with winreg.OpenKey(reg, path, 0, winreg.KEY_ALL_ACCESS) as key:
                    winreg.DeleteKey(key, subkey)
                    print(f"[✓] Clé supprimée : {hive}\\{path}\\{subkey}")
            else:
                # Si pas de subkey, supprime la clé path entière
                winreg.DeleteKey(reg, path)
                print(f"[✓] Clé supprimée : {hive}\\{path}")
    except FileNotFoundError:
        if subkey:
            print(f"[!] Clé introuvable : {hive}\\{path}\\{subkey}")
        else:
            print(f"[!] Clé introuvable : {hive}\\{path}")
    except PermissionError:
        print(f"[❌] Permission refusée, lancez le script en tant qu'administrateur.")
    except Exception as e:
        print(f"[❌] Erreur suppression clé : {e}")

def uninstall_kiro():
    print("\n=== Suppression des dossiers Kiro ===\n")
    folders = [
        r"%APPDATA%\Kiro",
        r"%LOCALAPPDATA%\Programs\Kiro",
        r"%LOCALAPPDATA%\Kiro",
        r"%PROGRAMDATA%\Kiro",
        os.path.join(str(Path.home()), "Documents", "Kiro"),
        os.path.join(str(Path.home()), "Downloads", "Kiro"),
    ]
    for f in folders:
        delete_folder(f)

def clean_registry():
    print("\n=== Nettoyage des clés registre ===\n")
    # Clé RADAR Kiro.exe
    delete_registry_key(winreg.HKEY_LOCAL_MACHINE,
                        r"SOFTWARE\Microsoft\RADAR\HeapLeakDetection\DiagnosedApplications",
                        "Kiro.exe")
    # Clé BCD00000000
    delete_registry_key(winreg.HKEY_LOCAL_MACHINE, r"BCD00000000")

def backup_file(src_path):
    if not os.path.isfile(src_path):
        print(f"[!] Fichier à backup introuvable : {src_path}")
        return None
    try:
        timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
        backup_path = f"{src_path}.bak.{timestamp}"
        shutil.copy2(src_path, backup_path)
        print(f"[✓] Backup créé : {backup_path}")
        return backup_path
    except Exception as e:
        print(f"[❌] Erreur lors de la création du backup : {e}")
        return None

def generate_machine_ids():
    dev_device_id = str(uuid.uuid4())
    machine_id = str(uuid.uuid4())
    sqm_id = f"{{{str(uuid.uuid4()).upper()}}}"
    raw_uuid = uuid.uuid4().hex.encode()
    mac_machine_id = hashlib.sha256(raw_uuid).hexdigest()

    return {
        "telemetry.devDeviceId": dev_device_id,
        "telemetry.macMachineId": mac_machine_id,
        "telemetry.machineId": machine_id,
        "telemetry.sqmId": sqm_id,
        "storage.serviceMachineId": dev_device_id
    }

def reset_machine_id():
    print("\n=== Réinitialisation du Machine ID dans storage.json ===\n")
    storage_path = os.path.expandvars(r"%APPDATA%\Kiro\User\globalStorage\storage.json")

    if not os.path.isfile(storage_path):
        print(f"[❌] Fichier storage.json introuvable : {storage_path}")
        return

    backup_file(storage_path)

    try:
        with open(storage_path, "r", encoding="utf-8") as f:
            data = json.load(f)
    except Exception as e:
        print(f"[❌] Impossible de lire storage.json : {e}")
        return

    new_ids = generate_machine_ids()
    updated_keys = []

    for key, new_val in new_ids.items():
        if key in data:
            data[key] = new_val
            updated_keys.append(key)

    if not updated_keys:
        print("[!] Aucune clé ciblée trouvée dans storage.json.")
        return

    try:
        with open(storage_path, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=4, ensure_ascii=False)
        print(f"[✓] storage.json mis à jour avec : {', '.join(updated_keys)}")
    except Exception as e:
        print(f"[❌] Impossible d'écrire storage.json : {e}")

def main_menu():
    while True:
        print("""
===== Kiro Cleaner & Machine ID Reset Tool =====

1. Désinstaller Kiro (suppression dossiers)
2. Nettoyer clés registre RADAR et BCD00000000
3. Réinitialiser Machine ID dans storage.json
4. Tout faire en séquence
0. Quitter
""")
        choice = input("Votre choix : ").strip()

        if choice == "1":
            uninstall_kiro()
            pause()
        elif choice == "2":
            clean_registry()
            pause()
        elif choice == "3":
            reset_machine_id()
            pause()
        elif choice == "4":
            uninstall_kiro()
            clean_registry()
            reset_machine_id()
            pause()
        elif choice == "0":
            print("Au revoir.")
            break
        else:
            print("Choix invalide, réessayez.")

def pause():
    input("\nAppuyez sur Entrée pour continuer...")

if __name__ == "__main__":
    if not is_admin():
        print("⚠️ Ce script doit être exécuté en mode administrateur.")
        print("👉 Fermez ce script et relancez-le en 'Exécuter en tant qu’administrateur'.")
    else:
        main_menu()
