export const slideIn = {
  initial: { opacity: 0, x: 24 },
  animate: { opacity: 1, x: 0 },
  exit:    { opacity: 0, x: -24 },
  transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] as const },
}

export const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.5, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] as const },
  }),
}

export const LEFT_CONTENT = {
  null: {
    eyebrow: '加入 HomeKey',
    headline: '選擇你的\n合作身份',
    desc: '無論你是內容創作者或商案商家，HomeKey 都有專屬方案等你加入。',
    stats: [
      { value: '120+',  label: '合作 KOL' },
      { value: '18+',   label: '精選商案' },
      { value: '18.4%', label: '平均轉換率' },
    ],
  },
  kol: {
    eyebrow: 'KOL 合作計畫',
    headline: '用影響力\n創造收益',
    desc: '推廣頂級商案，每次成交都為你帶來透明可追蹤的佣金收入。',
    stats: [
      { value: 'NT$65k+', label: '月均收益' },
      { value: '18+',     label: '精選商案' },
      { value: '72%',     label: '目標達成率' },
    ],
  },
  merchant: {
    eyebrow: '商家合作計畫',
    headline: '讓 KOL 成為\n你的銷售引擎',
    desc: '精準觸及有消費意願的買家，成效透明，只在成交後支付佣金。',
    stats: [
      { value: '120+',   label: '合作 KOL' },
      { value: '12,400', label: '月均觸及' },
      { value: '6.5%',   label: '成交轉換率' },
    ],
  },
}

export const PLATFORMS      = ['Instagram', 'TikTok', 'Threads', 'Facebook']
export const FOLLOWER_RANGES = ['1萬以下', '1–5萬', '5–20萬', '20–100萬', '100萬以上']
export const CONTENT_TYPES   = ['商品', '生活風格', '財經理財', '旅遊', '美食', '其他']
export const CITIES          = ['台北市', '新北市', '桃園市', '台中市', '台南市', '高雄市', '其他']
export const PROJECT_COUNTS  = ['1 個', '2–3 個', '4–6 個', '7 個以上']
