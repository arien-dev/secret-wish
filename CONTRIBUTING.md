# Mitwirken an SecretWish (Contributing Guide)

Vielen Dank für dein Interesse, zu SecretWish beizutragen! SecretWish ist ein freies Open-Source-Projekt unter der **AGPL-3.0**.

---

## 1. Lokale Entwicklungsumgebung starten

### Voraussetzungen:
- Node.js 20+ oder 22+
- npm oder pnpm

```bash
# 1. Repository forken & klonen
git clone https://github.com/secretwish/secretwish.git
cd secretwish

# 2. Abhängigkeiten installieren
npm install

# 3. Umgebungskonfiguration kopieren
cp .env.example .env

# 4. Datenbank synchronisieren & Demo-Daten einspielen
npx prisma db push
npm run db:seed

# 5. Entwicklungsserver starten
npm run dev
```

Die Anwendung ist unter `http://localhost:3000` erreichbar.  
Demobenutzer: `demo@secretwish.local` / `SecretWish123!`

---

## 2. Testen

Alle Änderungen müssen von Tests abgedeckt sein:

```bash
# Test-Suite ausführen (Vitest)
npm run test

# Watch-Modus während der Entwicklung
npm run test:watch
```

---

## 3. Pull Request Guidelines

1. Erstelle einen Feature-Branch (`git checkout -b feature/mein-neues-feature`).
2. Achte auf typsicheren TypeScript-Code (keine unbegründeten `any`-Typen).
3. Behalte das **Zero-Knowledge-Prinzip** bei: Listeninhaber dürfen niemals Gast-Identitäten einsehen.
4. Führe `npm run test` und `npm run build` lokal aus, bevor du deinen PR einreichst.
5. Reiche deinen PR gegen den `main`-Branch ein.
