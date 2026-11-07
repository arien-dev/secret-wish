# SecretWish — Architektur, Datenmodell & Systemdesign

SecretWish ist eine datenschutzorientierte, moderne, selbst hostbare Webanwendung (Progressive Web App) zur Erstellung von Wunschlisten und zur Koordination von Geschenken für Familien, Freundeskreise, WGs und Gemeinschaften.

---

## 1. Projektstruktur

Die Codebase folgt einer modularen Schichtenarchitektur (Separation of Concerns). Business-Logik ist in Service-Schichten gekapselt, UI-Komponenten sind wiederverwendbar und typsicher aufgebaut.

```
secretwish/
├── .github/                     # CI/CD Workflows (Lint, Test, Docker Build)
├── docs/                        # Ausführliche Projektdokumentation
│   ├── ARCHITECTURE.md          # Systemarchitektur & Datenmodell
│   ├── SECURITY.md              # Sicherheitskonzept & Bedrohungsanalyse
│   ├── DEPLOYMENT.md            # Produktions-Setup, Caddy & SSL
│   └── BACKUP.md                # Backup- & Desaster-Recovery-Strategie
├── prisma/
│   ├── schema.prisma            # Prisma-Datenbankschema (SQLite default, Postgres compatible)
│   ├── migrations/              # Datenbankmigrationen
│   └── seed.ts                  # Beispieldaten für Entwicklung
├── public/
│   ├── icons/                   # PWA Icons (192x192, 512x512, SVG, Apple Touch)
│   ├── manifest.json            # PWA Web App Manifest
│   ├── sw.js                    # Service Worker für Offline-Shell
│   └── favicon.ico
├── src/
│   ├── app/                     # Next.js 15 App Router
│   │   ├── (auth)/              # Auth-Routen (Login, Registrierung, Passwort vergessen)
│   │   │   ├── login/page.tsx
│   │   │   ├── register/page.tsx
│   │   │   ├── forgot-password/page.tsx
│   │   │   └── reset-password/page.tsx
│   │   ├── (dashboard)/         # Authentifizierter Bereich
│   │   │   ├── dashboard/page.tsx
│   │   │   ├── wishlists/
│   │   │   │   ├── new/page.tsx
│   │   │   │   ├── [id]/page.tsx
│   │   │   │   └── [id]/edit/page.tsx
│   │   │   ├── families/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [familyId]/page.tsx
│   │   │   ├── notifications/page.tsx
│   │   │   └── settings/page.tsx
│   │   ├── (guest)/             # Öffentliche Gastansicht für Wunschlisten
│   │   │   └── share/
│   │   │       └── [shareToken]/page.tsx
│   │   ├── api/                 # REST API Endpunkte
│   │   │   ├── auth/            # /api/auth/*
│   │   │   ├── wishlists/       # /api/wishlists/*
│   │   │   ├── items/           # /api/items/*
│   │   │   ├── public/          # /api/public/* (Gast-Reservierungen & Gruppen-Geschenke)
│   │   │   ├── families/        # /api/families/*
│   │   │   ├── notifications/   # /api/notifications/*
│   │   │   └── upload/          # /api/upload
│   │   ├── layout.tsx           # Global Root Layout mit PWA Head & Theme Provider
│   │   ├── page.tsx             # Landing Page
│   │   ├── globals.css          # Tailwind CSS V4 / Utility Klassen
│   │   └── not-found.tsx
│   ├── components/
│   │   ├── ui/                  # Basis-UI: Button, Input, Modal, Dropdown, Badge, etc.
│   │   ├── wishlist/            # WishlistCard, ItemCard, ItemFormModal, ShareModal
│   │   ├── reservation/         # ReservationBadge, ClaimModal, GroupGiftProgress
│   │   ├── family/              # FamilyMemberList, ChildProfileModal
│   │   ├── layout/              # Navbar, Footer, MobileNav, ThemeToggle
│   │   └── pwa/                 # PwaInstallBanner, OfflineIndicator
│   ├── lib/
│   │   ├── auth/                # Session-Management, Password Hashing (Argon2id), Cookies
│   │   ├── db/                  # Prisma Client Singleton
│   │   ├── crypto/              # Token-Generierung & SHA-256 Hashing für Gast-Tokens
│   │   ├── validation/          # Zod Schemas für alle Requests
│   │   ├── security/            # Rate Limiter, CSRF & Security Header Helpers
│   │   ├── email/               # Nodemailer SMTP Client & Vorlagen (optional)
│   │   └── storage/             # Lokale Dateiablage & Bildvalidierung
│   └── server/
│       ├── services/            # Reusable Business Logic (AuthService, WishlistService, ReservationService)
│       └── middlewares/         # Auth & Rate Limit Guards
├── tests/
│   ├── unit/                    # Unit-Tests für Services, Token-Hashing & Validierung
│   ├── integration/             # API Route Integrationstests
│   └── concurrency/             # Race-Condition-Tests für parallele Reservierungen
├── Dockerfile                   # Multi-Stage Dockerfile (Alpine, non-root user)
├── docker-compose.yml           # Lokales / Test Deployment (SQLite)
├── docker-compose.prod.yml      # Produktions-Deployment mit Caddy Reverse Proxy & HTTPS
├── Caddyfile                    # Automatisches SSL / HTTPS Setup
├── .env.example                 # Dokumentierte Umgebungsvariablen
├── LICENSE                      # AGPL-3.0
└── README.md                    # Hauptdokumentation
```

---

## 2. Datenmodell (Prisma Schema)

```prisma
datasource db {
  provider = "sqlite" // Standard-Modus, nahtlos wechselbar zu postgresql
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model User {
  id            String         @id @default(cuid())
  email         String         @unique
  passwordHash  String
  name          String
  avatarUrl     String?
  createdAt     DateTime       @default(now())
  updatedAt     DateTime       @updatedAt
  deletedAt     DateTime?

  sessions      Session[]
  resetTokens   PasswordResetToken[]
  wishlists     Wishlist[]     @relation("UserWishlists")
  familyMembers FamilyMember[]
  notifications Notification[]
  auditLogs     AuditLog[]

  @@index([email])
}

model Session {
  id               String   @id @default(cuid())
  userId           String
  sessionTokenHash String   @unique
  expiresAt        DateTime
  userAgent        String?
  ipAddress        String?
  createdAt        DateTime @default(now())

  user             User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([sessionTokenHash])
  @@index([userId])
}

model PasswordResetToken {
  id         String    @id @default(cuid())
  userId     String
  tokenHash  String    @unique
  expiresAt  DateTime
  usedAt     DateTime?
  createdAt  DateTime  @default(now())

  user       User      @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([tokenHash])
}

model Family {
  id          String         @id @default(cuid())
  name        String
  ownerId     String
  inviteCode  String         @unique
  createdAt   DateTime       @default(now())
  updatedAt   DateTime       @updatedAt

  members     FamilyMember[]
  wishlists   Wishlist[]

  @@index([inviteCode])
}

enum FamilyRole {
  OWNER
  ADMIN
  MEMBER
  CHILD
}

model FamilyMember {
  id          String     @id @default(cuid())
  familyId    String
  userId      String?    // Nullable, wenn Rolle CHILD ohne eigenen Account
  childName   String?    // Anzeigename für Kinder ohne eigenen Account
  role        FamilyRole @default(MEMBER)
  createdAt   DateTime   @default(now())

  family      Family     @relation(fields: [familyId], references: [id], onDelete: Cascade)
  user        User?      @relation(fields: [userId], references: [id], onDelete: Cascade)
  wishlists   Wishlist[] @relation("ChildWishlists")

  @@unique([familyId, userId])
}

enum Occasion {
  BIRTHDAY
  CHRISTMAS
  BABY
  WEDDING
  MOVING
  OTHER
}

model Wishlist {
  id             String         @id @default(cuid())
  ownerId        String
  familyId       String?
  childMemberId  String?
  title          String
  description    String?
  occasion       Occasion       @default(OTHER)
  eventDate      DateTime?
  slug           String
  shareTokenHash String         @unique // SHA-256 Hash des öffentlichen Einladungs-Tokens
  isPublic       Boolean        @default(false)
  isArchived     Boolean        @default(false)
  deletedAt      DateTime?      // Soft-Delete / Papierkorb
  createdAt      DateTime       @default(now())
  updatedAt      DateTime       @updatedAt

  owner          User           @relation("UserWishlists", fields: [ownerId], references: [id], onDelete: Cascade)
  family         Family?        @relation(fields: [familyId], references: [id], onDelete: SetNull)
  childMember    FamilyMember?  @relation("ChildWishlists", fields: [childMemberId], references: [id], onDelete: SetNull)
  items          WishlistItem[]
  guests         Guest[]

  @@index([ownerId])
  @@index([shareTokenHash])
}

enum Priority {
  LOW
  MEDIUM
  HIGH
  MUST_HAVE
}

model WishlistItem {
  id           String        @id @default(cuid())
  wishlistId   String
  title        String
  description  String?
  url          String?
  imageUrl     String?
  price        Float?
  currency     String        @default("EUR")
  priority     Priority      @default(MEDIUM)
  quantity     Int           @default(1)
  variant      String?       // z.B. Größe M, Farbe Blau
  note         String?       // Zusätzliche Notiz für den Schenker
  tags         String?       // Kommagetrennte Tags oder JSON
  sortOrder    Int           @default(0)
  isGroupGift  Boolean       @default(false)
  targetAmount Float?        // Zielbetrag bei Gruppengeschenken
  isReceived   Boolean       @default(false) // Vom Beschenkten als erhalten markiert
  deletedAt    DateTime?
  createdAt    DateTime      @default(now())
  updatedAt    DateTime      @updatedAt

  wishlist     Wishlist      @relation(fields: [wishlistId], references: [id], onDelete: Cascade)
  reservations Reservation[]

  @@index([wishlistId])
}

enum ReservationStatus {
  RESERVED
  PURCHASED
  DELIVERED
  CANCELLED
}

model Reservation {
  id             String            @id @default(cuid())
  itemId         String
  guestTokenHash String            // SHA-256 Hash des privaten Gast-Tokens (niemals Klartext)
  amount         Float?            // Betrag bei Gruppengeschenken
  quantity       Int               @default(1)
  status         ReservationStatus @default(RESERVED)
  createdAt      DateTime          @default(now())
  updatedAt      DateTime          @updatedAt

  item           WishlistItem      @relation(fields: [itemId], references: [id], onDelete: Cascade)

  @@index([itemId])
  @@index([guestTokenHash])
}

model Guest {
  id             String    @id @default(cuid())
  wishlistId     String
  displayName    String?   // Optional: Nur für den Gast selbst sichtbar
  guestTokenHash String    @unique
  createdAt      DateTime  @default(now())
  lastSeenAt     DateTime  @default(now())

  wishlist       Wishlist  @relation(fields: [wishlistId], references: [id], onDelete: Cascade)

  @@index([wishlistId])
  @@index([guestTokenHash])
}

model Notification {
  id        String   @id @default(cuid())
  userId    String
  type      String   // ITEM_RESERVED, GROUP_GIFT_COMPLETE, UPCOMING_EVENT
  title     String
  body      String
  readAt    DateTime?
  createdAt DateTime @default(now())

  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
}

model AuditLog {
  id         String   @id @default(cuid())
  userId     String?
  action     String   // e.g. "WISHLIST_CREATE", "ITEM_DELETE", "SHARE_TOKEN_RESET"
  targetType String   // "Wishlist", "WishlistItem", "Family"
  targetId   String
  metadata   String?  // JSON Metadaten (ohne sensitive Gastinformationen!)
  createdAt  DateTime @default(now())

  user       User?    @relation(fields: [userId], references: [id], onDelete: SetNull)

  @@index([userId])
  @@index([targetType, targetId])
}
```

---

## 3. Privacy-Architektur: Striktes Zero-Knowledge-Prinzip

### Die Kernregel von SecretWish:
**Weder der Listeninhaber noch andere Gäste dürfen jemals erfahren, wer einen Wunsch reserviert oder dazu beigetragen hat.**

1. **Gast-Identität:**
   - Ein Gast erhält beim Aufruf eines Share-Links (`/share/[token]`) ein kryptografisch sicheres Pseudonym über ein `x-guest-token` (gespeichert in einem HttpOnly-Cookie oder localStorage).
   - In der Datenbank wird ausschließlich `SHA-256(guestToken)` gespeichert.
   - Der Gast kann optional einen Anzeigenamen angeben – dieser wird **nur** im Kontext seiner eigenen Sitzung gerendert („Du hast reserviert als Anna“).
2. **Daten-Sanitisierung auf Service-Ebene:**
   - Wenn der **Listeninhaber** seine Liste abruft:
     - `isReserved`: `true | false`
     - `reservedAmount`: Summe der Beträge (bei Gruppen-Geschenken)
     - `Reservation`-Objekte, `guestTokenHash` oder Gast-Namen werden **niemals** an den Inhaber ausgeliefert (Projektions-Filter im Service).
   - Wenn ein **Gast** die Liste abruft:
     - Sieht, ob ein Item bereits von *irgendjemandem* reserviert ist.
     - Sieht `isMyReservation = true` **nur** dann, wenn der Hash seines eigenen Gast-Tokens mit dem der Reservierung übereinstimmt.
     - Kann ausschließlich seine eigene Reservierung freigeben oder als gekauft markieren.
3. **Benachrichtigungen:**
   - Der Listeninhaber erhält bei einer Reservierung lediglich eine neutrale Nachricht:  
     *„Ein Wunsch auf deiner Liste 'Geburtstag 2026' wurde reserviert!“*  
     Es wird zu keinem Zeitpunkt Name, IP oder E-Mail des Schenkenden übermittelt.

---

## 4. Race-Condition-Schutz bei Reservierungen

Um zu verhindern, dass zwei Gäste im selben Sekundenbruchteil das letzte Exemplar eines Wunsches reservieren:

1. **Datenbank-Transaktion:**
   Alle Reservierungsvorgänge laufen in einer isolierten Prisma `$transaction`.
2. **Verfügbarkeitsprüfung unter Lock:**
   ```typescript
   await prisma.$transaction(async (tx) => {
     const item = await tx.wishlistItem.findUnique({
       where: { id: itemId },
       include: { reservations: true }
     });
     
     const totalReservedQuantity = item.reservations
       .filter(r => r.status !== 'CANCELLED')
       .reduce((sum, r) => sum + r.quantity, 0);

     if (totalReservedQuantity + requestedQuantity > item.quantity) {
       throw new ConflictError("Dieser Wunsch ist bereits vergeben oder die gewünschte Menge überschreitet das Limit.");
     }

     return await tx.reservation.create({ ... });
   });
   ```
3. **Gruppen-Geschenke:**
   Gleiches Prinzip: Die Summe aller aktiven Anteile darf `targetAmount` nicht überschreiten. Überbuchungen werden atomar abgewiesen.

---

## 5. API-Design (Übersicht)

| Methode | Pfad | Authentifizierung | Beschreibung |
|---|---|---|---|
| `POST` | `/api/auth/register` | Öffentlich | Registrierung mit E-Mail & Passwort (Argon2id) |
| `POST` | `/api/auth/login` | Öffentlich | Login, erzeugt Session-Cookie |
| `POST` | `/api/auth/logout` | Authentifiziert | Löscht Session |
| `GET` | `/api/auth/me` | Authentifiziert | Gibt Profil des eingeloggten Nutzers zurück |
| `POST` | `/api/auth/forgot-password` | Öffentlich | Erzeugt Reset-Token |
| `POST` | `/api/auth/reset-password` | Öffentlich | Setzt Passwort mit Token zurück |
| `GET` | `/api/wishlists` | Authentifiziert | Eigene & Familien-Wunschlisten auflisten |
| `POST` | `/api/wishlists` | Authentifiziert | Neue Wunschliste anlegen |
| `GET` | `/api/wishlists/:id` | Authentifiziert | Details inkl. Items (bereinigt um Gast-Identitäten) |
| `PATCH` | `/api/wishlists/:id` | Authentifiziert | Titel, Anlass, Datum, Sichtbarkeit anpassen |
| `DELETE` | `/api/wishlists/:id` | Authentifiziert | Soft-Delete in den Papierkorb oder Hard-Delete |
| `POST` | `/api/wishlists/:id/items` | Authentifiziert | Neuen Wunsch anlegen |
| `PATCH` | `/api/items/:id` | Authentifiziert | Wunsch editieren |
| `DELETE` | `/api/items/:id` | Authentifiziert | Wunsch löschen |
| `POST` | `/api/items/:id/duplicate` | Authentifiziert | Wunsch duplizieren |
| `PATCH` | `/api/items/reorder` | Authentifiziert | Sortierreihenfolge per Drag & Drop speichern |
| `POST` | `/api/items/:id/received` | Authentifiziert | Beschenkter markiert Wunsch als „erhalten“ |
| `GET` | `/api/public/wishlists/:shareToken` | Öffentlich / Gast | Öffentliche Ansicht der Liste für Gäste |
| `POST` | `/api/public/wishlists/:shareToken/guest-session` | Öffentlich / Gast | Gast initialisieren / Anzeigename speichern |
| `POST` | `/api/public/wishlists/:shareToken/items/:itemId/reserve` | Gast | Wunsch reservieren (Race Condition geschützt) |
| `DELETE` | `/api/public/wishlists/:shareToken/items/:itemId/reserve` | Gast | Eigene Reservierung stornieren |
| `POST` | `/api/public/wishlists/:shareToken/items/:itemId/purchase` | Gast | Wunsch als „gekauft“ markieren |
| `POST` | `/api/public/wishlists/:shareToken/items/:itemId/contribute` | Gast | Teilbetrag für Gruppen-Geschenk beitragen |
| `GET` | `/api/public/wishlists/:shareToken/my-reservations` | Gast | Nur eigene Reservierungen dieses Gastes abrufen |
| `GET` | `/api/families` | Authentifiziert | Familienräume des Nutzers abrufen |
| `POST` | `/api/families` | Authentifiziert | Neuen Familienraum gründen |
| `POST` | `/api/families/join` | Authentifiziert | Familienraum per Invite-Code beitreten |
| `POST` | `/api/families/:id/children` | Authentifiziert | Kinder-Profil ohne E-Mail anlegen |
| `GET` | `/api/notifications` | Authentifiziert | Ungelesene Benachrichtigungen abrufen |
| `POST` | `/api/upload` | Authentifiziert | Bild hochladen (MIME-Check, Größenlimit, Thumbnail) |

---

## 6. Sicherheitsplan & Schutzmaßnahmen

- **Passwortsicherheit:** Argon2id mit empfohlener Parametrisierung (Memory 64MB, Iterationen 3, Parallelismus 1).
- **Session-Handling:** Kryptografisch zufällige 256-Bit Tokens, gespeichert als SHA-256 Hash in der DB, ausgeliefert via `HttpOnly`, `Secure`, `SameSite=Lax` Cookies.
- **CSRF-Schutz:** Standardmäßiger SameSite-Cookie-Schutz und Header-Validierung bei mutierenden API-Endpunkten.
- **Rate-Limiting:** In-Memory Token-Bucket / Sliding Window für Auth- und Buchungsendpunkte (z.B. max 5 fehlerhafte Logins / Minute pro IP).
- **Security-Header:** Content-Security-Policy (CSP), Strict-Transport-Security (HSTS), X-Frame-Options (DENY), X-Content-Type-Options (nosniff), Referrer-Policy (strict-origin-when-cross-origin), Permissions-Policy.
- **Upload-Sicherheit:**
  - Whitelist: `image/jpeg`, `image/png`, `image/webp`.
  - Max. 5 MB Dateigröße.
  - Generierung von zufälligen Dateinamen (keine Ausführung von Path-Traversal).
- **DSGVO & Zero Tracking:**
  - Keine externen CDNs (Fonts lokal eingebunden).
  - Keine Werbe- oder Tracking-Scripts.
  - Vollständiges Löschen von Daten (Recht auf Vergessenwerden).

---

## 7. Testplan

1. **Unit-Tests (Vitest):**
   - Passwort-Hashing & Validierung (Argon2id).
   - Gast-Token-Hashing & Identitätsprüfung.
   - Validierung aller Zod-Schemas (E-Mail, Passwort, Beträge, URLs).
2. **Integrationstests:**
   - Vollständiger Auth-Flow: Registrierung, Login, Session-Cookie, Logout.
   - Wunschlisten-CRUD: Erstellung, Item hinzufügen, Soft-Delete, Papierkorb, Wiederherstellung.
   - Datenschutz-Prüfung: Owner-Query darf unter keinen Umständen Gast-Hashes oder Namen zurückgeben.
3. **Concurrency- & Race-Condition-Tests:**
   - 10 parallele Requests versuchen, das letzte Exemplar eines Items mit `quantity: 1` zu reservieren. Genau 1 Request gewinnt (200 OK), 9 Requests erhalten HTTP 409 Conflict.
   - Gruppen-Geschenk: Mehrere parallele Teilbeiträge dürfen den `targetAmount` nicht überschreiten.
4. **PWA- & UI-Prüfungen:**
   - Manifest-Gültigkeit, Service Worker Registrierung, Theme Switching.

---

## 8. Milestone-Plan für die Implementierung

- **Milestone 1: Grundgerüst & Infrastruktur**
  - Next.js 15 App Router, TypeScript, Tailwind CSS, Lucide Icons
  - Prisma Schema mit SQLite, Client Singleton, Migrationen & Seeding
  - Auth-System: Argon2id Hashing, Session-Management mit HttpOnly-Cookies
  - Globales Layout, Theme-Provider (Dark/Light Mode), Toast-System
- **Milestone 2: Kernfunktionen — Wunschlisten & Items**
  - Dashboard mit Listen-Übersicht, Anlässen, Filter & Suche
  - Wunschliste anlegen, bearbeiten, archivieren, Papierkorb
  - Wünsche anlegen, bearbeiten, löschen, duplizieren, Drag-and-Drop Sortierung
  - Share-Token-Generierung & Share-Modal
- **Milestone 3: Gastzugang, Geheime Reservierungen & Gruppen-Geschenke**
  - Öffentliche Gastansicht (`/share/[shareToken]`)
  - Gast-Identität & lokale Verwaltung
  - Reservierungslogik (Reserviert, Gekauft, Übergeben, Erhalten)
  - Gruppen-Geschenke mit Zielbetrag & Fortschrittsanzeige
  - Race-Condition-Schutz mit DB-Transaktionen
  - Strikte Trennung: Der Inhaber sieht nur anonymisierten Status
- **Milestone 4: Familienmodus & Multi-Listen**
  - Familienräume verwalten & beitreten per Einladungscode
  - Kinder-Profile ohne E-Mail-Adresse
  - Eltern können Kinderlisten verwalten, ohne Reservierungen zu sehen
- **Milestone 5: PWA, Benachrichtigungen & File-Upload**
  - Web App Manifest, Service Worker für Offline-Shell
  - Lokaler Image-Upload mit Validierung
  - In-App Benachrichtigungen (z.B. „Neues Geschenk reserviert“)
- **Milestone 6: Test-Suite**
  - Vitest Setup, Unit-Tests, Concurrency-Tests, Security-Tests
- **Milestone 7: Deployment & Docker**
  - Multi-stage Dockerfile, Docker Compose (SQLite + Caddy Reverse Proxy mit SSL)
  - Healthcheck, Non-Root-User, Backup-Skripte
- **Milestone 8: Dokumentation & Open Source Readiness**
  - README.md, AGPL-3.0 LICENSE, CONTRIBUTING.md, SECURITY.md, BACKUP.md
