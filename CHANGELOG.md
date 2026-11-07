# Changelog

Alle relevanten Änderungen an SecretWish werden in dieser Datei dokumentiert.

Das Format basiert auf [Keep a Changelog](https://keepachangelog.com/de/1.0.0/) und dieses Projekt folgt [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.0.0] - 2026-11-07

### Initiales Produktions-Release

#### Neu
- **Zero-Knowledge Reservierungssystem:**
  - Gäste können Wünsche reservieren, ohne dass der Listeninhaber oder andere Gäste erfahren, wer reserviert hat.
  - Concurrency-geschützte Transaktionen gegen Überbuchungen und Race Conditions.
  - Eigene Reservierungen für Gäste im lokalen Browser verwaltbar.
- **Gruppen-Geschenke:**
  - Zusammenlegen für größere Geschenke mit flexiblem Teilbetrag und Fortschrittsanzeige.
- **Familienmodus:**
  - Gemeinsame Familienräume mit 8-stelligem Einladungscode.
  - Kinder-Profile ohne eigene E-Mail-Adresse.
  - Eltern können Kinderlisten pflegen, ohne die Überraschung zu verderben.
- **Wunschlisten-Verwaltung:**
  - Anlässe: Geburtstag, Weihnachten, Geburt & Baby, Hochzeit, Umzug, Sonstiges.
  - Prioritäten (Highlight, Hoch, Mittel, Niedrig), Preise, Währungen, Varianten und Notizen.
  - Bild-Uploads mit Validierung (MIME, 5MB Limit) und URL-Einbindung.
  - Papierkorb & Wiederherstellung.
- **Progressive Web App (PWA):**
  - Installierbar auf Smartphones, Tablets und Desktops.
  - Offline-Shell Service Worker und Web App Manifest.
  - Hell- und Dunkelmodus (Dark Mode).
- **Authentifizierung & Sicherheit:**
  - Argon2id Password Hashing (OWASP-konform).
  - Sichere HttpOnly-Session-Cookies.
  - Sliding Window Rate Limiting auf allen sensiblen Endpunkten.
  - Strikte Security-Header (CSP, HSTS, X-Frame-Options, Permissions-Policy).
- **Deployment & Docker:**
  - Multi-Stage Dockerfile (Alpine, Non-Root User).
  - Docker Compose für SQLite & Caddy Reverse Proxy mit automatischem Let's Encrypt SSL.
  - Vollständige Vitest Test-Suite (Unit, Integration, Privacy, Concurrency).
