"use client";

import Image from "next/image";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import type { Property } from "@/lib/types";

// Leaflet must be client-only (no SSR)
const PropertyMap = dynamic(() => import("./PropertyMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-[#141416] flex items-center justify-center">
      <span className="font-serif text-[11px] tracking-[0.3em] text-[#5A574F] uppercase">載入地圖中…</span>
    </div>
  ),
});

interface TongchuangWingPageProps {
  property: Property;
  referrer?: string | null;
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

const features = [
  {
    num: "01",
    title: "SC 鋼骨雙制震",
    desc: "頂級鋼骨結構搭配雙重制震系統，給您和家人最安心的保障。",
  },
  {
    num: "02",
    title: "忠孝新生捷運",
    desc: "步行即達，板南線與新店線交會，串聯台北全域。",
  },
  {
    num: "03",
    title: "城市天際視野",
    desc: "對望空總綠地，台北盆地全景盡收眼底，留白而從容。",
  },
];

const transitItems = [
  { dot: "#0070BD", name: "忠孝新生站（板南線）", time: "3", unit: "分鐘步行" },
  { dot: "#EF4723", name: "忠孝新生站（新店線）", time: "3", unit: "分鐘步行" },
  { dot: "#C9A96E", name: "帝寶商圈", time: "5", unit: "分鐘" },
  { dot: "#4A7C8E", name: "元利One Park", time: "10", unit: "分鐘" },
  { dot: "#6A8A60", name: "台北大安森林公園", time: "8", unit: "分鐘" },
];

const navLinks = [
  ["建案介紹", "#intro"],
  ["特色亮點", "#features"],
  ["工程進度", "#progress"],
  ["地理位置", "#location"],
  ["預約賞屋", "#contact"],
] as const;

const progressMilestones = [
  {
    label: "建照取得", date: "2022 Q4", completed: true, current: false,
    image: "/images/placeholders/exterior/exterior-1.webp",
    caption: "建造執照核發，正式取得合法建築許可。",
  },
  {
    label: "動工開工", date: "2023 Q2", completed: true, current: false,
    image: "/images/placeholders/projects/project-1.webp",
    caption: "開工典禮暨地基開挖作業啟動。",
  },
  {
    label: "基礎工程", date: "2023 Q4", completed: true, current: false,
    image: "/images/placeholders/projects/project-2.webp",
    caption: "樁基礎與地下室結構完工，驗收通過。",
  },
  {
    label: "結構體工程", date: "2024 Q3", completed: false, current: true,
    image: "/images/placeholders/projects/project-3.webp",
    caption: "SC 鋼骨主結構持續施工中，目前進度約 60%。",
  },
  {
    label: "室內裝修", date: "2025 Q3", completed: false, current: false,
    image: "/images/placeholders/interior/interior-1.webp",
    caption: "精裝修工程預計 2025 Q3 啟動。",
  },
  {
    label: "驗收交屋", date: "2026 Q1", completed: false, current: false,
    image: "/images/placeholders/interior/interior-3.webp",
    caption: "全棟驗收完成，預計 2026 Q1 正式交屋。",
  },
];

// How many milestones are done (for progress line width)
const completedCount = progressMilestones.filter((m) => m.completed).length;
const progressPct = (completedCount / (progressMilestones.length - 1)) * 100;

export default function TongchuangWingPage({
  property: _property,
  referrer: _referrer,
}: TongchuangWingPageProps) {
  const [submitted, setSubmitted] = useState(false);
  const [selectedMilestone, setSelectedMilestone] = useState<typeof progressMilestones[number] | null>(null);

  return (
    <div className="bg-[#0D0D0E] text-[#F0EDE8] overflow-x-hidden">

      {/* ── NAV ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-5 md:px-14 bg-gradient-to-b from-[#0D0D0E]/70 to-transparent pointer-events-none">
        <div className="font-serif text-[12px] tracking-[0.35em] text-[#C9A96E] uppercase pointer-events-auto">
          Phoenix One · 統創翼
        </div>
        <ul className="hidden md:flex gap-10 list-none pointer-events-auto">
          {navLinks.map(([label, href]) => (
            <li key={label}>
              <a
                href={href}
                className="[font-family:var(--font-serif-tc)] text-[11px] text-[#8A8680] no-underline tracking-[0.1em] hover:text-[#C9A96E] transition-colors duration-300"
              >
                {label}
              </a>
            </li>
          ))}
        </ul>
        <a
          href="#contact"
          className="text-[11px] tracking-[0.2em] uppercase text-[#C9A96E] border border-[#C9A96E]/40 px-5 py-2 no-underline hover:bg-[#C9A96E] hover:text-[#0D0D0E] transition-all duration-300 pointer-events-auto"
        >
          立即預約
        </a>
      </nav>

      {/* ══════════════════════════════════════════
          SECTION 1 — PURE IMAGE, NATURAL SIZE
      ══════════════════════════════════════════ */}
      <section className="overflow-hidden">
        <motion.div
          initial={{ scale: 1.06 }}
          animate={{ scale: 1.0 }}
          transition={{ duration: 18, ease: "easeOut" }}
        >
          {/* Desktop 1920×1080 — full width, height follows natural 16:9 ratio */}
          <Image
            src="/images/properties/tongchuang-wing/1.jpg"
            alt="統創翼"
            width={1920}
            height={1080}
            priority
            className="hidden md:block w-full h-auto"
            sizes="100vw"
          />
          {/* Mobile 1080×1920 — full width, height follows natural 9:16 ratio */}
          <Image
            src="/images/properties/tongchuang-wing/3.jpg"
            alt="統創翼"
            width={1080}
            height={1920}
            priority
            className="md:hidden w-full h-auto"
            sizes="100vw"
          />
        </motion.div>
      </section>

      {/* ══════════════════════════════════════════
          SECTION 2 — PURE IMAGE, NATURAL SIZE
      ══════════════════════════════════════════ */}
      <section className="overflow-hidden">
        {/* Desktop 1920×1080 */}
        <Image
          src="/images/properties/tongchuang-wing/2.jpg"
          alt="統創翼建築外觀"
          width={1920}
          height={1080}
          className="hidden md:block w-full h-auto"
          sizes="100vw"
        />
        {/* Mobile 1080×1920 */}
        <Image
          src="/images/properties/tongchuang-wing/4.jpg"
          alt="統創翼建築外觀"
          width={1080}
          height={1920}
          className="md:hidden w-full h-auto"
          sizes="100vw"
        />
      </section>

      {/* ══════════════════════════════════════════
          IDENTITY REVEAL — after the two pure images
      ══════════════════════════════════════════ */}
      <motion.div
        {...fadeIn(0)}
        className="border-b border-[#C9A96E]/10"
        id="intro"
      >
        <div className="px-6 pt-20 pb-0 md:px-14 md:pt-28 flex flex-col md:flex-row items-start md:items-end justify-between gap-10">
          <div>
            <p className="font-serif text-[10px] tracking-[0.5em] text-[#C9A96E] uppercase mb-5">
              大安 · 忠孝新生 · Taipei
            </p>
            <h1
              className="[font-family:var(--font-serif-tc)] font-light text-[#FAFAF8] leading-none"
              style={{ fontSize: "clamp(60px, 9vw, 120px)" }}
            >
              統創翼
            </h1>
            <p
              className="font-serif italic text-[#E8D5AA]/50 tracking-[0.3em] mt-3"
              style={{ fontSize: "clamp(14px, 2vw, 20px)" }}
            >
              Phoenix One
            </p>
          </div>
          <div className="flex flex-col gap-3 md:text-right pb-0 md:pb-2">
            <span className="font-serif text-[11px] tracking-[0.3em] text-[#5A574F] uppercase">
              預計竣工
            </span>
            <span
              className="font-serif text-[#C9A96E] leading-none"
              style={{ fontSize: "clamp(24px, 3vw, 36px)" }}
            >
              2026 Q1
            </span>
            <a
              href="#contact"
              className="mt-3 self-start md:self-end bg-[#C9A96E] text-[#0D0D0E] px-8 py-3 [font-family:var(--font-serif-tc)] text-[12px] tracking-[0.2em] no-underline hover:bg-[#E8D5AA] transition-all duration-300"
            >
              預約賞屋
            </a>
          </div>
        </div>

        {/* Key specs strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 mt-14 border-t border-[#C9A96E]/10">
          {[
            ["地段", "濟南路三段 67 號"],
            ["產品", "35–58 坪 · 2–3 房"],
            ["結構", "SC 鋼骨雙制震"],
            ["專線", "02-2752-8628"],
          ].map(([label, value]) => (
            <div
              key={label}
              className="px-6 py-6 md:px-10 border-r border-[#C9A96E]/10 last:border-r-0 odd:md:border-r"
            >
              <div className="[font-family:var(--font-serif-tc)] text-[9px] tracking-[0.35em] text-[#5A574F] uppercase mb-2">
                {label}
              </div>
              <div className="font-serif text-[15px] text-[#C9A96E]">{value}</div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* ══════════════════════════════════════════
          BUILDING INTRO + SPECS GRID
      ══════════════════════════════════════════ */}
      <section className="bg-[#141416] px-6 py-20 md:px-14 md:py-28">
        <div className="max-w-5xl mx-auto">
          <motion.div {...reveal(0)} className="mb-16">
            <SectionLabel>建案介紹</SectionLabel>
            <h2
              className="[font-family:var(--font-serif-tc)] font-light text-[#FAFAF8] leading-[1.3] mb-6"
              style={{ fontSize: "clamp(26px, 3.5vw, 44px)" }}
            >
              城市天際的精品美學
            </h2>
            <p className="font-serif text-[14px] text-[#8A8680] leading-[2.2] max-w-lg">
              每一個細節，都是對居住品質的極致承諾。<br />
              鋼骨雙制震，黃金級綠建築，天際視野留白從容。
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-px bg-[#C9A96E]/10">
            {[
              ["坪數規劃", "30 · 42 · 50 坪"],
              ["房型配置", "精奢 2–3 房"],
              ["抗震結構", "SC 鋼骨雙制震"],
              ["樓層", "地上 22 層"],
              ["綠建築", "黃金級目標"],
              ["接待中心", "市民大道三段 198 號 7F"],
            ].map(([label, value], i) => (
              <motion.div
                key={label}
                {...reveal(i * 0.06)}
                className="bg-[#141416] px-7 py-8 hover:bg-[#1A1A1D] transition-colors duration-300 group"
              >
                <span className="block [font-family:var(--font-serif-tc)] text-[9px] tracking-[0.35em] text-[#5A574F] uppercase mb-3">
                  {label}
                </span>
                <span className="font-serif text-[18px] text-[#FAFAF8] leading-snug group-hover:text-[#C9A96E] transition-colors duration-300">
                  {value}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <GoldDivider />

      {/* ══════════════════════════════════════════
          FEATURES
      ══════════════════════════════════════════ */}
      <section className="bg-[#0D0D0E] px-6 py-20 md:px-14 md:py-28" id="features">
        <div className="max-w-5xl mx-auto">
          <motion.div {...reveal(0)} className="mb-14">
            <SectionLabel>特色亮點</SectionLabel>
            <h2
              className="[font-family:var(--font-serif-tc)] font-light text-[#FAFAF8] leading-[1.3]"
              style={{ fontSize: "clamp(26px, 3.5vw, 44px)" }}
            >
              卓越的居住體驗
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-[#C9A96E]/8">
            {features.map((f, i) => (
              <motion.div
                key={f.num}
                {...reveal(i * 0.12)}
                className="bg-[#0D0D0E] px-8 py-12 relative overflow-hidden group hover:bg-[#141416] transition-colors duration-300"
              >
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#C9A96E] to-transparent opacity-0 group-hover:opacity-60 transition-opacity duration-500" />
                <span className="font-serif text-[80px] font-light text-[#C9A96E]/6 leading-none mb-6 block select-none">
                  {f.num}
                </span>
                <span className="w-8 h-px bg-[#C9A96E]/60 mb-6 block" />
                <h3 className="[font-family:var(--font-serif-tc)] text-[16px] font-normal text-[#FAFAF8] mb-4 tracking-[0.05em]">
                  {f.title}
                </h3>
                <p className="text-[12px] leading-[2] text-[#8A8680] tracking-[0.05em]">
                  {f.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <GoldDivider />

      {/* ══════════════════════════════════════════
          工程進度 — CONSTRUCTION PROGRESS
      ══════════════════════════════════════════ */}
      <section className="bg-[#0F0F11] px-6 py-20 md:px-14 md:py-28" id="progress">
        <div className="max-w-5xl mx-auto">
          <motion.div {...reveal(0)} className="mb-16 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <SectionLabel>工程進度</SectionLabel>
              <h2
                className="[font-family:var(--font-serif-tc)] font-light text-[#FAFAF8] leading-[1.3]"
                style={{ fontSize: "clamp(26px, 3.5vw, 44px)" }}
              >
                建設進程一覽
              </h2>
            </div>
            <p className="font-serif text-[13px] text-[#5A574F] tracking-[0.05em]">
              預計竣工{" "}
              <span className="text-[#C9A96E] ml-1">2026 Q1</span>
            </p>
          </motion.div>

          {/* ── Desktop horizontal timeline ── */}
          <div className="hidden md:block relative mt-4">
            {/* Track */}
            <div className="absolute top-[10px] left-0 right-0 h-px bg-[#C9A96E]/10" />
            {/* Filled progress */}
            <motion.div
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1.6, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="absolute top-[10px] left-0 h-px bg-gradient-to-r from-[#C9A96E] via-[#C9A96E] to-[#C9A96E]/20 origin-left"
              style={{ width: `${progressPct}%` }}
            />

            <div className="relative flex justify-between">
              {progressMilestones.map((m, i) => (
                <motion.div
                  key={m.label}
                  {...reveal(i * 0.1)}
                  className="flex flex-col items-center"
                  style={{ width: `${100 / progressMilestones.length}%` }}
                >
                  {/* Clickable node */}
                  <button
                    onClick={() => setSelectedMilestone(m)}
                    className="relative mb-7 group/node focus:outline-none"
                    aria-label={`查看 ${m.label} 工程照片`}
                  >
                    {m.completed ? (
                      <div className="w-5 h-5 rounded-full bg-[#C9A96E] flex items-center justify-center transition-transform duration-200 group-hover/node:scale-125">
                        <div className="w-[7px] h-[7px] rounded-full bg-[#0D0D0E]" />
                      </div>
                    ) : m.current ? (
                      <div className="w-5 h-5 rounded-full border-2 border-[#C9A96E] flex items-center justify-center relative transition-transform duration-200 group-hover/node:scale-125">
                        <motion.div
                          animate={{ scale: [1, 1.3, 1], opacity: [1, 0.6, 1] }}
                          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                          className="w-2 h-2 rounded-full bg-[#C9A96E]"
                        />
                        <motion.div
                          animate={{ scale: [1, 2.2, 1], opacity: [0.3, 0, 0.3] }}
                          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                          className="absolute inset-0 rounded-full border border-[#C9A96E]/50"
                        />
                      </div>
                    ) : (
                      <div className="w-5 h-5 rounded-full border border-[#2E2C27] transition-all duration-200 group-hover/node:border-[#C9A96E]/40 group-hover/node:scale-110" />
                    )}
                    {/* Hover hint */}
                    <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 font-serif text-[8px] tracking-[0.3em] text-[#C9A96E] uppercase whitespace-nowrap opacity-0 group-hover/node:opacity-100 transition-opacity duration-200 pointer-events-none">
                      查看
                    </span>
                  </button>

                  {/* Label */}
                  <p
                    className={[
                      "[font-family:var(--font-serif-tc)] text-[12px] tracking-[0.04em] text-center mb-1 leading-snug mt-1",
                      m.completed || m.current ? "text-[#F0EDE8]" : "text-[#3A3830]",
                    ].join(" ")}
                  >
                    {m.label}
                  </p>
                  <p
                    className={[
                      "font-serif text-[10px] tracking-[0.1em] text-center",
                      m.current ? "text-[#C9A96E]" : m.completed ? "text-[#5A574F]" : "text-[#2A2826]",
                    ].join(" ")}
                  >
                    {m.date}
                  </p>
                  {m.current && (
                    <span className="mt-2 font-serif text-[8.5px] tracking-[0.4em] text-[#C9A96E] uppercase">
                      施工中
                    </span>
                  )}
                </motion.div>
              ))}
            </div>
          </div>

          {/* ── Mobile vertical timeline ── */}
          <div className="md:hidden relative pl-9">
            {/* Track */}
            <div className="absolute top-0 bottom-0 left-[10px] w-px bg-[#C9A96E]/10" />
            {/* Filled progress */}
            <motion.div
              initial={{ scaleY: 0 }}
              whileInView={{ scaleY: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1.6, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="absolute top-0 left-[10px] w-px bg-gradient-to-b from-[#C9A96E] via-[#C9A96E] to-[#C9A96E]/20 origin-top"
              style={{ height: `${progressPct}%` }}
            />

            <div className="space-y-10">
              {progressMilestones.map((m, i) => (
                <motion.div
                  key={m.label}
                  {...reveal(i * 0.08)}
                  className="relative flex items-start gap-5"
                >
                  {/* Clickable node */}
                  <button
                    onClick={() => setSelectedMilestone(m)}
                    className="absolute left-[-29px] top-[1px] focus:outline-none group/node"
                    aria-label={`查看 ${m.label} 工程照片`}
                  >
                    {m.completed ? (
                      <div className="w-5 h-5 rounded-full bg-[#C9A96E] flex items-center justify-center transition-transform duration-200 group-hover/node:scale-125">
                        <div className="w-[7px] h-[7px] rounded-full bg-[#0D0D0E]" />
                      </div>
                    ) : m.current ? (
                      <div className="w-5 h-5 rounded-full border-2 border-[#C9A96E] flex items-center justify-center transition-transform duration-200 group-hover/node:scale-125">
                        <motion.div
                          animate={{ scale: [1, 1.3, 1], opacity: [1, 0.6, 1] }}
                          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                          className="w-2 h-2 rounded-full bg-[#C9A96E]"
                        />
                      </div>
                    ) : (
                      <div className="w-5 h-5 rounded-full border border-[#2E2C27] transition-all duration-200 group-hover/node:border-[#C9A96E]/40 group-hover/node:scale-110" />
                    )}
                  </button>

                  <div>
                    <p
                      className={[
                        "[font-family:var(--font-serif-tc)] text-[14px] tracking-[0.04em] mb-1",
                        m.completed || m.current ? "text-[#F0EDE8]" : "text-[#3A3830]",
                      ].join(" ")}
                    >
                      {m.label}
                      {m.current && (
                        <span className="ml-3 font-serif text-[8.5px] tracking-[0.35em] text-[#C9A96E] uppercase align-middle">
                          施工中
                        </span>
                      )}
                    </p>
                    <p
                      className={[
                        "font-serif text-[12px] tracking-[0.08em]",
                        m.current ? "text-[#C9A96E]" : m.completed ? "text-[#5A574F]" : "text-[#2A2826]",
                      ].join(" ")}
                    >
                      {m.date}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <GoldDivider />

      {/* ══════════════════════════════════════════
          LOCATION
      ══════════════════════════════════════════ */}
      <section className="grid grid-cols-1 md:grid-cols-[55%_45%] min-h-[70vh]" id="location">
        <motion.div
          {...reveal(0)}
          className="px-8 py-20 md:px-14 md:py-24 flex flex-col justify-center bg-[#0D0D0E]"
        >
          <SectionLabel>地理位置</SectionLabel>
          <h2
            className="[font-family:var(--font-serif-tc)] font-light text-[#FAFAF8] leading-[1.3] mb-10"
            style={{ fontSize: "clamp(24px, 3.5vw, 44px)" }}
          >
            台北核心黃金地段
          </h2>

          <div className="flex flex-col">
            {transitItems.map((item, i) => (
              <div
                key={item.name}
                className={`flex items-center justify-between py-[14px] ${
                  i < transitItems.length - 1 ? "border-b border-white/[0.05]" : ""
                }`}
              >
                <span className="[font-family:var(--font-serif-tc)] text-[13px] text-[#F0EDE8] tracking-[0.05em] flex items-center gap-3">
                  <span
                    className="w-[7px] h-[7px] rounded-full shrink-0"
                    style={{ backgroundColor: item.dot }}
                  />
                  {item.name}
                </span>
                <span className="font-serif text-[18px] font-light text-[#C9A96E] shrink-0 ml-4 tabular-nums">
                  {item.time}
                  <span className="text-[10px] text-[#5A574F] ml-1">{item.unit}</span>
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Map — CartoDB Dark Matter, no API key required */}
        <div className="relative min-h-[400px] md:min-h-0 md:h-full isolate">
          <PropertyMap lat={25.0432} lng={121.5294} zoom={15} />
          {/* Thin gold border on the left edge to blend with the content panel */}
          <div className="absolute inset-y-0 left-0 w-px bg-gradient-to-b from-transparent via-[#C9A96E]/20 to-transparent pointer-events-none" />
        </div>
      </section>

      <GoldDivider />

      {/* ══════════════════════════════════════════
          CONTACT
      ══════════════════════════════════════════ */}
      <section
        className="px-6 py-20 md:px-14 md:py-28 bg-[#1C1C1F] relative overflow-hidden"
        id="contact"
      >
        {/* Watermark */}
        <div
          className="absolute right-[-2%] top-1/2 -translate-y-1/2 font-serif font-light text-[#C9A96E]/[0.025] leading-[0.85] tracking-[-0.05em] pointer-events-none select-none hidden lg:block whitespace-pre"
          style={{ fontSize: 190 }}
        >
          {"PHOENIX\nONE"}
        </div>

        <motion.div {...reveal(0)} className="max-w-[600px] relative z-10">
          <SectionLabel>預約賞屋</SectionLabel>
          <h2
            className="[font-family:var(--font-serif-tc)] font-light text-[#FAFAF8] leading-[1.3] mb-4"
            style={{ fontSize: "clamp(26px, 3.5vw, 44px)" }}
          >
            開啟您的頂級居住旅程
          </h2>
          <p className="text-[13px] text-[#8A8680] leading-[2.2] tracking-[0.05em] mb-10">
            專屬顧問將於 24 小時內與您聯繫，安排私人賞屋行程。
          </p>

          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField label="姓名">
                <input type="text" placeholder="您的姓名" className={inputCls} />
              </FormField>
              <FormField label="聯絡電話">
                <input type="tel" placeholder="0912 345 678" className={inputCls} />
              </FormField>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField label="電子信箱">
                <input type="email" placeholder="email@example.com" className={inputCls} />
              </FormField>
              <FormField label="有興趣的房型">
                <select className={`${inputCls} bg-[#1C1C1F] cursor-pointer`}>
                  <option value="">請選擇</option>
                  <option>35坪 精奢2房</option>
                  <option>45坪 精奢2-3房</option>
                  <option>58坪 精奢3房</option>
                </select>
              </FormField>
            </div>
            <FormField label="備註">
              <textarea
                placeholder="如有其他問題或特殊需求，請在此說明…"
                className={`${inputCls} min-h-[90px] resize-y`}
              />
            </FormField>
            <div className="flex items-center justify-between mt-2 gap-4">
              <p className="[font-family:var(--font-serif-tc)] text-[10px] text-[#5A574F] max-w-[180px] leading-[1.8]">
                您的資料將受到嚴格保護，僅供本案聯繫使用。
              </p>
              <button
                type="button"
                onClick={() => setSubmitted(true)}
                className={[
                  "px-8 py-3 [font-family:var(--font-serif-tc)] text-[12px] tracking-[0.18em] transition-all duration-300 shrink-0",
                  submitted
                    ? "bg-[#4A7C8E] text-[#FAFAF8] cursor-default"
                    : "bg-[#C9A96E] text-[#0D0D0E] hover:bg-[#E8D5AA] cursor-pointer",
                ].join(" ")}
              >
                {submitted ? "已送出，感謝您 ✓" : "送出預約"}
              </button>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="px-6 py-8 md:px-14 bg-[#0D0D0E] flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-t border-white/5">
        <div className="font-serif text-[11px] tracking-[0.35em] text-[#C9A96E] uppercase">
          統創翼 · Phoenix One
        </div>
        <p className="[font-family:var(--font-serif-tc)] text-[10px] text-[#5A574F] max-w-[480px] text-center leading-[1.9]">
          本廣告圖為建築3D環境合成示意圖，實際外觀依主管機關核准圖說為準。廣告內容依相關法規規範，建案詳情請洽銷售人員確認。
        </p>
        <div className="text-[11px] text-[#8A8680] md:text-right tracking-[0.1em]">
          <div className="text-[#5A574F] mb-0.5">銷售專線</div>
          <a href="tel:+886227528628" className="text-[#C9A96E] no-underline hover:text-[#E8D5AA] transition-colors duration-300">
            02-2752-8628
          </a>
        </div>
      </footer>

      {/* ══════════════════════════════════════════
          MILESTONE LIGHTBOX
      ══════════════════════════════════════════ */}
      <AnimatePresence>
        {selectedMilestone && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="fixed inset-0 z-[100] bg-black/85 backdrop-blur-sm"
              onClick={() => setSelectedMilestone(null)}
            />

            {/* Panel */}
            <motion.div
              key="panel"
              initial={{ opacity: 0, scale: 0.96, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 16 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="fixed inset-0 z-[101] flex items-center justify-center p-6 pointer-events-none"
            >
              <div className="relative w-full max-w-lg bg-[#141416] border border-[#C9A96E]/15 pointer-events-auto overflow-hidden">

                {/* Image */}
                <div className="relative aspect-video">
                  <Image
                    src={selectedMilestone.image}
                    alt={selectedMilestone.label}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 512px"
                  />
                  {/* Bottom gradient fade into panel */}
                  <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_50%,rgba(20,20,22,0.9)_100%)]" />

                  {/* Status badge over image */}
                  {selectedMilestone.current && (
                    <div className="absolute top-4 left-4 flex items-center gap-2 bg-[#0D0D0E]/70 backdrop-blur-sm px-3 py-1.5 border border-[#C9A96E]/30">
                      <motion.span
                        animate={{ opacity: [1, 0.4, 1] }}
                        transition={{ duration: 1.6, repeat: Infinity }}
                        className="w-1.5 h-1.5 rounded-full bg-[#C9A96E] block"
                      />
                      <span className="font-serif text-[9px] tracking-[0.4em] text-[#C9A96E] uppercase">
                        施工中
                      </span>
                    </div>
                  )}
                  {selectedMilestone.completed && (
                    <div className="absolute top-4 left-4 bg-[#0D0D0E]/70 backdrop-blur-sm px-3 py-1.5 border border-[#C9A96E]/20">
                      <span className="font-serif text-[9px] tracking-[0.4em] text-[#C9A96E] uppercase">
                        已完成
                      </span>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="px-7 py-6">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <h3 className="[font-family:var(--font-serif-tc)] text-[20px] font-light text-[#FAFAF8] leading-snug">
                      {selectedMilestone.label}
                    </h3>
                    <span className="font-serif text-[13px] text-[#C9A96E] shrink-0 mt-1">
                      {selectedMilestone.date}
                    </span>
                  </div>
                  <p className="[font-family:var(--font-serif-tc)] text-[13px] text-[#8A8680] leading-[1.9]">
                    {selectedMilestone.caption}
                  </p>
                </div>

                {/* Close */}
                <button
                  onClick={() => setSelectedMilestone(null)}
                  className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center text-[#8A8680] hover:text-[#F0EDE8] bg-[#0D0D0E]/60 backdrop-blur-sm transition-colors duration-200"
                  aria-label="關閉"
                >
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                    <path d="M1 1L9 9M9 1L1 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
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

// ── Shared helpers ────────────────────────────────────────────────────────────

function GoldDivider() {
  return (
    <div className="w-full h-px bg-gradient-to-r from-transparent via-[#C9A96E] to-transparent opacity-[0.18]" />
  );
}

const inputCls =
  "bg-white/[0.03] border border-white/[0.08] text-[#F0EDE8] px-4 py-3 text-[13px] outline-none focus:border-[#C9A96E]/50 placeholder:text-[#5A574F] transition-colors duration-300 w-full";

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-4 mb-5">
      <span className="font-serif text-[10px] tracking-[0.5em] text-[#C9A96E] uppercase">
        {children}
      </span>
      <span className="w-12 h-px bg-[#C9A96E]/30 block" />
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
      <label className="[font-family:var(--font-serif-tc)] text-[9px] tracking-[0.35em] text-[#5A574F] uppercase">
        {label}
      </label>
      {children}
    </div>
  );
}
