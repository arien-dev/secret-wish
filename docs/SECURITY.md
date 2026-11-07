# Sicherheitskonzept & Bedrohungsanalyse (Security Concept)

SecretWish wurde nach dem Grundsatz **Security & Privacy by Design** entwickelt. Das Hauptziel der Anwendung ist der Schutz von Überraschungen bei Geschenken sowie der Schutz der Privatsphäre aller Beteiligten.

---

## 1. Zero-Knowledge-Architektur bei Reservierungen

### Bedrohung
Der Listeninhaber (oder ein neugieriger Gast) versucht über Netzwerk-Inspektion, API-Fuzzing oder IDOR-Angriffe (Insecure Direct Object Reference) herauszufinden, welcher Gast einen bestimmten Wunsch reserviert oder wie viel Geld zu einem Gruppengeschenk beigetragen hat.

### Schutzmaßnahmen
1. **Keine Klartext-Gast-Tokens in der Datenbank:**
   Gäste identifizieren sich über ein 64-Zeichen Hex-Token. In der Datenbank wird ausschließlich `SHA-256(guestToken)` gespeichert.
2. **Serverseitige Projektion (Sanitization):**
   Die Endpunkte für Listeninhaber (`/api/wishlists/:id`) und andere Gäste filtern Reservierungsdetails strikt serverseitig heraus:
   ```typescript
   // Der Inhaber erhält nur aggregierte Status-Zahlen:
   reservationStatus: {
     isReserved: true,
     reservedQuantity: 1,
     contributedAmount: 150.00
   }
   ```
   Weder `guestTokenHash`, noch Gastnamen oder individuelle Reservierungs-IDs werden an den Inhaber ausgeliefert.
3. **Neutrale Benachrichtigungen:**
   In-App-Mitteilungen an den Listeninhaber enthalten keinerlei personenbezogene Daten des Schenkers:  
   *„Auf deiner Wunschliste wurde ein Geschenk reserviert.“*

---

## 2. Schutz vor Race Conditions & Überbuchungen

### Bedrohung
Zwei Gäste klicken im exakt selben Moment auf „Diesen Wunsch reservieren“ für ein Einzelgeschenk (`quantity: 1`), oder mehrere Gäste überbuchen den Zielbetrag eines Gruppen-Geschenks.

### Schutzmaßnahmen
- **Isolierte Datenbanktransaktionen (`prisma.$transaction`):**
  Alle Reservierungsvorgänge laufen in einer atomaren Transaktion mit Validierung der Restverfügbarkeit unter Sperre:
  ```typescript
  await prisma.$transaction(async (tx) => {
    const item = await tx.wishlistItem.findFirst({ ... });
    const currentReserved = item.reservations.reduce((sum, r) => sum + r.quantity, 0);
    if (item.quantity - currentReserved < requestedQuantity) {
      throw new Error("Dieser Wunsch ist leider nicht mehr in der gewünschten Anzahl verfügbar.");
    }
    return await tx.reservation.create({ ... });
  });
  ```
- Automatisierte Concurrency-Tests in `tests/concurrency/race-condition.test.ts` stellen sicher, dass bei 5 gleichzeitigen Buchungen exakt 1 gewinnt und 4 abgewiesen werden.

---

## 3. Passwortsicherheit & Session-Handling

- **Passwort-Hashing mit Argon2id:**
  Verwendung des vom BSI und OWASP empfohlenen Argon2id-Algorithmus mit Memory-Cost 64 MiB, 3 Iterationen und 1 Thread.
- **Session-Cookies:**
  - `HttpOnly`: Kein Zugriff über clientseitiges JavaScript (XSS-resistent).
  - `SameSite=Lax`: Schutz gegen Cross-Site Request Forgery (CSRF).
  - `Secure`: Automatisch aktiviert in Produktionsumgebungen über HTTPS.
  - Automatisches Ungültigmachen aller aktiven Sitzungen beim Zurücksetzen des Passworts.

---

## 4. Rate Limiting & Denial-of-Service Schutz

In-Memory Sliding Window Rate Limiter auf allen sensiblen Endpunkten:
- `/api/auth/register`: max. 5 Anfragen / Minute pro IP
- `/api/auth/login`: max. 10 Anfragen / Minute pro IP
- `/api/auth/forgot-password`: max. 5 Anfragen / Minute pro IP
- `/api/public/wishlists/:shareToken/items/:itemId/reserve`: max. 30 Anfragen / Minute

---

## 5. Datei-Uploads & Bild-Sicherheit

- Strikte Prüfung von Dateiendung und MIME-Type (`image/jpeg`, `image/png`, `image/webp`, `image/gif`).
- Dateigrößenbeschränkung auf max. 5 MB.
- Zufallsgenerierte Dateinamen (z.B. `1730000000-a1b2c3d4.webp`) verhindern Path-Traversal-Angriffe (`../../`).

---

## 6. HTTP Security Headers

In `next.config.ts` und im `Caddyfile` vorkonfiguriert:
- `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`
- `X-Frame-Options: DENY` (Schutz vor Clickjacking)
- `X-Content-Type-Options: nosniff` (Schutz vor MIME-Sniffing)
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: camera=(), microphone=(), geolocation=()`
- Keine externen Google Fonts oder CDNs (100% DSGVO-konform).
