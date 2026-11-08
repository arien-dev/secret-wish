import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import Link from "next/link";
import { Gift, ShieldCheck, Users, Rocket, Sparkles, Lock, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const features = [
  {
    icon: Gift,
    title: "Wunschlisten erstellen",
    desc: "Titel, Anlass, Bilder, Preise und Links – alles an einem Ort.",
  },
  {
    icon: ShieldCheck,
    title: "Geheime Reservierungen",
    desc: "Gäste reservieren Geschenke, ohne dass der Beschenkte erfährt, wer was gewählt hat.",
  },
  {
    icon: Users,
    title: "Familienräume",
    desc: "Gemeinsame Listen für Familie, Freunde und Kollegen – mit Kinderprofilen ohne eigenen Account.",
  },
  {
    icon: Rocket,
    title: "Sichere Einladungslinks",
    desc: "Stabile, unguessbare Links zum Teilen. Optional mit selbst gewähltem Slug.",
  },
];

export default async function LandingPage() {
  const user = await getCurrentUser();
  if (user) redirect("/dashboard");

  return (
    <div className="flex flex-col min-h-screen bg-background text-text">
      <nav className="sticky top-0 z-40 w-full border-b border-border bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 sm:px-6 py-3">
          <Link href="/" className="flex items-center gap-2 font-bold text-lg text-text">
            <Gift className="h-5 w-5 text-primary" />
            <span>Secret<span className="text-primary">Wish</span></span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/register"><Button size="sm">Registrieren</Button></Link>
            <Link href="/login"><Button variant="outline" size="sm">Anmelden</Button></Link>
          </div>
        </div>
      </nav>

      <main className="flex-1 relative overflow-hidden">
        {/* Hero */}
        <section className="relative px-4 sm:px-6 pt-16 pb-24 sm:pt-24 sm:pb-32">
          <div className="mx-auto max-w-3xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-surface/80 px-3 py-1 text-xs font-semibold text-primary dark:border-dark-border dark:bg-dark-surface/80 mb-6">
              <Sparkles className="h-3.5 w-3.5" />
              Offene Beta – kostenlos selbst hosten
            </div>
            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-text mb-6">
              Wunschlisten, die <br />
              <span className="text-primary">geheim bleiben.</span>
            </h1>
            <p className="text-lg text-muted mb-10 max-w-xl mx-auto leading-relaxed">
              Erstelle Wunschlisten für Geburtstage, Weihnachten oder den Nachwuchs.
              Gäste reservieren Geschenke anonym – du erfährst nie, wer was ausgewählt hat.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/register" className="btn-primary w-full sm:w-auto">
                <ArrowRight className="h-4 w-4 mr-2" />
                Jetzt kostenlos starten
              </Link>
              <Link href="/login" className="btn-outline w-full sm:w-auto">Bereits registriert?</Link>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="px-4 sm:px-6 py-20 bg-surface/40 dark:bg-dark-surface/20 border-y border-border dark:border-dark-border">
          <div className="mx-auto max-w-6xl">
            <div className="text-center mb-16">
              <h2 className="text-2xl sm:text-3xl font-bold text-text mb-3">Alles, was du brauchst.</h2>
              <p className="text-muted">Modern, privat und familienfreundlich.</p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((f) => {
                const Icon = f.icon;
                return (
                  <div key={f.title} className="card-glass p-6">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-4">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="text-lg font-semibold text-text mb-2">{f.title}</h3>
                    <p className="text-xs text-muted leading-relaxed">{f.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Privacy / Trust */}
        <section className="px-4 sm:px-6 py-20">
          <div className="mx-auto max-w-3xl">
            <div className="glass-card rounded-2xl p-8 sm:p-12">
              <div className="flex items-center gap-3 mb-4">
                <ShieldCheck className="h-5 w-5 text-emerald-600" />
                <h3 className="text-lg font-semibold text-text">100 % Datenschutz &amp; Zero-Knowledge</h3>
              </div>
              <p className="text-muted text-sm leading-relaxed mb-6">
                Deine Daten bleiben bei dir. Reservierungen sind pseudonymisiert – weder Listeninhaber noch andere Gäste sehen, wer was reserviert hat. Kein Tracking, keine Verkaufsdaten.
              </p>
              <div className="grid md:grid-cols-3 gap-4 text-xs text-muted">
                <div className="flex items-center gap-2">
                  <Lock className="h-3.5 w-3.5 text-slate-400" />
                  <span>Verschlüsselte Token</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-3.5 w-3.5 text-slate-400" />
                  <span>Gastmodus ohne Account</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-3.5 w-3.5 text-slate-400" />
                  <span>Selbst hostbar (Docker)</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="px-4 sm:px-6 pb-24">
          <div className="mx-auto max-w-2xl">
            <div className="rounded-2xl bg-primary p-10 sm:p-14 text-center text-white shadow-lg shadow-primary/25">
              <h2 className="text-2xl sm:text-3xl font-bold mb-3">Bereit für deine erste Wunschliste?</h2>
              <p className="text-primary-100 text-sm mb-8 max-w-md mx-auto leading-relaxed">
                Einfach registrieren, Liste anlegen und den sicheren Link mit Familie und Freunden teilen.
              </p>
              <Link
                href="/register"
                className="btn-primary px-8 py-3 text-base"
              >
                Jetzt loslegen
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border bg-surface/80 dark:bg-dark-surface/80 py-8">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-muted">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-text">SecretWish</span>
            <span>•</span>
            <span className="flex items-center gap-1 text-emerald-600">
              <ShieldCheck className="h-3.5 w-3.5" /> 100 % Datenschutz
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="#" className="hover:text-text dark:hover:text-dark-text">Datenschutz</Link>
            <span>•</span>
            <Link href="https://www.gnu.org/licenses/agpl-3.0.de.html" target="_blank" rel="noopener noreferrer" className="hover:text-text dark:hover:text-dark-text">
              AGPL-3.0 Open Source
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
