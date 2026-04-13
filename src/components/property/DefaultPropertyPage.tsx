"use client";

import Image from "next/image";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import { useMemo, useState, type ReactNode } from "react";
import type {
  TongchuangTemplateContent,
  TongchuangTemplateModule,
  PropertyFontKey,
  PropertyThemeKey,
} from "@/lib/property-template";
import {
  PROPERTY_FONT_THEMES,
  PROPERTY_THEMES,
  DEFAULT_FONT_KEY,
  DEFAULT_THEME_KEY,
} from "@/lib/property-template";

const PropertyMap = dynamic(() => import("./PropertyMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-[var(--p-bg-2)]">
      <span className="font-serif text-[11px] uppercase tracking-[0.3em] text-[var(--p-text-ghost)]">
        載入地圖中…
      </span>
    </div>
  ),
});

interface DefaultPropertyPageProps {
  content: TongchuangTemplateContent;
  referrer?: string | null;
  editor?: {
    isEditing: boolean;
    selectedModuleId: string | null;
    onModuleSelect?: (moduleId: string) => void;
  };
}

const reveal = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-60px" },
  transition: { duration: 0.9, delay, ease: [0.22, 1, 0.36, 1] as const },
});

const fadeIn = (delay = 0) => ({
  initial: { opacity: 0 },
  whileInView: { opacity: 1 },
  viewport: { once: true, margin: "-40px" },
  transition: { duration: 1.4, delay, ease: "easeOut" as const },
});

export default function DefaultPropertyPage({
  content,
  referrer,
  editor,
}: DefaultPropertyPageProps) {
  const [submitted, setSubmitted] = useState(false);
  const [selectedMilestone, setSelectedMilestone] = useState<
    TongchuangTemplateContent["timelineItems"][number] | null
  >(null);
  void referrer;

  const isEditing = Boolean(editor?.isEditing);
  const completedCount = content.timelineItems.filter(
    (item) => item.state === "completed",
  ).length;
  const progressPct =
    content.timelineItems.length > 1
      ? (completedCount / (content.timelineItems.length - 1)) * 100
      : 0;

  const orderedModules = useMemo(() => {
    const visible = content.modules.filter((module) => module.isVisible);
    const pinned = visible.filter((module) => module.pinned);
    const normal = visible.filter((module) => !module.pinned);
    return [...normal, ...pinned];
  }, [content.modules]);

  const themeVars = PROPERTY_THEMES[content.colorTheme as PropertyThemeKey] ?? PROPERTY_THEMES[DEFAULT_THEME_KEY];
  const fontVars = PROPERTY_FONT_THEMES[content.fontTheme as PropertyFontKey] ?? PROPERTY_FONT_THEMES[DEFAULT_FONT_KEY];

  return (
    <div
      className="overflow-x-hidden bg-[var(--p-bg)] text-[var(--p-text-warm)]"
      style={{ ...themeVars, ...fontVars } as unknown as React.CSSProperties}
    >
      {orderedModules.map((module, index) => (
        <div key={module.id}>
          <EditableModule editor={editor} module={module}>
            {renderModule({
              module,
              content,
              isEditing,
              submitted,
              setSubmitted,
              progressPct,
              setSelectedMilestone,
            })}
          </EditableModule>
          {!module.pinned && index < orderedModules.length - 1 && (
            <GoldDivider />
          )}
        </div>
      ))}

      <AnimatePresence>
        {!isEditing && selectedMilestone && (
          <>
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="fixed inset-0 z-[100] bg-black/85 backdrop-blur-sm"
              onClick={() => setSelectedMilestone(null)}
            />

            <motion.div
              key="panel"
              initial={{ opacity: 0, scale: 0.96, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 16 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="fixed inset-0 z-[101] flex items-center justify-center p-6 pointer-events-none"
            >
              <div className="relative w-full max-w-lg overflow-hidden border border-[var(--p-accent)]/15 bg-[var(--p-bg-2)] pointer-events-auto">
                <div className="relative aspect-video">
                  <Image
                    src={selectedMilestone.imageUrl}
                    alt={selectedMilestone.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 512px"
                  />
                  <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_50%,rgba(20,20,22,0.9)_100%)]" />

                  {selectedMilestone.state === "current" && (
                    <div className="absolute left-4 top-4 flex items-center gap-2 border border-[var(--p-accent)]/30 bg-[var(--p-bg)]/70 px-3 py-1.5 backdrop-blur-sm">
                      <motion.span
                        animate={{ opacity: [1, 0.4, 1] }}
                        transition={{ duration: 1.6, repeat: Infinity }}
                        className="block h-1.5 w-1.5 rounded-full bg-[var(--p-accent)]"
                      />
                      <span className="font-serif text-[9px] uppercase tracking-[0.4em] text-[var(--p-accent)]">
                        施工中
                      </span>
                    </div>
                  )}
                  {selectedMilestone.state === "completed" && (
                    <div className="absolute left-4 top-4 border border-[var(--p-accent)]/20 bg-[var(--p-bg)]/70 px-3 py-1.5 backdrop-blur-sm">
                      <span className="font-serif text-[9px] uppercase tracking-[0.4em] text-[var(--p-accent)]">
                        已完成
                      </span>
                    </div>
                  )}
                </div>

                <div className="px-7 py-6">
                  <div className="mb-3 flex items-start justify-between gap-4">
                    <h3 className="[font-family:var(--font-serif-tc)] text-[20px] font-light leading-snug text-[var(--p-text)]">
                      {selectedMilestone.title}
                    </h3>
                    <span className="mt-1 shrink-0 font-serif text-[13px] text-[var(--p-accent)]">
                      {selectedMilestone.meta}
                    </span>
                  </div>
                  <p className="[font-family:var(--font-serif-tc)] text-[13px] leading-[1.9] text-[var(--p-text-muted)]">
                    {selectedMilestone.body}
                  </p>
                </div>

                <button
                  onClick={() => setSelectedMilestone(null)}
                  className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center bg-[var(--p-bg)]/60 text-[var(--p-text-muted)] backdrop-blur-sm transition-colors duration-200 hover:text-[var(--p-text-warm)]"
                  aria-label="關閉"
                >
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                    <path
                      d="M1 1L9 9M9 1L1 9"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                  </svg>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function renderModule({
  module,
  content,
  isEditing,
  submitted,
  setSubmitted,
  progressPct,
  setSelectedMilestone,
}: {
  module: TongchuangTemplateModule;
  content: TongchuangTemplateContent;
  isEditing: boolean;
  submitted: boolean;
  setSubmitted: (value: boolean) => void;
  progressPct: number;
  setSelectedMilestone: (
    milestone: TongchuangTemplateContent["timelineItems"][number] | null,
  ) => void;
}) {
  switch (module.moduleType) {
    case "intro_identity":
      return (
        <>
          <motion.div {...fadeIn(0)} className="border-b border-[var(--p-accent)]/10">
            <div className="flex flex-col items-start justify-between gap-10 px-6 pb-12 pt-20 md:flex-row md:items-end md:px-14 md:pb-16 md:pt-28">
              <div>
                <p className="mb-5 font-serif text-[10px] uppercase tracking-[0.5em] text-[var(--p-accent)]">
                  {content.districtLabel}
                </p>
                <h1
                  className="[font-family:var(--font-serif-tc)] font-light leading-none text-[var(--p-text)]"
                  style={{ fontSize: "clamp(60px, 9vw, 120px)" }}
                >
                  {content.name}
                </h1>
                <p
                  className="mt-3 font-serif italic tracking-[0.3em] text-[var(--p-accent-lt)]/50"
                  style={{ fontSize: "clamp(14px, 2vw, 20px)" }}
                >
                  {content.subtitle}
                </p>
              </div>
              <div className="flex flex-col gap-3 pb-8 md:pb-10 md:text-right">
                <span className="font-serif text-[11px] uppercase tracking-[0.3em] text-[var(--p-text-ghost)]">
                  預計竣工
                </span>
                <span
                  className="font-serif leading-none text-[var(--p-accent)]"
                  style={{ fontSize: "clamp(24px, 3vw, 36px)" }}
                >
                  {content.completionBadge}
                </span>
                <a
                  href="#contact"
                  onClick={(event) => {
                    if (isEditing) event.preventDefault();
                  }}
                  className="mt-3 self-start bg-[var(--p-accent)] px-10 py-4 [font-family:var(--font-serif-tc)] text-[12px] tracking-[0.2em] text-[var(--p-bg)] no-underline transition-all duration-300 hover:bg-[var(--p-accent-lt)] md:self-end"
                >
                  預約賞屋
                </a>
              </div>
            </div>
          </motion.div>
          <div className="grid grid-cols-2 border-y border-[var(--p-accent)]/10 md:grid-cols-4" id="intro">
            {content.identitySpecs.map((item) => (
              <div
                key={item.itemKey ?? item.title}
                className="last:border-r-0 odd:md:border-r border-r border-[var(--p-accent)]/10 px-6 py-6 md:px-10"
              >
                <div className="[font-family:var(--font-serif-tc)] mb-2 text-[9px] uppercase tracking-[0.35em] text-[var(--p-text-ghost)]">
                  {item.title}
                </div>
                <div className="font-serif text-[15px] text-[var(--p-accent)]">
                  {item.body}
                </div>
              </div>
            ))}
          </div>
          <ImageBreaks breaks={content.imageBreaks?.intro_identity} />
        </>
      );
    case "intro_specs":
      return (
        <>
          <section className="bg-[var(--p-bg)] px-6 py-20 md:px-14 md:py-28">
            <div className="mx-auto max-w-5xl">

              {/* Overview text */}
              <motion.div {...reveal(0)} className="mb-16 max-w-2xl">
                <SectionLabel>建案介紹</SectionLabel>
                <h2
                  className="[font-family:var(--font-serif-tc)] mb-8 font-light leading-[1.3] text-[var(--p-text)]"
                  style={{ fontSize: "clamp(26px, 3.5vw, 44px)" }}
                >
                  {content.overviewTitle}
                </h2>
                {/* Composed divider: short accent bar + long border rule */}
                <div className="mb-7 flex items-center gap-4">
                  <div className="h-px w-10 shrink-0 bg-[var(--p-accent)]" />
                  <div className="h-px flex-1 bg-[var(--p-border)]" />
                </div>
                <p className="whitespace-pre-line font-serif text-[14px] leading-[2.2] text-[var(--p-text-muted)]">
                  {content.overviewBody}
                </p>
              </motion.div>

              {/* Spec grid — open layout, no borders */}
              <div className="grid grid-cols-2 gap-x-8 gap-y-10 md:grid-cols-3 md:gap-x-12">
                {content.introSpecs.map((item, i) => (
                  <motion.div
                    key={item.itemKey ?? item.title}
                    {...reveal(i * 0.06)}
                    className="group"
                  >
                    {/* Accent bar that grows on hover */}
                    <div className="mb-4 h-px w-5 bg-[var(--p-accent)]/40 transition-all duration-500 group-hover:w-10 group-hover:bg-[var(--p-accent)]" />
                    <span className="mb-2.5 block [font-family:var(--font-serif-tc)] text-[9px] uppercase tracking-[0.35em] text-[var(--p-text-ghost)]">
                      {item.title}
                    </span>
                    <span
                      className="[font-family:var(--font-serif-tc)] block font-light leading-tight text-[var(--p-text)] transition-colors duration-300 group-hover:text-[var(--p-accent)]"
                      style={{ fontSize: "clamp(19px, 2vw, 27px)" }}
                    >
                      {item.body}
                    </span>
                  </motion.div>
                ))}
              </div>

            </div>
          </section>
          <ImageBreaks breaks={content.imageBreaks?.intro_specs} />
        </>
      );
    case "features":
      return (
        <>
          <section className="bg-[var(--p-bg)] px-6 py-20 md:px-14 md:py-28" id="features">
            <div className="mx-auto max-w-5xl">
              <motion.div {...reveal(0)} className="mb-14">
                <SectionLabel>特色亮點</SectionLabel>
                <h2
                  className="[font-family:var(--font-serif-tc)] font-light leading-[1.3] text-[var(--p-text)]"
                  style={{ fontSize: "clamp(26px, 3.5vw, 44px)" }}
                >
                  {content.featuresTitle}
                </h2>
              </motion.div>

              <div className="grid grid-cols-1 gap-px bg-[var(--p-accent)]/8 md:grid-cols-3">
                {content.featureCards.map((feature, i) => (
                  <motion.div
                    key={feature.itemKey ?? feature.title}
                    {...reveal(i * 0.12)}
                    className="group relative overflow-hidden bg-[var(--p-bg)] px-8 py-12 transition-colors duration-300 hover:bg-[var(--p-bg-2)]"
                  >
                    <div className="absolute left-0 right-0 top-0 h-px bg-gradient-to-r from-transparent via-[var(--p-accent)] to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-60" />
                    <span className="mb-6 block select-none font-serif text-[80px] font-light leading-none text-[var(--p-accent)]/20 transition-colors duration-500 group-hover:text-[var(--p-accent)]/40">
                      {feature.accent}
                    </span>
                    <span className="mb-6 block h-px w-8 bg-[var(--p-accent)]/60" />
                    <h3 className="[font-family:var(--font-serif-tc)] mb-4 text-[16px] font-normal tracking-[0.05em] text-[var(--p-text)]">
                      {feature.title}
                    </h3>
                    <p className="text-[12px] leading-[2] tracking-[0.05em] text-[var(--p-text-muted)]">
                      {feature.body}
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
          <ImageBreaks breaks={content.imageBreaks?.features} />
        </>
      );
    case "progress":
      return (
        <>
          <section className="bg-[var(--p-bg)] px-6 py-20 md:px-14 md:py-28" id="progress">
            <div className="mx-auto max-w-5xl">
              <motion.div
                {...reveal(0)}
                className="mb-16 flex flex-col gap-4 md:flex-row md:items-end md:justify-between"
              >
                <div>
                  <SectionLabel>工程進度</SectionLabel>
                  <h2
                    className="[font-family:var(--font-serif-tc)] font-light leading-[1.3] text-[var(--p-text)]"
                    style={{ fontSize: "clamp(26px, 3.5vw, 44px)" }}
                  >
                    {content.progressTitle}
                  </h2>
                </div>
                <p className="font-serif text-[13px] tracking-[0.05em] text-[var(--p-text-ghost)]">
                  {content.progressCompletionText}
                </p>
              </motion.div>

              <div className="relative mt-4 hidden md:block">
                <div className="absolute left-0 right-0 top-[10px] h-px bg-[var(--p-accent)]/10" />
                <motion.div
                  initial={{ scaleX: 0 }}
                  whileInView={{ scaleX: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.6, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  className="absolute left-0 top-[10px] h-px origin-left bg-gradient-to-r from-[var(--p-accent)] via-[var(--p-accent)] to-[var(--p-accent)]/20"
                  style={{ width: `${progressPct}%` }}
                />
                <div className="relative flex justify-between">
                  {content.timelineItems.map((milestone, i) => (
                    <motion.div
                      key={milestone.itemKey ?? milestone.title}
                      {...reveal(i * 0.1)}
                      className="flex flex-col items-center"
                      style={{ width: `${100 / content.timelineItems.length}%` }}
                    >
                      <button
                        onClick={() => {
                          if (isEditing) return;
                          setSelectedMilestone(milestone);
                        }}
                        className="group/node relative mb-7 focus:outline-none"
                        aria-label={`查看 ${milestone.title} 工程照片`}
                      >
                        <ProgressDot state={milestone.state} />
                        <span className="pointer-events-none absolute -bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap font-serif text-[8px] uppercase tracking-[0.3em] text-[var(--p-accent)] opacity-0 transition-opacity duration-200 group-hover/node:opacity-100">
                          查看
                        </span>
                      </button>
                      <p
                        className={[
                          "[font-family:var(--font-serif-tc)] mt-1 mb-1 text-center text-[12px] leading-snug tracking-[0.04em]",
                          milestone.state === "completed" || milestone.state === "current"
                            ? "text-[var(--p-text-warm)]"
                            : "text-[var(--p-text-muted)]",
                        ].join(" ")}
                      >
                        {milestone.title}
                      </p>
                      <p
                        className={[
                          "text-center font-serif text-[10px] tracking-[0.1em]",
                          milestone.state === "current"
                            ? "text-[var(--p-accent)]"
                            : milestone.state === "completed"
                              ? "text-[var(--p-text-ghost)]"
                              : "text-[var(--p-ghost)]",
                        ].join(" ")}
                      >
                        {milestone.meta}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </div>

              <div className="relative pl-9 md:hidden">
                <div className="absolute bottom-0 left-[10px] top-0 w-px bg-[var(--p-accent)]/10" />
                <motion.div
                  initial={{ scaleY: 0 }}
                  whileInView={{ scaleY: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.6, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  className="absolute left-[10px] top-0 w-px origin-top bg-gradient-to-b from-[var(--p-accent)] via-[var(--p-accent)] to-[var(--p-accent)]/20"
                  style={{ height: `${progressPct}%` }}
                />
                <div className="space-y-10">
                  {content.timelineItems.map((milestone, i) => (
                    <motion.div
                      key={milestone.itemKey ?? milestone.title}
                      {...reveal(i * 0.08)}
                      className="relative flex items-start gap-5"
                    >
                      <button
                        onClick={() => {
                          if (isEditing) return;
                          setSelectedMilestone(milestone);
                        }}
                        className="group/node absolute left-[-29px] top-[1px] focus:outline-none"
                        aria-label={`查看 ${milestone.title} 工程照片`}
                      >
                        <ProgressDot state={milestone.state} />
                      </button>
                      <div>
                        <p
                          className={[
                            "[font-family:var(--font-serif-tc)] mb-1 text-[14px] tracking-[0.04em]",
                            milestone.state === "completed" || milestone.state === "current"
                              ? "text-[var(--p-text-warm)]"
                              : "text-[var(--p-text-muted)]",
                          ].join(" ")}
                        >
                          {milestone.title}
                        </p>
                        <p
                          className={[
                            "font-serif text-[12px] tracking-[0.08em]",
                            milestone.state === "current"
                              ? "text-[var(--p-accent)]"
                              : milestone.state === "completed"
                                ? "text-[var(--p-text-ghost)]"
                                : "text-[var(--p-ghost)]",
                          ].join(" ")}
                        >
                          {milestone.meta}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </section>
          <ImageBreaks breaks={content.imageBreaks?.progress} />
        </>
      );
    case "location":
      return (
        <>
          <section className="grid min-h-[70vh] grid-cols-1 md:grid-cols-[55%_45%]" id="location">
            <motion.div
              {...reveal(0)}
              className="flex flex-col justify-center bg-[var(--p-bg)] px-8 py-20 md:px-14 md:py-24"
            >
              <SectionLabel>地理位置</SectionLabel>
              <h2
                className="[font-family:var(--font-serif-tc)] mb-10 font-light leading-[1.3] text-[var(--p-text)]"
                style={{ fontSize: "clamp(24px, 3.5vw, 44px)" }}
              >
                {content.districtLabel}
              </h2>

              <div className="flex flex-col">
                {content.locationPoints.map((item, i) => (
                  <div
                    key={item.itemKey ?? item.title}
                    className={`flex items-center justify-between py-[14px] ${
                      i < content.locationPoints.length - 1
                        ? "border-b border-white/[0.05]"
                        : ""
                    }`}
                  >
                    <span className="[font-family:var(--font-serif-tc)] flex items-center gap-3 text-[13px] tracking-[0.05em] text-[var(--p-text-warm)]">
                      <span
                        className="h-[7px] w-[7px] shrink-0 rounded-full"
                        style={{ backgroundColor: item.accent }}
                      />
                      {item.title}
                    </span>
                    <span className="ml-4 shrink-0 font-serif text-[18px] font-light tabular-nums text-[var(--p-accent)]">
                      {item.body}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>

            <div className="relative isolate min-h-[400px] md:h-[70vh]">
              <PropertyMap lat={content.mapLat} lng={content.mapLng} zoom={content.mapZoom} colorTheme={content.colorTheme} />
              <div className="pointer-events-none absolute inset-y-0 left-0 w-px bg-gradient-to-b from-transparent via-[var(--p-accent)]/20 to-transparent" />
            </div>
          </section>
          <ImageBreaks breaks={content.imageBreaks?.location} />
        </>
      );
    case "contact":
      return (
        <>
          <section className="relative overflow-hidden bg-[var(--p-bg)] px-6 py-20 md:px-14 md:py-28" id="contact">
            <motion.div {...reveal(0)} className="relative z-10 max-w-[600px]">
              <SectionLabel>預約賞屋</SectionLabel>
              <h2
                className="[font-family:var(--font-serif-tc)] mb-4 font-light leading-[1.3] text-[var(--p-text)]"
                style={{ fontSize: "clamp(26px, 3.5vw, 44px)" }}
              >
                {content.contactTitle}
              </h2>
              <p className="mb-10 text-[13px] leading-[2.2] tracking-[0.05em] text-[var(--p-text-muted)]">
                {content.contactBody}
              </p>

              <ContactFormBlock
                slug={content.slug}
                isEditing={isEditing}
                submitted={submitted}
                setSubmitted={setSubmitted}
              />
            </motion.div>
          </section>
          <ImageBreaks breaks={content.imageBreaks?.contact} />
        </>
      );
    case "footer":
      return (
        <footer className="flex flex-col items-start justify-between gap-4 border-t border-white/5 bg-[var(--p-bg)] px-6 py-8 md:flex-row md:items-center md:px-14">
          <div className="font-serif text-[11px] uppercase tracking-[0.35em] text-[var(--p-accent)]">
            {content.name} · {content.subtitle}
          </div>
          <p className="[font-family:var(--font-serif-tc)] max-w-[480px] text-center text-[10px] leading-[1.9] text-[var(--p-text-ghost)]">
            {content.footerDisclaimer}
          </p>
          <div className="text-[11px] tracking-[0.1em] text-[var(--p-text-muted)] md:text-right">
            <div className="mb-0.5 text-[var(--p-text-ghost)]">銷售專線</div>
            <a
              href={`tel:${content.salesPhone.replace(/[^+\d]/g, "")}`}
              className="text-[var(--p-accent)] no-underline transition-colors duration-300 hover:text-[var(--p-accent-lt)]"
            >
              {content.salesPhone}
            </a>
          </div>
        </footer>
      );
    case "image_section":
      return (
        <section className="overflow-hidden bg-[var(--p-bg)]">
          {module.imageSection?.primaryImage ? (
            <motion.div {...reveal(0.05)} className="w-full">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={module.imageSection.primaryImage.url}
                alt={module.imageSection.primaryImage.alt}
                className="hidden w-full h-auto md:block"
              />
              {module.imageSection.secondaryImage ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={module.imageSection.secondaryImage.url}
                  alt={module.imageSection.secondaryImage.alt}
                  className="block w-full h-auto md:hidden"
                />
              ) : (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={module.imageSection.primaryImage.url}
                  alt={module.imageSection.primaryImage.alt}
                  className="block w-full h-auto md:hidden"
                />
              )}
            </motion.div>
          ) : (
            <div className="flex w-full aspect-[21/9] items-center justify-center border border-dashed border-[var(--p-accent)]/20 text-[11px] uppercase tracking-[0.35em] text-[var(--p-text-ghost)]">
              尚未上傳圖片
            </div>
          )}
        </section>
      );
    case "floor_plan":
      return (
        <section className="bg-[var(--p-bg)] px-6 py-20 md:px-14 md:py-28">
          {/* Header */}
          <motion.div {...reveal(0)} className="mb-14">
            <p className="mb-3 font-serif text-[10px] uppercase tracking-[0.5em] text-[var(--p-accent)]">
              Floor Plan
            </p>
            <h2
              className="[font-family:var(--font-serif-tc)] font-light text-[var(--p-text)]"
              style={{ fontSize: "clamp(28px, 4vw, 52px)" }}
            >
              {content.floorPlanTitle}
            </h2>
          </motion.div>

          {/* Unit cards */}
          <div
            className={`grid gap-8 md:gap-6 ${
              content.floorPlanUnits.length <= 3
                ? "grid-cols-1 md:grid-cols-3"
                : content.floorPlanUnits.length === 5
                  ? "grid-cols-2 md:grid-cols-5"
                  : "grid-cols-2 md:grid-cols-4"
            }`}
          >
            {content.floorPlanUnits.map((unit, index) => (
              <motion.div
                key={unit.itemKey ?? index}
                {...reveal(index * 0.08)}
                className="group flex flex-col"
              >
                {/* Image */}
                <div className="relative mb-5 aspect-square overflow-hidden bg-[var(--p-bg-card)]">
                  {unit.imageUrl ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={unit.imageUrl}
                      alt={`${unit.title} 戶型圖`}
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                    />
                  ) : (
                    <div className="flex h-full w-full flex-col items-center justify-center gap-3">
                      <span
                        className="[font-family:var(--font-serif-tc)] font-light text-[var(--p-ghost)]"
                        style={{ fontSize: "clamp(36px, 5vw, 56px)" }}
                      >
                        {unit.unitNumber}
                      </span>
                      <span className="font-serif text-[9px] uppercase tracking-[0.4em] text-[var(--p-ghost)]">
                        {unit.title}
                      </span>
                    </div>
                  )}
                  {/* 熱門 tag — corner of image, no text overlap on content */}
                  {index === 0 && (
                    <div className="absolute left-0 top-0 bg-[var(--p-accent)] px-2.5 py-1">
                      <span className="font-serif text-[8px] uppercase tracking-[0.3em] text-[var(--p-bg)]">
                        熱門
                      </span>
                    </div>
                  )}
                </div>

                {/* Metadata */}
                <div className="flex flex-col gap-2.5">
                  <div className="flex items-baseline justify-between border-b border-[var(--p-accent)]/10 pb-3">
                    <p className="[font-family:var(--font-serif-tc)] text-[17px] font-light text-[var(--p-text)]">
                      {unit.title}
                    </p>
                    <span className="font-serif text-[11px] tracking-[0.35em] text-[var(--p-ghost)]">
                      {unit.unitNumber}
                    </span>
                  </div>

                  <p className="font-serif text-[13px] tracking-[0.12em] text-[var(--p-text-ghost)]">
                    {unit.body}
                  </p>

                  <div className="mt-1 grid grid-cols-2 gap-x-3">
                    <div>
                      <p className="mb-1 font-serif text-[8px] uppercase tracking-[0.4em] text-[var(--p-ghost)]">
                        坪數
                      </p>
                      <p className="[font-family:var(--font-serif-tc)] text-[16px] text-[var(--p-accent-lt)]">
                        {unit.meta}
                      </p>
                    </div>
                    <div>
                      <p className="mb-1 font-serif text-[8px] uppercase tracking-[0.4em] text-[var(--p-ghost)]">
                        售價
                      </p>
                      <p className="[font-family:var(--font-serif-tc)] text-[16px] text-[var(--p-accent)]">
                        {unit.accent}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      );
    case "team":
      return (
        <section className="bg-[var(--p-bg)] px-6 py-20 md:px-14 md:py-28">
          {/* Header */}
          <motion.div {...reveal(0)} className="mb-16">
            <p className="mb-3 font-serif text-[10px] uppercase tracking-[0.5em] text-[var(--p-accent)]">
              Our Team
            </p>
            <h2
              className="[font-family:var(--font-serif-tc)] font-light text-[var(--p-text)]"
              style={{ fontSize: "clamp(28px, 4vw, 52px)" }}
            >
              {content.teamTitle}
            </h2>
          </motion.div>

          {/* Member grid */}
          <div className={`grid gap-x-6 gap-y-12 ${
            content.teamMembers.length === 5
              ? 'grid-cols-2 md:grid-cols-5'
              : 'grid-cols-2 md:grid-cols-4'
          }`}>
            {content.teamMembers.map((member, index) => (
              <motion.div
                key={member.itemKey ?? index}
                {...reveal(index * 0.08)}
                className="group flex flex-col"
              >
                {/* Portrait */}
                <div className="relative mb-5 aspect-[3/4] w-full overflow-hidden bg-[var(--p-bg-card)]">
                  {member.imageUrl ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={member.imageUrl}
                      alt={member.name}
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                    />
                  ) : (
                    <div className="flex h-full w-full flex-col items-end justify-end p-5">
                      <span
                        className="[font-family:var(--font-serif-tc)] font-light leading-none text-[var(--p-ghost)]"
                        style={{ fontSize: "clamp(48px, 7vw, 80px)" }}
                      >
                        {String(index + 1).padStart(2, '0')}
                      </span>
                    </div>
                  )}
                  {/* Warm glow on hover */}
                  <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-[linear-gradient(to_top,rgba(201,169,110,0.12)_0%,transparent_100%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                </div>

                {/* Identity */}
                <div className="border-t border-[var(--p-accent)]/20 pt-4">
                  <p className="mb-1 font-serif text-[9px] uppercase tracking-[0.45em] text-[var(--p-accent)]">
                    {member.role}
                  </p>
                  <h3 className="[font-family:var(--font-serif-tc)] mb-3 text-[17px] font-light leading-snug text-[var(--p-text)] transition-colors duration-300 group-hover:text-[var(--p-accent-lt)]">
                    {member.name}
                  </h3>
                  <p className="[font-family:var(--font-serif-tc)] text-[13px] leading-[1.9] text-[var(--p-text-muted)]">
                    {member.intro}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      );

    case "indoor_commons": {
      const amenities = content.indoorAmenities

      // Shared card renderer — used by both carousel (mobile) and grid (desktop)
      const AmenityCard = ({ amenity, index }: { amenity: typeof amenities[number]; index: number }) => (
        <motion.div
          {...reveal(index * 0.07)}
          className="group relative overflow-hidden"
        >
          <div className="relative aspect-[4/3] w-full overflow-hidden bg-[var(--p-bg-card)]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={amenity.url}
              alt={amenity.alt || amenity.label}
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.06]"
            />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-2/5 bg-[linear-gradient(to_top,rgba(13,13,14,0.82)_0%,transparent_100%)]" />
            {amenity.label && (
              <div className="absolute bottom-0 left-0 px-4 pb-4 md:px-5 md:pb-5">
                <p
                  className="[font-family:var(--font-serif-tc)] font-light leading-none text-[var(--p-text-warm)] transition-colors duration-300 group-hover:text-[var(--p-accent)]"
                  style={{ fontSize: "clamp(16px, 2.2vw, 26px)" }}
                >
                  {amenity.label}
                </p>
              </div>
            )}
          </div>
        </motion.div>
      )

      const PlaceholderCard = ({ index }: { index: number }) => (
        <motion.div
          {...reveal(index * 0.07)}
          className="relative aspect-[4/3] overflow-hidden bg-[var(--p-bg-card)]"
        >
          <div className="absolute inset-0 flex flex-col items-end justify-end p-5">
            <span
              className="[font-family:var(--font-serif-tc)] font-light leading-none text-[var(--p-ghost)]"
              style={{ fontSize: "clamp(32px, 5vw, 60px)" }}
            >
              {String(index + 1).padStart(2, '0')}
            </span>
          </div>
        </motion.div>
      )

      const items = amenities.length > 0 ? amenities : null

      return (
        <section className="bg-[var(--p-bg)] py-20 md:px-14 md:py-28">
          {/* Header — padded on mobile too */}
          <motion.div {...reveal(0)} className="mb-10 px-6 md:mb-14 md:px-0">
            <p className="mb-3 font-serif text-[10px] uppercase tracking-[0.5em] text-[var(--p-accent)]">
              Indoor Commons
            </p>
            <div className="flex items-end justify-between">
              <h2
                className="[font-family:var(--font-serif-tc)] font-light text-[var(--p-text)]"
                style={{ fontSize: "clamp(28px, 4vw, 52px)" }}
              >
                {content.indoorCommonsTitle}
              </h2>
              {/* Swipe hint — mobile only */}
              <p className="mb-1 flex items-center gap-1.5 text-[11px] tracking-widest text-[var(--p-text-ghost)] md:hidden">
                <span>滑動</span>
                <svg width="16" height="8" viewBox="0 0 16 8" fill="none" className="animate-[nudge_1.8s_ease-in-out_infinite]">
                  <path d="M0 4h13M10 1l3 3-3 3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </p>
            </div>
            {/* Hairline rule */}
            <div className="mt-5 h-px bg-[var(--p-border)] md:mt-7" />
          </motion.div>

          {/* ── Mobile: horizontal snap-scroll carousel ── */}
          <div
            className="flex snap-x snap-mandatory gap-3 overflow-x-auto pb-6 pl-6 pr-2 md:hidden"
            style={{ scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }}
          >
            {items
              ? items.map((amenity, index) => (
                  <div
                    key={amenity.sectionKey}
                    className="w-[78vw] flex-none snap-center"
                  >
                    <AmenityCard amenity={amenity} index={index} />
                  </div>
                ))
              : Array.from({ length: 6 }, (_, i) => (
                  <div key={i} className="w-[78vw] flex-none snap-center">
                    <PlaceholderCard index={i} />
                  </div>
                ))
            }
          </div>

          {/* ── Desktop: 3-col grid ── */}
          <div className="hidden grid-cols-3 gap-3 md:grid">
            {items
              ? items.map((amenity, index) => (
                  <AmenityCard key={amenity.sectionKey} amenity={amenity} index={index} />
                ))
              : Array.from({ length: 6 }, (_, i) => (
                  <PlaceholderCard key={i} index={i} />
                ))
            }
          </div>
        </section>
      )
    }

    case "surroundings": {
      const imgs = content.surroundingsImages
      // Layout: row1 = [large hero (col-span-2)] + [2 stacked portraits (col-span-1)]
      //         row2 = [3 equal images]
      const row1Hero     = imgs[0] ?? null
      const row1Stack    = imgs.slice(1, 3)
      const row2         = imgs.slice(3, 6)
      const hasImages    = imgs.length > 0
      const placeholders = Array.from({ length: Math.max(0, 6 - imgs.length) })
      const mobileItems  =
        hasImages
          ? imgs
          : Array.from({ length: 6 }, () => null as typeof imgs[0] | null)

      return (
        <section className="bg-[var(--p-bg)] py-20 md:px-14 md:py-28">
          {/* Header */}
          <motion.div {...reveal(0)} className="mb-10 px-6 md:mb-14 md:px-0">
            <p className="mb-3 font-serif text-[10px] uppercase tracking-[0.5em] text-[var(--p-accent)]">
              Surroundings
            </p>
            <div className="flex items-end justify-between">
              <h2
                className="[font-family:var(--font-serif-tc)] font-light text-[var(--p-text)]"
                style={{ fontSize: "clamp(28px, 4vw, 52px)" }}
              >
                {content.surroundingsTitle}
              </h2>
              {/* Swipe hint — mobile only */}
              <p className="mb-1 flex items-center gap-1.5 text-[11px] tracking-widest text-[var(--p-text-ghost)] md:hidden">
                <span>滑動</span>
                <svg width="16" height="8" viewBox="0 0 16 8" fill="none" className="animate-[nudge_1.8s_ease-in-out_infinite]">
                  <path d="M0 4h13M10 1l3 3-3 3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </p>
            </div>
            <div className="mt-5 h-px bg-[var(--p-border)] md:mt-7" />
          </motion.div>

          {/* ── Mobile: horizontal snap-scroll carousel ── */}
          <div
            className="flex snap-x snap-mandatory gap-3 overflow-x-auto pb-6 pl-6 pr-2 md:hidden"
            style={{ scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }}
          >
            {mobileItems.map((img, i) => (
              <div key={img?.sectionKey ?? i} className="w-[78vw] flex-none snap-center">
                <motion.div {...reveal(0.05 + i * 0.06)} className="group">
                  <div className="relative aspect-[4/3] w-full overflow-hidden bg-[var(--p-bg-card)]">
                    {img ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={img.url}
                        alt={img.alt}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                      />
                    ) : (
                      <SurroundingsPlaceholder label={String(i + 1).padStart(2, '0')} />
                    )}
                  </div>
                  {img?.caption && <SurroundingsCaption text={img.caption} />}
                </motion.div>
              </div>
            ))}
          </div>

          {/* ── Desktop: editorial grid (unchanged) ── */}
          <div className="hidden space-y-2 md:block md:space-y-3">

            {/* Row 1: large hero (2/3) + portrait stack (1/3) */}
            {(row1Hero || row1Stack.length > 0 || (!hasImages)) && (
              <div className="grid grid-cols-3 gap-3">
                {/* Hero — spans 2 cols */}
                <motion.div {...reveal(0.05)} className="group col-span-2">
                  <div className="relative aspect-[16/10] w-full overflow-hidden bg-[var(--p-bg-card)]">
                    {row1Hero ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={row1Hero.url}
                        alt={row1Hero.alt}
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                      />
                    ) : (
                      <SurroundingsPlaceholder label="01" />
                    )}
                  </div>
                  {row1Hero?.caption && <SurroundingsCaption text={row1Hero.caption} />}
                </motion.div>

                {/* Portrait stack */}
                <div className="col-span-1 grid grid-cols-1 gap-3">
                  {[0, 1].map((i) => {
                    const img = row1Stack[i] ?? null
                    return (
                      <motion.div key={i} {...reveal(0.1 + i * 0.07)} className="group">
                        <div className="relative w-full overflow-hidden bg-[var(--p-bg-card)]" style={{ height: 'calc(50% - 6px)', minHeight: '140px' }}>
                          <div className="absolute inset-0">
                            {img ? (
                              /* eslint-disable-next-line @next/next/no-img-element */
                              <img
                                src={img.url}
                                alt={img.alt}
                                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                              />
                            ) : (
                              <SurroundingsPlaceholder label={`0${i + 2}`} />
                            )}
                          </div>
                        </div>
                        {img?.caption && <SurroundingsCaption text={img.caption} />}
                      </motion.div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Row 2: 3 equal landscape images */}
            {(row2.length > 0 || (!hasImages && placeholders.length >= 3)) && (
              <div className="grid grid-cols-3 gap-3">
                {[0, 1, 2].map((i) => {
                  const img = row2[i] ?? null
                  return (
                    <motion.div key={i} {...reveal(0.15 + i * 0.07)} className="group">
                      <div className="relative aspect-[4/3] w-full overflow-hidden bg-[var(--p-bg-card)]">
                        {img ? (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img
                            src={img.url}
                            alt={img.alt}
                            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                          />
                        ) : (
                          <SurroundingsPlaceholder label={`0${i + 4}`} />
                        )}
                      </div>
                      {img?.caption && <SurroundingsCaption text={img.caption} />}
                    </motion.div>
                  )
                })}
              </div>
            )}
          </div>
        </section>
      );
    }
    default:
      return null;
  }
}

function SurroundingsCaption({ text }: { text: string }) {
  return (
    <div className="mt-3 border-l border-[var(--p-accent)]/40 pl-4">
      <p className="[font-family:var(--font-serif-tc)] text-[13px] leading-snug text-[var(--p-accent-lt)]/75">
        {text}
      </p>
    </div>
  )
}

function SurroundingsPlaceholder({ label }: { label: string }) {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-2">
      <span
        className="[font-family:var(--font-serif-tc)] font-light text-[var(--p-text-ghost)]"
        style={{ fontSize: "clamp(28px, 4vw, 48px)" }}
      >
        {label}
      </span>
      <span className="font-serif text-[8px] uppercase tracking-[0.5em] text-[var(--p-ghost)]">
        Photo
      </span>
    </div>
  )
}

function ProgressDot({
  state,
}: {
  state: "completed" | "current" | "upcoming";
}) {
  if (state === "completed") {
    return (
      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[var(--p-accent)] transition-transform duration-200 group-hover/node:scale-125">
        <div className="h-[7px] w-[7px] rounded-full bg-[var(--p-bg)]" />
      </div>
    );
  }

  if (state === "current") {
    return (
      <div className="relative flex h-5 w-5 items-center justify-center rounded-full border-2 border-[var(--p-accent)] transition-transform duration-200 group-hover/node:scale-125">
        <motion.div
          animate={{ scale: [1, 1.3, 1], opacity: [1, 0.6, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="h-2 w-2 rounded-full bg-[var(--p-accent)]"
        />
        <motion.div
          animate={{ scale: [1, 2.2, 1], opacity: [0.3, 0, 0.3] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="absolute inset-0 rounded-full border border-[var(--p-accent)]/50"
        />
      </div>
    );
  }

  return (
    <div className="h-5 w-5 rounded-full border border-[var(--p-ghost)] transition-all duration-200 group-hover/node:scale-110 group-hover/node:border-[var(--p-accent)]/40" />
  );
}

function ImageBreaks({
  breaks,
}: {
  breaks?: Array<{ sectionKey: string; url: string; alt: string }>;
}) {
  if (!breaks || breaks.length === 0) return null;
  return (
    <>
      {breaks.map((brk) => (
        <section key={brk.sectionKey} className="overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={brk.url} alt={brk.alt} className="block h-auto w-full" />
        </section>
      ))}
    </>
  );
}

function EditableModule({
  editor,
  module,
  children,
}: {
  editor?: DefaultPropertyPageProps["editor"];
  module: TongchuangTemplateModule;
  children: ReactNode;
}) {
  const isEditing = Boolean(editor?.isEditing);
  const isSelected = editor?.selectedModuleId === module.id;

  if (!isEditing) {
    return <>{children}</>;
  }

  return (
    <div className="relative scroll-mt-24" data-module-id={module.id}>
      {children}
      <button
        type="button"
        onClick={() => editor?.onModuleSelect?.(module.id)}
        className={[
          "absolute inset-0 z-20 border-2 transition-all duration-150",
          isSelected
            ? "border-[var(--p-accent)] bg-[var(--p-accent)]/[0.06]"
            : "border-transparent hover:border-[var(--p-accent)]/60 hover:bg-[var(--p-accent)]/[0.03]",
        ].join(" ")}
        aria-label={`編輯${module.label}`}
      />
      <div
        className={[
          "pointer-events-none absolute left-4 top-4 z-30 px-2.5 py-1 text-[10px] uppercase tracking-[0.24em] backdrop-blur-sm",
          isSelected
            ? "bg-[var(--p-accent)] text-[var(--p-bg)]"
            : "border border-[var(--p-accent)]/30 bg-[var(--p-bg)]/70 text-[var(--p-accent)]",
        ].join(" ")}
      >
        {module.label}
      </div>
    </div>
  );
}

function GoldDivider() {
  return (
    <div className="h-px w-full bg-gradient-to-r from-transparent via-[var(--p-accent)] to-transparent opacity-[0.18]" />
  );
}

const inputCls =
  "w-full bg-[var(--p-bg-card)] border border-[var(--p-border)] px-4 py-3 text-[13px] text-[var(--p-text-warm)] outline-none transition-colors duration-300 placeholder:text-[var(--p-text-ghost)] focus:border-[var(--p-accent)]/50";

// ── ContactFormBlock ───────────────────────────────────────────────────────────
// Controlled version of the contact form — submits to /api/inquiries and logs
// referral attribution via the hk_ref cookie set by the /r/[code] route.
function ContactFormBlock({
  slug,
  isEditing,
  submitted,
  setSubmitted,
}: {
  slug:         string
  isEditing:    boolean
  submitted:    boolean
  setSubmitted: (v: boolean) => void
}) {
  const [fields, setFields] = useState({ name: '', phone: '', email: '', unitType: '', notes: '' })
  const [submitting, setSubmitting] = useState(false)

  const update = (key: keyof typeof fields) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setFields(prev => ({ ...prev, [key]: e.target.value }))

  const handleSubmit = async () => {
    if (isEditing || submitted || submitting) return
    if (!fields.name.trim()) return
    setSubmitting(true)

    await fetch('/api/inquiries', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        property_slug: slug,
        name:          fields.name,
        phone:         fields.phone || null,
        email:         fields.email || null,
        message:       [fields.unitType && `有興趣的房型：${fields.unitType}`, fields.notes]
          .filter(Boolean).join('\n') || null,
      }),
    }).catch(() => null)

    setSubmitting(false)
    setSubmitted(true)
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <FormField label="姓名">
          <input type="text" placeholder="您的姓名" className={inputCls}
            value={fields.name} onChange={update('name')} />
        </FormField>
        <FormField label="聯絡電話">
          <input type="tel" placeholder="0912 345 678" className={inputCls}
            value={fields.phone} onChange={update('phone')} />
        </FormField>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <FormField label="電子信箱">
          <input type="email" placeholder="email@example.com" className={inputCls}
            value={fields.email} onChange={update('email')} />
        </FormField>
        <FormField label="有興趣的房型">
          <select className={`${inputCls} cursor-pointer bg-[var(--p-bg)]`}
            value={fields.unitType} onChange={update('unitType')}>
            <option value="">請選擇</option>
            <option>35坪 精奢2房</option>
            <option>45坪 精奢2-3房</option>
            <option>58坪 精奢3房</option>
          </select>
        </FormField>
      </div>
      <FormField label="備註">
        <textarea placeholder="如有其他問題或特殊需求，請在此說明…"
          className={`${inputCls} min-h-[90px] resize-y`}
          value={fields.notes} onChange={update('notes')} />
      </FormField>
      <div className="mt-2 flex items-center justify-between gap-4">
        <p className="[font-family:var(--font-serif-tc)] max-w-[180px] text-[10px] leading-[1.8] text-[var(--p-text-ghost)]">
          您的資料將受到嚴格保護，僅供本案聯繫使用。
        </p>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={submitting}
          className={[
            "shrink-0 px-8 py-3 [font-family:var(--font-serif-tc)] text-[12px] tracking-[0.18em] transition-all duration-300",
            submitted || submitting
              ? "cursor-default bg-[var(--p-accent)]/40 text-[var(--p-text)]"
              : "cursor-pointer bg-[var(--p-accent)] text-[var(--p-bg)] hover:bg-[var(--p-accent-lt)]",
          ].join(" ")}
        >
          {submitted ? "已送出，感謝您 ✓" : submitting ? "送出中…" : "送出預約"}
        </button>
      </div>
    </div>
  )
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-5 flex items-center gap-4">
      <span className="font-serif text-[10px] uppercase tracking-[0.5em] text-[var(--p-accent)]">
        {children}
      </span>
      <span className="block h-px w-12 bg-[var(--p-accent)]/30" />
    </div>
  );
}

function FormField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label className="[font-family:var(--font-serif-tc)] text-[9px] uppercase tracking-[0.35em] text-[var(--p-text-ghost)]">
        {label}
      </label>
      {children}
    </div>
  );
}
