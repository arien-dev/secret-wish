# Deployment-Leitfaden (Deployment Guide)

SecretWish ist als leichtgewichtige, containerisierte Anwendung konzipiert und kann auf jedem Linux-Server mit Docker betrieben werden.

---

## 1. Schnellstart mit Docker Compose (Lokales Setup & Homelab)

### Voraussetzungen:
- Docker & Docker Compose v2+
- Port 3000 frei

```bash
# 1. Repository klonen
git clone https://github.com/secretwish/secretwish.git
cd secretwish

# 2. Umgebungskonfiguration anlegen
cp .env.example .env

# Generiere einen sicheren SESSION_SECRET-Schlüssel:
# Linux/macOS: openssl rand -hex 32
# Trage diesen Schlüssel in deine .env ein!

# 3. Container starten
docker compose up -d

# 4. Logs prüfen
docker compose logs -f
```

Die Anwendung ist sofort unter **`http://localhost:3000`** erreichbar.
Die SQLite-Datenbank wird im Verzeichnis `./data` und hochgeladene Bilder in `./uploads` dauerhaft gespeichert.

---

## 2. Produktiv-Setup mit automatischer SSL-Verschlüsselung (Caddy)

Für den Produktivbetrieb im Internet wird ein Reverse Proxy mit automatischem Let's Encrypt SSL-Zertifikat empfohlen.

1. Zeige deinen Domain-DNS-Eintrag (z.B. `wish.example.com`) auf die IP-Adresse deines Servers.
2. Passe die `.env` Datei an:
   ```env
   DOMAIN=wish.example.com
   APP_URL=https://wish.example.com
   SESSION_SECRET=dein_sehr_langer_zufallsgenerierter_schluessel
   NODE_ENV=production
   ```
3. Starte mit dem Produktions-Compose-File:
   ```bash
   docker compose -f docker-compose.prod.yml up -d
   ```
4. Caddy bezieht vollautomatisch ein kostenloses TLS/HTTPS-Zertifikat.

---

## 3. Umgebungsvariablen-Referenz

| Variable | Beschreibung | Standard | Erforderlich |
|---|---|---|---|
| `DATABASE_URL` | SQLite-Pfad oder PostgreSQL URL | `file:/app/data/secretwish.db` | Ja |
| `SESSION_SECRET` | 32+ Zeichen Geheimschlüssel für Sessions | — | Ja (in Produktion) |
| `APP_URL` | Externe URL der Anwendung | `http://localhost:3000` | Ja |
| `PORT` | HTTP-Port der Node.js App | `3000` | Nein |
| `UPLOAD_DIR` | Verzeichnis für hochgeladene Bilder | `/app/public/uploads` | Nein |
| `SMTP_HOST` | Hostname des Mailservers | Leer (SMTP deaktiviert) | Nein |
| `SMTP_PORT` | Port des Mailservers | `587` | Nein |
| `SMTP_USER` | Benutzername für Mailversand | Leer | Nein |
| `SMTP_PASSWORD` | Passwort für Mailversand | Leer | Nein |
| `SMTP_FROM` | Absenderadresse | `SecretWish <noreply@example.com>` | Nein |

---

## 4. Healthcheck & Monitoring

Der Container besitzt einen integrierten Healthcheck:
```bash
docker inspect --format='{{json .State.Health}}' secretwish
```
Antwortet mit `Status: "healthy"`, sobald die Node.js-Anwendung einsatzbereit ist.
