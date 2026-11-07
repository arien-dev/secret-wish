# Backup- & Desaster-Recovery-Strategie (Backup Guide)

SecretWish speichert alle Daten in zwei lokalen Ordnern:
1. **`./data/`**: Die SQLite-Datenbank (`secretwish.db`).
2. **`./uploads/`**: Vom Nutzer hochgeladene Wunsch-Bilder.

Dadurch ist ein Backup extrem einfach, robust und ohne externe Datenbank-Tools durchführbar.

---

## 1. Manuelles Backup erstellen

### Variante A: Atomares SQLite-Backup im laufenden Betrieb
SQLite unterstützt das Erstellen einer konsistenten Kopie bei laufendem Server:
```bash
# In den Container gehen und atomaren Snapshot erzeugen
docker compose exec secretwish sqlite3 /app/data/secretwish.db ".backup /app/data/backup_$(date +%Y%m%d_%H%M%S).db"
```

### Variante B: Schneller Dateisystem-Snapshot
```bash
# Verzeichnis erstellen
mkdir -p ./backups

# Archiv erstellen mit Datum
tar -czvf ./backups/secretwish_backup_$(date +%Y%m%d_%H%M%S).tar.gz ./data ./uploads
```

---

## 2. Automatisiertes Backup per Cronjob

Erstelle ein Skript unter `/opt/secretwish/scripts/backup.sh`:

```bash
#!/bin/bash
set -e

BACKUP_DIR="/opt/secretwish/backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
KEEP_DAYS=14

mkdir -p "$BACKUP_DIR"

echo "Erstelle SecretWish Backup: $TIMESTAMP..."

# 1. Datenbank-Snapshot
tar -czf "$BACKUP_DIR/backup_${TIMESTAMP}.tar.gz" -C /opt/secretwish data uploads

# 2. Alte Backups löschen (älter als 14 Tage)
find "$BACKUP_DIR" -type f -name "backup_*.tar.gz" -mtime +$KEEP_DAYS -delete

echo "Backup erfolgreich abgeschlossen."
```

Ausführbar machen und als Cronjob einrichten (`crontab -e`):
```cron
# Jeden Tag um 03:00 Uhr nachts ausführen
0 3 * * * /opt/secretwish/scripts/backup.sh > /dev/null 2>&1
```

---

## 3. Wiederherstellung (Restore)

Um ein Backup wiederherzustellen:

1. Stoppe den Container:
   ```bash
   docker compose down
   ```
2. Entpacke das gewünschte Archiv:
   ```bash
   tar -xzvf ./backups/secretwish_backup_20261107_030000.tar.gz
   ```
3. Starte den Container neu:
   ```bash
   docker compose up -d
   ```
4. Die Anwendung läuft mit dem wiederhergestellten Stand weiter.
