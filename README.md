<p align="center">
  <img src="public/icons/icon.svg" width="96" height="96" alt="SecretWish Logo" />
</p>

<h1 align="center">SecretWish</h1>

<p align="center">
  <strong>Moderne, selbst hostbare Open-Source Wunschlisten & Geschenk-Koordination mit Zero-Knowledge-Reservierungen.</strong>
  <br />
  <em>Überraschungen bleiben erhalten – doppelte Geschenke werden vermieden.</em>
</p>


---

## 🌟 Was ist SecretWish?

SecretWish ist eine datenschutzorientierte, mobile-first Progressive Web App (PWA) für Wunschlisten in Familien, Freundeskreisen, WGs und Vereinen.

**Das Kernversprechen:**  
Gäste können Wünsche reservieren oder gemeinsam finanzieren, **ohne dass der Beschenkte jemals erfährt, wer was reserviert hat.** Dadurch bleibt die Überraschung zu 100% erhalten, während doppelte Geschenke zuverlässig verhindert werden.

---

## 🚀 Schnellstart mit Docker in 2 Minuten

SecretWish benötigt keine externen Cloud-Dienste und läuft standardmäßig auf einer lokalen, wartungsfreien SQLite-Datenbank.

```bash
# 1. Repository klonen
git clone https://github.com/secretwish/secretwish.git
cd secretwish

# 2. Umgebungskonfiguration anlegen
cp .env.example .env

# 3. Starten
docker compose up -d
```

Fertig! Öffne **`http://localhost:3000`** in deinem Browser.

> [!TIP]
> **Demo-Daten einspielen:**  
> Du kannst mit `docker compose exec secretwish npm run db:seed` Beispieldaten erzeugen.  
> Anmeldedaten: `demo@secretwish.local` / `SecretWish123!`

---

## 💡 Warum SecretWish? (Unterschied zu anderen Apps)

| Funktion | Generische Notiz-Apps | Gewöhnliche Wunschlisten-Tools | SecretWish |
|---|---|---|---|
| **Echte Überraschung** | ❌ Nein | ⚠️ Oft sieht der Inhaber den Schenker | ✅ **Zero-Knowledge: Inhaber erfährt nichts** |
| **Gastzugang** | ❌ Account-Zwang | ❌ Meist Account-Zwang | ✅ **1-Klick ohne Registrierung** |
| **Familienmodus für Kinder** | ❌ Nein | ❌ Kind benötigt eigene E-Mail | ✅ **Kinderlisten ohne E-Mail-Pflicht** |
| **Gruppen-Geschenke** | ❌ Nein | ❌ Selten | ✅ **Fortschrittsanzeige & Teilbeträge** |
| **Datenschutz & Self-Hosting** | ❌ Fremde Cloud & Tracking | ❌ Fremde Server | ✅ **100% auf deinem eigenen Server** |
| **Offline-fähige PWA** | ❌ Selten | ❌ Oft nur Website | ✅ **Installierbar auf iOS/Android/Desktop** |

---

## ✨ Kernfunktionen im Überblick

### 1. Zero-Knowledge Reservierungen & Gastzugang
- **Kein Account für Gäste nötig:** Gäste öffnen den sicheren Einladungslink und können sofort reservieren.
- **Strikte Geheimhaltung:** Weder der Listeninhaber noch andere Gäste können den Namen oder die E-Mail des Schenkenden einsehen.
- **Race-Condition-Schutz:** Gleichzeitige Buchungen des letzten Geschenks werden durch atomare Datenbanktransaktionen abgesichert.
- **Gäste-Dashboard:** Gäste sehen in ihrer Ansicht, welche Wünsche sie auf der Liste reserviert haben, und können diese als „gekauft“ markieren oder freigeben.

### 2. Gruppen-Geschenke (Sammelgeschenke)
- Teurere Geschenke (z.B. Fahrrad, Espressomaschine, Reise) als Gruppen-Geschenk deklarieren.
- Mehrere Personen reservieren Teilbeträge (z.B. 25€, 50€).
- Live-Fortschrittsanzeige (z.B. *„180 von 300 € finanziert“*).
- Der Beschenkte sieht nur, dass gesammelt wird, niemals wer beteiligt ist.

### 3. Familienmodus & Kinder-Wunschlisten
- Ein Familienraum verbindet Eltern, Partner und Kinder.
- Kinderprofile können **ohne eigene E-Mail-Adresse** angelegt werden.
- Eltern pflegen die Wünsche der Kinder; Verwandte reservieren Geschenke, **ohne dass die Eltern die Überraschung vorab sehen.**

### 4. Durchdachte Wunschlisten
- Anlässe: Geburtstag, Weihnachten, Geburt & Baby, Hochzeit, Umzug, Sonstiges.
- Prioritäten: **Wunsch-Highlight ★**, Hohe, Mittlere und Niedrige Priorität.
- Preise, Währungen (EUR, CHF, USD, GBP), Produkt-URLs, Varianten (z.B. *„Größe M, Blau“*) und Notizen für Schenker.
- Bild-Uploads (JPG, PNG, WebP bis 5MB) oder externe Bild-URLs.
- Papierkorb mit Wiederherstellung und endgültigem Löschen.

### 5. Moderne Mobile-First PWA
- Auf jedem Smartphone (iOS / Android) und Desktop wie eine native App installierbar.
- Vollwertiger Hell- und Dunkelmodus (Dark Mode).
- Neutrale In-App Benachrichtigungen.
- Offline-freundlicher Service Worker Shell.

---

## 🔒 Datenschutz & Sicherheit (Security by Design)

SecretWish wurde mit höchsten Sicherheitsansprüchen entwickelt:

- **Argon2id:** Sicheres Passwort-Hashing nach aktuellen OWASP-Empfehlungen.
- **Token-Hashing:** Gast-Tokens und Sitzungstokens werden niemals im Klartext, sondern ausschließlich als SHA-256 Hash in der Datenbank gespeichert.
- **HttpOnly & SameSite=Lax Cookies:** Maximaler Schutz gegen XSS und CSRF.
- **Rate Limiting:** Integrierter Brute-Force-Schutz für Login, Registrierung und Buchungs-Endpunkte.
- **100% Tracking-Frei:** Keine Analyse-Tracker, keine Cookies von Drittanbietern, keine extern geladenen Schriftarten (Google Fonts).

Detaillierte Sicherheitsdokumentation: [docs/SECURITY.md](docs/SECURITY.md)

---

## 🏗️ Tech-Stack & Architektur

- **Frontend:** Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS, Lucide Icons, Canvas Confetti
- **Backend:** Next.js API Routes, Server Services, Zod Validierung
- **Datenbank & ORM:** Prisma ORM, SQLite (Standard, robust & backup-freundlich), PostgreSQL-kompatibel
- **Authentifizierung:** Argon2id, Session-Management mit sicheren HttpOnly-Cookies
- **Container:** Docker Multi-Stage Build (Alpine Linux, Non-Root User), Caddy Reverse Proxy mit automatischem Let's Encrypt HTTPS

Ausführliche Architekturbeschreibung: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)

---

## ⚙️ Umgebungsvariablen (.env)

| Variable | Beschreibung | Standard |
|---|---|---|
| `DATABASE_URL` | SQLite Pfad oder PostgreSQL Verbindungs-URL | `file:/app/data/secretwish.db` |
| `SESSION_SECRET` | Mind. 32-stelliger Zufallsschlüssel | *erforderlich in Prod* |
| `APP_URL` | Öffentliche URL der Instanz | `http://localhost:3000` |
| `PORT` | Port der Node.js App | `3000` |
| `UPLOAD_DIR` | Verzeichnis für hochgeladene Bilder | `/app/public/uploads` |
| `SMTP_HOST` | *(Optional)* SMTP Server für Passwort-Resets | `""` (App läuft 100% ohne SMTP) |
| `SMTP_PORT` | *(Optional)* SMTP Port | `587` |
| `SMTP_USER` | *(Optional)* SMTP Benutzer | `""` |
| `SMTP_PASSWORD`| *(Optional)* SMTP Passwort | `""` |

---

## 📦 Backup & Wiederherstellung

Da SecretWish standardmäßig mit SQLite arbeitet, besteht das gesamte Backup aus den beiden Ordnern `./data` und `./uploads`:

```bash
# Snapshot erstellen
tar -czvf secretwish_backup_$(date +%Y%m%d).tar.gz ./data ./uploads
```

Vollständige Backup- und Desaster-Recovery-Anleitung: [docs/BACKUP.md](docs/BACKUP.md)

---

## 🧪 Tests ausführen

SecretWish besitzt eine umfassende Vitest Test-Suite für Unit-, Integrations-, Sicherheits- und Race-Condition-Tests:

```bash
npm run test
```

Alle 34 Tests decken ab:
- Registrierung, Login & Passwort-Reset
- Zero-Knowledge-Datenschutz (Listeninhaber und andere Gäste sehen niemals Reservierungs-Identitäten)
- Race-Condition-Verhalten bei gleichzeitigen Reservierungen
- Gruppengeschenk-Fortschritt & Überbuchungsschutz
- Rate Limiting

---

## 🗺️ Roadmap

- **v1.0 (Aktuell):** Auth (Argon2id), Wunschlisten, Wünsche, Geheime Reservierungen, Gruppen-Geschenke, Familienmodus für Kinder, Mobile PWA, Docker & Caddy, Test-Suite.
- **v1.1:** E-Mail-Benachrichtigungen bei Reservierungen, PDF-Export für den Ausdruck von Wunschlisten.
- **v1.2:** Secret Santa (Wichteln)-Modus für Freundeskreise & Firmen, CSV-Import/Export, Mehrsprachigkeit (i18n Deutsch/Englisch).
- **v2.0:** S3-kompatibler Object Storage (MinIO, AWS S3), Multi-Tenancy & Administrator-Dashboard.

---

## 📄 Lizenz (Warum AGPL-3.0?)

SecretWish ist unter der **GNU Affero General Public License v3.0 (AGPL-3.0)** lizenziert.

### Warum AGPL-3.0?
SecretWish ist eine Webanwendung. Die AGPL-3.0 stellt sicher, dass wenn jemand SecretWish hostet und modifiziert, der Quellcode dieser Modifikationen der Gemeinschaft wieder zur Verfügung gestellt werden muss. Sie schützt das Projekt davor, in proprietäre Cloud-Dienste ohne Beitragsrückfluss verwandelt zu werden, und garantiert Anwendern dauerhafte Freiheit und Transparenz.

---

## 🤝 Mitwirken (Contributing)

Beiträge, Fehlerberichte und Verbesserungsvorschläge sind herzlich willkommen!  
Bitte lies [CONTRIBUTING.md](CONTRIBUTING.md), bevor du einen Pull Request einreichst.
