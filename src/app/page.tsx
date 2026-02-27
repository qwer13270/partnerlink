import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import {
  BadgeCheck,
  Building2,
  CalendarCheck,
  ChartNoAxesCombined,
  ChevronRight,
  ClipboardCheck,
  Handshake,
  LineChart,
  MapPin,
  ShieldCheck,
  Users,
} from "lucide-react";

export default function HomePage() {
  return <HomePageContent />;
}

function HomePageContent() {
  const t = useTranslations("landing");

  return (
    <div>
      {/* Hero */}
      <section className="section-editorial">
        <div className="editorial-container">
          <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 border border-border px-4 py-2 text-xs uppercase tracking-[0.4em] text-muted-foreground">
                {t("hero.badge")}
              </div>
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif">
                <span className="text-primary">HomeKey</span>{" "}
                <span className="text-muted-foreground">房客</span>
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground max-w-2xl">
                {t("hero.subtitle")}
              </p>
              <div className="flex flex-wrap gap-4">
                <Button asChild size="lg" className="px-8">
                  <Link href="/join/kol">{t("hero.ctaPrimary")}</Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="px-8">
                  <Link href="/join/merchant">{t("hero.ctaSecondary")}</Link>
                </Button>
              </div>
            </div>

            <div className="grid gap-6">
              <Card className="p-6 border-border bg-card">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full border border-border bg-muted/40 flex items-center justify-center">
                    <ShieldCheck className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground">
                      {t("hero.trustBadge")}
                    </p>
                    <p className="text-lg font-serif mt-2">{t("hero.trustTitle")}</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mt-4">{t("hero.trustBody")}</p>
              </Card>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: t("hero.stats.projects"), value: "18+" },
                  { label: t("hero.stats.kols"), value: "120+" },
                  { label: t("hero.stats.tours"), value: "2,600+" },
                  { label: t("hero.stats.conversion"), value: "18.4%" },
                ].map((stat) => (
                  <Card key={stat.label} className="p-5 border-border bg-card">
                    <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">{stat.label}</p>
                    <p className="text-2xl font-serif mt-3">{stat.value}</p>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust */}
      <section className="section-editorial-sm border-t border-border">
        <div className="editorial-container">
          <div className="grid gap-8 lg:grid-cols-[0.45fr_0.55fr]">
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-muted-foreground">
                {t("trust.eyebrow")}
              </p>
              <h2 className="text-4xl font-serif mt-4">{t("trust.title")}</h2>
              <p className="text-muted-foreground mt-6 max-w-xl">{t("trust.subtitle")}</p>
            </div>
            <div className="grid gap-6 md:grid-cols-2">
              {[
                { icon: ShieldCheck, title: t("trust.cards.verified.title"), body: t("trust.cards.verified.body") },
                { icon: ClipboardCheck, title: t("trust.cards.compliance.title"), body: t("trust.cards.compliance.body") },
                { icon: BadgeCheck, title: t("trust.cards.quality.title"), body: t("trust.cards.quality.body") },
                { icon: Handshake, title: t("trust.cards.partners.title"), body: t("trust.cards.partners.body") },
              ].map((card) => {
                const Icon = card.icon;
                return (
                  <Card key={card.title} className="p-6 border-border bg-card">
                    <div className="h-10 w-10 rounded-full border border-border bg-muted/40 flex items-center justify-center">
                      <Icon className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-serif mt-4">{card.title}</h3>
                    <p className="text-sm text-muted-foreground mt-3">{card.body}</p>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Key highlights */}
      <section className="section-editorial-sm border-t border-border">
        <div className="editorial-container">
          <div className="grid gap-10 lg:grid-cols-[0.5fr_0.5fr] items-center">
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-muted-foreground">
                {t("highlights.eyebrow")}
              </p>
              <h2 className="text-4xl font-serif mt-4">{t("highlights.title")}</h2>
              <p className="text-muted-foreground mt-6 max-w-xl">{t("highlights.subtitle")}</p>
            </div>
            <div className="grid gap-4">
              {[
                { icon: LineChart, title: t("highlights.items.performance.title"), body: t("highlights.items.performance.body") },
                { icon: CalendarCheck, title: t("highlights.items.booking.title"), body: t("highlights.items.booking.body") },
                { icon: Users, title: t("highlights.items.kol.title"), body: t("highlights.items.kol.body") },
                { icon: ChartNoAxesCombined, title: t("highlights.items.analytics.title"), body: t("highlights.items.analytics.body") },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.title} className="flex gap-4 items-start border border-border bg-card p-6">
                    <div className="h-11 w-11 rounded-full border border-border bg-muted/40 flex items-center justify-center">
                      <Icon className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground">{item.title}</p>
                      <p className="text-base text-foreground mt-2">{item.body}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Featured properties */}
      <section className="section-editorial-sm border-t border-border">
        <div className="editorial-container">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-muted-foreground">
                {t("featured.eyebrow")}
              </p>
              <h2 className="text-4xl font-serif mt-4">{t("featured.title")}</h2>
              <p className="text-muted-foreground mt-4 max-w-xl">{t("featured.subtitle")}</p>
            </div>
            <Button asChild variant="outline" size="lg" className="self-start">
              <Link href="/properties">
                {t("featured.viewAll")}
                <ChevronRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[
              {
                title: t("featured.cards.lightRiver.title"),
                location: t("featured.cards.lightRiver.location"),
                price: t("featured.cards.lightRiver.price"),
              },
              {
                title: t("featured.cards.cathay.title"),
                location: t("featured.cards.cathay.location"),
                price: t("featured.cards.cathay.price"),
              },
              {
                title: t("featured.cards.ruentex.title"),
                location: t("featured.cards.ruentex.location"),
                price: t("featured.cards.ruentex.price"),
              },
            ].map((card) => (
              <Card key={card.title} className="p-6 border-border bg-card">
                <div className="flex items-center justify-between">
                  <div className="h-11 w-11 rounded-full border border-border bg-muted/40 flex items-center justify-center">
                    <Building2 className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <Button asChild variant="ghost" size="icon">
                    <Link href="/properties">
                      <ChevronRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
                <h3 className="text-lg font-serif mt-6">{card.title}</h3>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mt-3">
                  <MapPin className="h-4 w-4" />
                  {card.location}
                </div>
                <p className="text-base text-foreground mt-4">{card.price}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-editorial-sm border-t border-border">
        <div className="editorial-container">
          <div className="border border-border bg-card p-10 md:p-14 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
            <div>
              <h2 className="text-3xl font-serif">{t("cta.title")}</h2>
              <p className="text-muted-foreground mt-4 max-w-xl">{t("cta.subtitle")}</p>
            </div>
            <div className="flex flex-wrap gap-4">
              <Button asChild size="lg">
                <Link href="/join/kol">{t("cta.primary")}</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/join/merchant">{t("cta.secondary")}</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
