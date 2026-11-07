import Link from "next/link";
import {
  Gift,
  ShieldCheck,
  Users,
  Sparkles,
  Smartphone,
  Server,
  ArrowRight,
  CheckCircle2,
  Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/auth/session";

export default async function LandingPage() {
  const user = await getCurrentUser();

  const features = [
    {
      icon: Lock,
      title: "Geheime Reservierungen",
      description:
        "Gäste reservieren Wünsche mit einem Klick. Der Beschenkte sieht nicht, wer was schenkt – Überraschungen bleiben erhalten und doppelte Geschenke sind Geschichte.",
    },
    {
      icon: Users,
      title: "Familienmodus & Kinderlisten",
      description:
        "Gemeinsame Räume für Familien. Eltern verwalten Wunschlisten für ihre Kinder, ohne dass die Kinder eine eigene E-Mail-Adresse benötigen.",
    },
    {
      icon: Sparkles,
      title: "Gruppen-Geschenke",
      description:
        "Teure Geschenke gemeinsam finanzieren. Mehrere Personen können flexible Teilbeträge beisteuern, bis der Zielbetrag erreicht ist.",
    },
    {
      icon: Smartphone,
      title: "Gastzugang ohne Account",
      description:
        "Kein lästiges Registrieren für Verwandte und Freunde. Ein sicherer Link genügt, um sofort mobil Wünsche zu reservieren.",
    },
    {
      icon: ShieldCheck,
      title: "100% Datenschutz & Privatsphäre",
      description:
        "Keine externen Tracker, keine Werbenetzwerke, keine Cloud-Pflicht. Alle Daten bleiben auf deiner eigenen Instanz.",
    },
    {
      icon: Server,
      title: "Kinderleichtes Self-Hosting",
      description:
        "Mit einem einzigen Docker-Compose-Befehl startklar. Standardmäßig mit SQLite ohne Datenbank-Konfigurationsaufwand.",
    },
  ];

  const faqs = [
    {
      q: "Erfährt der Beschenkte wirklich niemals, wer was reserviert hat?",
      a: "Ja, absolut. Der Listeninhaber sieht nur, dass ein Wunsch reserviert wurde, niemals den Namen, die E-Mail oder die Identität des Gastes. Die Filterung erfolgt serverseitig in der Datenbankabfrage.",
    },
    {
      q: "Müssen meine Freunde und Familie einen Account anlegen?",
      a: "Nein! Gäste öffnen einfach deinen geheimen Einladungslink. Sie können direkt reservieren, ohne Passwort oder Registrierung.",
    },
    {
      q: "Können wir gemeinsam für teurere Geschenke sammeln?",
      a: "Ja, mit Gruppen-Geschenken. Du legst einen Wunsch als Gruppengeschenk mit Zielbetrag an, und mehrere Gäste können beliebige Teilbeträge reservieren.",
    },
    {
      q: "Funktioniert SecretWish auch ohne SMTP/E-Mail-Server?",
      a: "Ja, vollständig. SecretWish benötigt für den regulären Betrieb keine E-Mail-Konfiguration. Passwort-Resets können bei Bedarf auch über die Konsole oder optional konfiguriertes SMTP laufen.",
    },
  ];

  return (
    <div className="flex flex-col items-center">
      {/* HERO SECTION */}
      <section className="relative w-full overflow-hidden px-4 pt-16 pb-20 sm:px-6 lg:px-8 text-center bg-gradient-to-b from-violet-50/50 via-white to-transparent dark:from-violet-950/20 dark:via-slate-950 dark:to-transparent">
        <div className="mx-auto max-w-4xl space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-violet-200 bg-violet-50/80 px-3.5 py-1 text-xs font-semibold text-violet-700 dark:border-violet-900 dark:bg-violet-950/60 dark:text-violet-300">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Open Source & Selbst hostbar</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
            Wunschlisten ohne Chaos. <br />
            <span className="bg-gradient-to-r from-violet-600 to-amber-500 bg-clip-text text-transparent">
              Geheim reservieren. Überraschung gerettet.
            </span>
          </h1>

          <p className="mx-auto max-w-2xl text-base sm:text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
            SecretWish ist die moderne Wunschlisten- und Geschenk-Koordinations-App für Familien, Freundeskreise und WGs. Keine doppelten Geschenke mehr – und der Beschenkte bleibt vollkommen überrascht.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
            <Link href={user ? "/dashboard" : "/register"}>
              <Button size="lg" className="w-full sm:w-auto text-base h-12 px-8">
                {user ? "Zum Dashboard" : "Jetzt kostenlose Liste erstellen"}
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
            <a
              href="#how-it-works"
              className="w-full sm:w-auto inline-flex items-center justify-center h-12 px-6 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-sm font-semibold dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 transition-colors"
            >
              So funktioniert's
            </a>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 pt-6 text-xs text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" /> Kein Gast-Account nötig
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" /> 100% Tracking-frei
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" /> Docker-ready
            </span>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS / VALUE PROPOSITION */}
      <section id="how-it-works" className="w-full max-w-6xl px-4 py-16 sm:px-6">
        <div className="text-center space-y-3 mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100">
            Wie SecretWish Geschenke koordiniert
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
            Drei simple Schritte, um Enttäuschungen und doppelte Geschenke für immer zu vermeiden.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 space-y-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100 text-violet-700 font-bold dark:bg-violet-950 dark:text-violet-300">
              1
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Wunschliste anlegen
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Trage Wünsche für Geburtstag, Weihnachten oder Einzug ein. Mit Prioritäten, Links, Preisen und Bildern.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 space-y-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-700 font-bold dark:bg-amber-950 dark:text-amber-300">
              2
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Einladungslink teilen
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Verschicke deinen privaten Link via WhatsApp, Signal oder E-Mail. Gäste können den Link sofort ohne Registrierung öffnen.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 space-y-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 font-bold dark:bg-emerald-950 dark:text-emerald-300">
              3
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Geheim reservieren
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Gäste reservieren Wünsche oder tragen zu Gruppen-Geschenken bei. Alle Gäste sehen den Status – du erfährst nichts!
            </p>
          </div>
        </div>
      </section>

      {/* FEATURE GRID */}
      <section className="w-full bg-slate-100/60 dark:bg-slate-900/40 py-16 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center space-y-3">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100">
              Gebaut für echte Familien & Freundeskreise
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
              Keine überladene Software, sondern durchdachte Funktionen für entspannte Feiern.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feat) => {
              const Icon = feat.icon;
              return (
                <div
                  key={feat.title}
                  className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:shadow-md dark:border-slate-800 dark:bg-slate-900 space-y-2.5"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-50 text-violet-600 dark:bg-violet-950/70 dark:text-violet-400">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                    {feat.title}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    {feat.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* SELF-HOSTING & DOCKER SECTION */}
      <section className="w-full max-w-5xl px-4 py-16 sm:px-6">
        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-8 sm:p-12 text-slate-100 shadow-2xl space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full bg-violet-900/50 border border-violet-700 px-3 py-1 text-xs font-semibold text-violet-300">
            <Server className="h-3.5 w-3.5" /> Self-Hosting mit Docker Compose
          </div>

          <h2 className="text-2xl sm:text-3xl font-bold">
            Volle Datenhoheit auf deinem eigenen Server
          </h2>

          <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
            Starte SecretWish in weniger als 2 Minuten mit Docker. Inklusive SQLite-Datenbank, automatischen Backups und optionalem Caddy-Proxy für automatische SSL-Zertifikate.
          </p>

          <div className="rounded-2xl bg-slate-950 p-4 font-mono text-xs text-emerald-400 overflow-x-auto border border-slate-800">
            <code>git clone https://github.com/secretwish/secretwish.git<br/>cd secretwish<br/>docker compose up -d</code>
          </div>

          <p className="text-xs text-slate-400">
            Bereits unter http://localhost:3000 erreichbar. Keine externen Dienste erforderlich.
          </p>
        </div>
      </section>

      {/* FAQ SECTION */}
      <section className="w-full max-w-4xl px-4 py-16 sm:px-6 space-y-8">
        <div className="text-center space-y-3">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100">
            Häufig gestellte Fragen (FAQ)
          </h2>
        </div>

        <div className="space-y-4">
          {faqs.map((faq) => (
            <div
              key={faq.q}
              className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 space-y-2"
            >
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                {faq.q}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                {faq.a}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* BOTTOM CTA */}
      <section className="w-full bg-violet-600 py-16 px-4 text-center text-white">
        <div className="max-w-2xl mx-auto space-y-4">
          <h2 className="text-2xl sm:text-3xl font-bold">
            Bereit für entspannte Wunschlisten?
          </h2>
          <p className="text-sm text-violet-100">
            Erstelle deine erste Liste in unter einer Minute.
          </p>
          <div className="pt-2">
            <Link href={user ? "/dashboard" : "/register"}>
              <Button size="lg" className="bg-white text-violet-900 hover:bg-slate-100 shadow-xl">
                {user ? "Zum Dashboard" : "Jetzt kostenlos registrieren"}
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
