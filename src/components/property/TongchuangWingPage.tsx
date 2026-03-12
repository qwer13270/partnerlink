"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import {
  ArrowUpRight,
  Building2,
  Leaf,
  MapPin,
  ShieldCheck,
  Sparkles,
  Train,
} from "lucide-react";
import type { Property } from "@/lib/types";
import BookTourCTA from "./BookTourCTA";
import ConstructionTimeline from "./ConstructionTimeline";

interface TongchuangWingPageProps {
  property: Property;
  referrer?: string | null;
}

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.9, delay, ease: [0.22, 1, 0.36, 1] as const },
});

const firstSectionImage = {
  desktop: "/images/properties/tongchuang-wing/2.jpg",
  mobile: "/images/properties/tongchuang-wing/11.jpg",
} as const;
const secondSectionImage = {
  desktop: "/images/properties/tongchuang-wing/1.jpg",
  mobile: "/images/properties/tongchuang-wing/22.jpg",
} as const;
const firstSectionMobileImage = firstSectionImage.mobile;
const firstSectionDesktopImage = firstSectionImage.desktop;

const anchors = [
  ["核心地段", "建國濟南門牌"],
  ["空總首席", "21,000 坪開闊視野"],
  ["雙線樞紐", "忠孝新生串聯台北"],
];

const siteMoments = [
  {
    label: "城景第一排",
    title: "不是看見一片台北，而是直接住進台北最稀缺的留白。",
    body: "從高空視野到街區尺度，這個案子的魅力在於「大安少有的新鮮感」。對望仁愛空總，城市並不擁擠，反而因為大片開放視野而顯得從容。",
  },
  {
    label: "雙站雙軸",
    title: "忠孝新生在前，大安森林公園在側，移動與休息都保有節奏感。",
    body: "這裡的交通價值不只是抵達更快，而是可以自由切換北車、東區、信義與中山，讓工作、採買與休閒不需要彼此妥協。",
  },
  {
    label: "文化生活圈",
    title: "華山、SOGO、餐飲名店與綠意散策，同時落在生活半徑之內。",
    body: "它不是單點式機能，而是一整圈成熟而講究的日常。這種便利與質感兼得的城市片段，在台北中心很少見。",
  },
];

const team = [
  ["營造工程", "中鹿營造", "台日精工系統，著重品質與工地節奏。"],
  ["建築設計", "李天鐸建築師", "以新東方格柵語彙形塑辨識度立面。"],
  ["公設美學", "十邑設計 王勝正", "Museum Lobby 概念延展成迎賓與會所氛圍。"],
  ["結構設計", "築遠工程 張盈智", "將高規格耐震與比例美感同步推高。"],
] as const;

const engineering = [
  {
    icon: ShieldCheck,
    title: "SC 鋼骨雙制震",
    body: "22 層地上建築搭配鋼骨與制震系統，將住宅安全感做成真正可被理解的產品價值。",
  },
  {
    icon: Building2,
    title: "高規格基礎工法",
    body: "深開挖、厚連續壁與筏式基礎構成穩定骨架，把豪宅等級的工程標準放進城市核心住宅。",
  },
  {
    icon: Leaf,
    title: "黃金級綠建築目標",
    body: "節能、減廢、水資源與室內環境品質同步推進，讓高端生活不只是好看，也具備長期舒適性。",
  },
];

const infoStrips = [
  {
    eyebrow: "A DA-AN ADDRESS",
    title: "把城市景觀做成整頁主角，後面的段落就該懂得收。",
    body: "因此第三段開始改成更克制的長幅章節。不是把資訊塞滿，而是讓每一段像高級建案型錄中的一頁，仍然保有呼吸與畫面感。",
  },
  {
    eyebrow: "CURATED LIVING",
    title: "從空總、華山、SOGO 到忠孝新生，生活不是機能堆疊，而是品味半徑。",
    body: "這裡的價值不只是捷運近，而是文化、購物、散策與工作動線自然交會，讓住址本身成為生活方式的起點。",
  },
];

export default function TongchuangWingPage({
  property,
  referrer,
}: TongchuangWingPageProps) {
  return (
    <div className="min-h-screen bg-[#e7edf0] text-[#12324a]">
      <section className="relative isolate min-h-screen overflow-hidden bg-[#7eb8d5]">
        <div className="absolute inset-0">
          <div className="absolute inset-0 hidden md:block">
            <Image
              src={firstSectionDesktopImage}
              alt="統創翼城市天際線"
              fill
              priority
              className="object-cover"
              sizes="100vw"
            />
          </div>
          <div className="absolute inset-0 md:hidden">
            <Image
              src={firstSectionMobileImage}
              alt="統創翼城市天際線"
              fill
              priority
              className="object-cover"
              sizes="100vw"
            />
          </div>
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(4,22,36,0.64),rgba(7,40,63,0.38)_32%,rgba(9,27,41,0.42)_70%,rgba(228,239,243,0.72)_100%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.12),transparent_30%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(7,24,36,0.22),transparent_45%,rgba(7,24,36,0.1))]" />
        </div>

        <div className="relative mx-auto flex min-h-screen max-w-7xl flex-col justify-between px-5 pb-10 pt-8 md:px-10 md:pb-14 md:pt-10 lg:px-16">
          <motion.div
            {...fadeUp(0.05)}
            className="flex items-center justify-between text-white/90"
          >
            <div className="text-[0.72rem] uppercase tracking-[0.45em]">
              Phoenix One
            </div>
            <div className="hidden text-[0.68rem] uppercase tracking-[0.4em] md:block">
              Taipei Da-an Landmark Residence
            </div>
          </motion.div>

          <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-end">
            <motion.div {...fadeUp(0.12)} className="max-w-3xl pt-14 md:pt-10">
              <p className="text-[0.78rem] uppercase tracking-[0.45em] text-white/85">
                九皋羽翼 翱翔天際
              </p>
              <h1 className="mt-5 font-serif text-5xl font-light leading-[0.95] text-white drop-shadow-[0_10px_30px_rgba(0,0,0,0.18)] md:text-7xl lg:text-[6.6rem]">
                統創翼
              </h1>
              <p className="mt-6 max-w-2xl text-base leading-7 text-white/90 md:text-lg">
                以大安核心的天際視野開場，讓建築、文化公園與城市流線在同一個畫面裡成立。
                第一眼就該像品牌形象頁，而不是一般房地產列表頁。
              </p>
            </motion.div>

            <motion.div
              {...fadeUp(0.2)}
              className="grid gap-3 self-end md:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3"
            >
              {anchors.map(([label, value]) => (
                <div
                  key={label}
                  className="border border-white/30 bg-white/12 px-4 py-4 backdrop-blur-md"
                >
                  <div className="text-[0.65rem] uppercase tracking-[0.3em] text-white/65">
                    {label}
                  </div>
                  <div className="mt-2 text-sm leading-6 text-white">
                    {value}
                  </div>
                </div>
              ))}
            </motion.div>
          </div>

          <motion.div
            {...fadeUp(0.28)}
            className="grid gap-px overflow-hidden border border-white/25 bg-white/20 backdrop-blur-md md:grid-cols-4"
          >
            {[
              ["地段", "濟南路三段 67 號"],
              ["產品", "35-58 坪 ・ 精奢 2-3 房"],
              ["結構", "SC 鋼骨雙制震"],
              ["專線", "02-2752-8628"],
            ].map(([label, value]) => (
              <div key={label} className="bg-[#0f5f8f]/35 px-5 py-4 text-white">
                <div className="text-[0.65rem] uppercase tracking-[0.28em] text-white/60">
                  {label}
                </div>
                <div className="mt-2 text-sm leading-6 md:text-base">
                  {value}
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      <section className="relative isolate min-h-screen overflow-hidden bg-[#e6ecee]">
        <motion.div {...fadeUp(0.05)} className="absolute inset-0">
          <div className="absolute inset-0 hidden md:block">
            <Image
              src={secondSectionImage.desktop}
              alt="統創翼建築立面"
              fill
              className="object-cover object-center"
              sizes="100vw"
            />
          </div>
          <div className="absolute inset-0 md:hidden">
            <Image
              src={secondSectionImage.mobile}
              alt="統創翼建築立面"
              fill
              className="object-cover object-center"
              sizes="100vw"
            />
          </div>
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02)_36%,rgba(18,38,52,0.08)_100%)]" />
        </motion.div>
      </section>

      <section className="bg-[#edf1f2]">
        {infoStrips.map((strip, index) => (
          <div
            key={strip.title}
            className={index === 0 ? "border-b border-[#18354b]/10" : ""}
          >
            <div className="mx-auto grid max-w-7xl gap-8 px-5 py-14 md:px-10 lg:grid-cols-[0.9fr_1.1fr] lg:px-16 lg:py-20">
              <motion.div {...fadeUp(index * 0.05)}>
                <p className="text-[0.72rem] uppercase tracking-[0.38em] text-[#b58d55]">
                  {strip.eyebrow}
                </p>
              </motion.div>
              <motion.div {...fadeUp(0.08 + index * 0.05)}>
                <h2 className="font-serif text-3xl font-light leading-tight text-[#18354b] md:text-5xl">
                  {strip.title}
                </h2>
                <p className="mt-5 max-w-3xl text-base leading-8 text-[#587185] md:text-lg">
                  {strip.body}
                </p>
              </motion.div>
            </div>
          </div>
        ))}
      </section>

      <section className="bg-[linear-gradient(180deg,#edf1f2_0%,#f5f1eb_100%)]">
        <div className="mx-auto max-w-7xl px-5 py-16 md:px-10 lg:px-16 lg:py-24">
          <div className="mb-12 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-[0.72rem] uppercase tracking-[0.38em] text-[#b58d55]">
                Site Narrative
              </p>
              <h2 className="mt-4 font-serif text-4xl font-light leading-tight text-[#18354b] md:text-6xl">
                留下少量文字，
                <br />
                讓段落仍像一頁一頁的大圖型錄。
              </h2>
            </div>
            <p className="max-w-xl text-base leading-8 text-[#537086] md:text-lg">
              我把中段縮成較少但更完整的敘事模組，避免頁面掉回一般建案資訊站的密度。
              這樣更接近你描述的那種「整頁都像主視覺延伸」的感覺。
            </p>
          </div>

          <div className="grid gap-5 lg:grid-cols-3">
            {siteMoments.map((item, index) => (
              <motion.article
                key={item.title}
                {...fadeUp(index * 0.08)}
                className="min-h-[22rem] border border-[#18354b]/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.92),rgba(228,238,243,0.88))] p-6 shadow-[0_14px_40px_rgba(24,53,75,0.06)]"
              >
                <div className="text-[0.68rem] uppercase tracking-[0.3em] text-[#b58d55]">
                  {item.label}
                </div>
                <h3 className="mt-4 font-serif text-2xl font-light leading-tight text-[#18354b]">
                  {item.title}
                </h3>
                <p className="mt-4 text-sm leading-7 text-[#587185] md:text-base">
                  {item.body}
                </p>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#f3f0ea] py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-5 md:px-10 lg:px-16">
          <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-[0.72rem] uppercase tracking-[0.38em] text-[#b58d55]">
                Engineering Progress
              </p>
            </div>
            <p className="max-w-xl text-base leading-8 text-[#587185] md:text-lg">
              這段沿用其他建案已有的時間軸功能，但換上更貼近本頁的底色與排版節奏，
              讓它像型錄的一個章節，而不是突然切回另一套模板。
            </p>
          </div>
        </div>
        <div className="[&_.section-editorial]:py-0 [&_.editorial-container]:max-w-7xl [&_.editorial-container]:px-5 md:[&_.editorial-container]:px-10 lg:[&_.editorial-container]:px-16 [&_.text-muted-foreground]:text-[#6f8090] [&_.text-foreground]:text-[#18354b] [&_.bg-border]:bg-[#d4dde3] [&_.border-border]:border-[#d4dde3] [&_.bg-background]:bg-[#f3f0ea] [&_.bg-foreground]:bg-[#18354b] [&_.border-foreground]:border-[#18354b] [&_.text-background]:text-[#f3f0ea]">
          <ConstructionTimeline property={property} />
        </div>
      </section>

      <section className="border-y border-[#18354b]/10 bg-[#18354b] text-[#eff5f7]">
        <div className="mx-auto grid max-w-7xl gap-0 lg:grid-cols-[0.92fr_1.08fr]">
          <div className="border-b border-white/10 px-5 py-16 md:px-10 lg:border-b-0 lg:border-r lg:px-16 lg:py-24">
            <motion.div {...fadeUp(0)}>
              <p className="text-[0.72rem] uppercase tracking-[0.38em] text-[#d8bb8b]">
                Project Team
              </p>
              <h2 className="mt-4 font-serif text-4xl font-light leading-tight md:text-6xl">
                專業團隊，
                <br />
                用更沉穩的段落收住信任感。
              </h2>
              <p className="mt-6 max-w-xl text-base leading-8 text-white/72 md:text-lg">
                這裡不再做花俏裝飾，而是像高端簡報一樣，把品牌背書排得乾淨有秩序。
                氣質延續前面兩段，但節奏更內斂。
              </p>
            </motion.div>
          </div>

          <div className="grid gap-px bg-white/10">
            {team.map(([label, name, detail], index) => (
              <motion.div
                key={name}
                {...fadeUp(index * 0.08)}
                className="bg-[#214660] px-5 py-8 md:px-8"
              >
                <div className="text-[0.68rem] uppercase tracking-[0.3em] text-[#d8bb8b]">
                  {label}
                </div>
                <h3 className="mt-3 font-serif text-3xl font-light">{name}</h3>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-white/72 md:text-base">
                  {detail}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#f2f0eb]">
        <div className="mx-auto max-w-7xl px-5 py-18 md:px-10 lg:px-16 lg:py-24">
          <div className="mb-10 max-w-3xl">
            <p className="text-[0.72rem] uppercase tracking-[0.38em] text-[#b58d55]">
              Structure & Sustainability
            </p>
            <h2 className="mt-4 font-serif text-4xl font-light leading-tight text-[#18354b] md:text-6xl">
              把結構、安全與永續，
              <br />
              排成更像精品型錄的方式。
            </h2>
          </div>

          <div className="grid gap-5 lg:grid-cols-3">
            {engineering.map((item, index) => {
              const Icon = item.icon;
              return (
                <motion.article
                  key={item.title}
                  {...fadeUp(index * 0.08)}
                  className="border border-[#18354b]/10 bg-white p-7 shadow-[0_14px_40px_rgba(24,53,75,0.05)]"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#e6edf1] text-[#18354b]">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-5 font-serif text-2xl font-light text-[#18354b]">
                    {item.title}
                  </h3>
                  <p className="mt-4 text-sm leading-7 text-[#587185] md:text-base">
                    {item.body}
                  </p>
                </motion.article>
              );
            })}
          </div>

          <motion.div
            {...fadeUp(0.16)}
            className="mt-10 grid gap-5 lg:grid-cols-[1.05fr_0.95fr]"
          >
            <div className="border border-[#18354b]/10 bg-[#ecf2f5] p-8">
              <div className="text-[0.72rem] uppercase tracking-[0.36em] text-[#b58d55]">
                Property Data
              </div>
              <div className="mt-8 grid gap-y-4 md:grid-cols-2 md:gap-x-8">
                {[
                  ["案名", property.name],
                  ["建設公司", "統創建設開發股份有限公司"],
                  ["基地地址", property.location],
                  ["產品規劃", "35-58 坪 ・ 精奢 2-3 房"],
                  ["結構系統", "SC 鋼骨雙制震"],
                  ["接待中心", "台北市大安區市民大道三段198號7樓"],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    className="border-b border-[#18354b]/10 pb-4"
                  >
                    <div className="text-[0.68rem] uppercase tracking-[0.28em] text-[#a08258]">
                      {label}
                    </div>
                    <div className="mt-2 text-sm leading-6 text-[#18354b] md:text-base">
                      {value}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="border border-[#18354b]/10 bg-[#dfe8ed] p-8 text-[#18354b]">
              <div className="flex items-center gap-3 text-[0.72rem] uppercase tracking-[0.36em] text-[#a08258]">
                <Sparkles className="h-4 w-4" />
                Concierge Contact
              </div>
              <h3 className="mt-5 font-serif text-3xl font-light md:text-4xl">
                預約賞屋與索取資料
              </h3>
              <div className="mt-8 space-y-6">
                <div>
                  <div className="flex items-center gap-2 text-xs uppercase tracking-[0.24em] text-[#6f8090]">
                    <MapPin className="h-3.5 w-3.5" />
                    接待位址
                  </div>
                  <div className="mt-2 text-lg leading-7">
                    台北市大安區市民大道三段198號7樓
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-2 text-xs uppercase tracking-[0.24em] text-[#6f8090]">
                    <Train className="h-3.5 w-3.5" />
                    最近捷運
                  </div>
                  <div className="mt-2 text-lg">{property.nearestMrt}</div>
                </div>
                <div>
                  <div className="text-xs uppercase tracking-[0.24em] text-[#6f8090]">
                    貴賓專線
                  </div>
                  <div className="mt-2 font-serif text-4xl">02-2752-8628</div>
                </div>
                <div className="inline-flex items-center gap-2 text-sm uppercase tracking-[0.2em] text-[#18354b]">
                  35-58 坪 精奢席位
                  <ArrowUpRight className="h-4 w-4" />
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <BookTourCTA property={property} referrer={referrer} />
    </div>
  );
}
