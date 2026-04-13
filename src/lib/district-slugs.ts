export type DistrictSlugEntry = {
  citySlug: string
  districtSlug: string
}

// Maps city key → district Chinese name → housefeel slugs
const DISTRICT_TABLE: Record<string, Record<string, DistrictSlugEntry>> = {
  taipei: {
    '中正': { citySlug: 'taipei-city', districtSlug: 'zhongzheng-district' },
    '大同': { citySlug: 'taipei-city', districtSlug: 'datong-district' },
    '中山': { citySlug: 'taipei-city', districtSlug: 'zhongshan-district' },
    '松山': { citySlug: 'taipei-city', districtSlug: 'songshan-district' },
    '大安': { citySlug: 'taipei-city', districtSlug: 'daan-district' },
    '萬華': { citySlug: 'taipei-city', districtSlug: 'wanhua-district' },
    '信義': { citySlug: 'taipei-city', districtSlug: 'xinyi-district' },
    '士林': { citySlug: 'taipei-city', districtSlug: 'shilin-district' },
    '北投': { citySlug: 'taipei-city', districtSlug: 'beitou-district' },
    '內湖': { citySlug: 'taipei-city', districtSlug: 'neihu-district' },
    '南港': { citySlug: 'taipei-city', districtSlug: 'nangang-district' },
    '文山': { citySlug: 'taipei-city', districtSlug: 'wenshan-district' },
  },
  'new-taipei': {
    '板橋': { citySlug: 'new-taipei-city', districtSlug: 'banqiao-district' },
    '汐止': { citySlug: 'new-taipei-city', districtSlug: 'xizhi-district' },
    '新店': { citySlug: 'new-taipei-city', districtSlug: 'xindian-district' },
    '中和': { citySlug: 'new-taipei-city', districtSlug: 'zhonghe-district' },
    '永和': { citySlug: 'new-taipei-city', districtSlug: 'yonghe-district' },
    '土城': { citySlug: 'new-taipei-city', districtSlug: 'tucheng-district' },
    '三重': { citySlug: 'new-taipei-city', districtSlug: 'sanchong-district' },
    '蘆洲': { citySlug: 'new-taipei-city', districtSlug: 'luzhou-district' },
    '新莊': { citySlug: 'new-taipei-city', districtSlug: 'xinzhuang-district' },
    '林口': { citySlug: 'new-taipei-city', districtSlug: 'linkou-district' },
    '淡水': { citySlug: 'new-taipei-city', districtSlug: 'tamsui-district' },
    '三峽': { citySlug: 'new-taipei-city', districtSlug: 'sanxia-district' },
    '樹林': { citySlug: 'new-taipei-city', districtSlug: 'shulin-district' },
    '鶯歌': { citySlug: 'new-taipei-city', districtSlug: 'yingge-district' },
    '瑞芳': { citySlug: 'new-taipei-city', districtSlug: 'ruifang-district' },
    '金山': { citySlug: 'new-taipei-city', districtSlug: 'jinshan-district' },
    '萬里': { citySlug: 'new-taipei-city', districtSlug: 'wanli-district' },
    '深坑': { citySlug: 'new-taipei-city', districtSlug: 'shenkeng-district' },
    '石碇': { citySlug: 'new-taipei-city', districtSlug: 'shiding-district' },
    '泰山': { citySlug: 'new-taipei-city', districtSlug: 'taishan-district' },
    '五股': { citySlug: 'new-taipei-city', districtSlug: 'wugu-district' },
    '八里': { citySlug: 'new-taipei-city', districtSlug: 'bali-district' },
  },
  taoyuan: {
    '桃園': { citySlug: 'taoyuan-city', districtSlug: 'taoyuan-district' },
    '中壢': { citySlug: 'taoyuan-city', districtSlug: 'zhongli-district' },
    '平鎮': { citySlug: 'taoyuan-city', districtSlug: 'pingzhen-district' },
    '八德': { citySlug: 'taoyuan-city', districtSlug: 'bade-district' },
    '大溪': { citySlug: 'taoyuan-city', districtSlug: 'daxi-district' },
    '蘆竹': { citySlug: 'taoyuan-city', districtSlug: 'luzhu-district' },
    '龜山': { citySlug: 'taoyuan-city', districtSlug: 'guishan-district' },
    '楊梅': { citySlug: 'taoyuan-city', districtSlug: 'yangmei-district' },
    '大園': { citySlug: 'taoyuan-city', districtSlug: 'dayuan-district' },
    '觀音': { citySlug: 'taoyuan-city', districtSlug: 'guanyin-district' },
  },
  taichung: {
    '中區': { citySlug: 'taichung-city', districtSlug: 'central-district' },
    '東區': { citySlug: 'taichung-city', districtSlug: 'east-district' },
    '南區': { citySlug: 'taichung-city', districtSlug: 'south-district' },
    '西區': { citySlug: 'taichung-city', districtSlug: 'west-district' },
    '北區': { citySlug: 'taichung-city', districtSlug: 'north-district' },
    '西屯': { citySlug: 'taichung-city', districtSlug: 'xitun-district' },
    '南屯': { citySlug: 'taichung-city', districtSlug: 'nantun-district' },
    '北屯': { citySlug: 'taichung-city', districtSlug: 'beitun-district' },
    '豐原': { citySlug: 'taichung-city', districtSlug: 'fengyuan-district' },
    '大里': { citySlug: 'taichung-city', districtSlug: 'dali-district' },
    '太平': { citySlug: 'taichung-city', districtSlug: 'taiping-district' },
    '清水': { citySlug: 'taichung-city', districtSlug: 'qingshui-district' },
    '沙鹿': { citySlug: 'taichung-city', districtSlug: 'shalu-district' },
    '梧棲': { citySlug: 'taichung-city', districtSlug: 'wuqi-district' },
    '龍井': { citySlug: 'taichung-city', districtSlug: 'longjing-district' },
    '大甲': { citySlug: 'taichung-city', districtSlug: 'dajia-district' },
    '后里': { citySlug: 'taichung-city', districtSlug: 'houli-district' },
    '潭子': { citySlug: 'taichung-city', districtSlug: 'tanzi-district' },
  },
  tainan: {
    '東區': { citySlug: 'tainan-city', districtSlug: 'east-district' },
    '南區': { citySlug: 'tainan-city', districtSlug: 'south-district' },
    '北區': { citySlug: 'tainan-city', districtSlug: 'north-district' },
    '中西區': { citySlug: 'tainan-city', districtSlug: 'zhongxi-district' },
    '安平': { citySlug: 'tainan-city', districtSlug: 'anping-district' },
    '永康': { citySlug: 'tainan-city', districtSlug: 'yongkang-district' },
    '仁德': { citySlug: 'tainan-city', districtSlug: 'rende-district' },
    '歸仁': { citySlug: 'tainan-city', districtSlug: 'guiren-district' },
    '新市': { citySlug: 'tainan-city', districtSlug: 'xinshi-district' },
    '安南': { citySlug: 'tainan-city', districtSlug: 'annan-district' },
    '善化': { citySlug: 'tainan-city', districtSlug: 'shanhua-district' },
  },
  kaohsiung: {
    '苓雅': { citySlug: 'kaohsiung-city', districtSlug: 'lingya-district' },
    '前鎮': { citySlug: 'kaohsiung-city', districtSlug: 'qianzhen-district' },
    '三民': { citySlug: 'kaohsiung-city', districtSlug: 'sanmin-district' },
    '左營': { citySlug: 'kaohsiung-city', districtSlug: 'zuoying-district' },
    '鼓山': { citySlug: 'kaohsiung-city', districtSlug: 'gushan-district' },
    '楠梓': { citySlug: 'kaohsiung-city', districtSlug: 'nanzi-district' },
    '鳳山': { citySlug: 'kaohsiung-city', districtSlug: 'fongshan-district' },
    '小港': { citySlug: 'kaohsiung-city', districtSlug: 'siaogang-district' },
    '前金': { citySlug: 'kaohsiung-city', districtSlug: 'qianjin-district' },
    '新興': { citySlug: 'kaohsiung-city', districtSlug: 'xinxing-district' },
    '仁武': { citySlug: 'kaohsiung-city', districtSlug: 'renwu-district' },
    '岡山': { citySlug: 'kaohsiung-city', districtSlug: 'gangshan-district' },
    '路竹': { citySlug: 'kaohsiung-city', districtSlug: 'luzhu-district' },
    '鹽埕': { citySlug: 'kaohsiung-city', districtSlug: 'yancheng-district' },
    '中山': { citySlug: 'kaohsiung-city', districtSlug: 'zhongshan-district' },
  },
  keelung: {
    '中正': { citySlug: 'keelung-city', districtSlug: 'zhongzheng-district' },
    '七堵': { citySlug: 'keelung-city', districtSlug: 'qidu-district' },
    '暖暖': { citySlug: 'keelung-city', districtSlug: 'nuannuan-district' },
    '仁愛': { citySlug: 'keelung-city', districtSlug: 'renai-district' },
    '中山': { citySlug: 'keelung-city', districtSlug: 'zhongshan-district' },
    '安樂': { citySlug: 'keelung-city', districtSlug: 'anle-district' },
    '信義': { citySlug: 'keelung-city', districtSlug: 'xinyi-district' },
  },
}

// Detect city from any token in the label
function detectCityKey(tokens: string[]): string | null {
  const text = tokens.join(' ')
  if (/new\s*taipei|新北/i.test(text)) return 'new-taipei'
  if (/taipei|台北/i.test(text)) return 'taipei'
  if (/taichung|台中/i.test(text)) return 'taichung'
  if (/tainan|台南/i.test(text)) return 'tainan'
  if (/kaohsiung|高雄/i.test(text)) return 'kaohsiung'
  if (/taoyuan|桃園/i.test(text)) return 'taoyuan'
  if (/keelung|基隆/i.test(text)) return 'keelung'
  return null
}

// Maps Chinese city names to city keys (for full-address format like 台北市信義區)
const CITY_NAME_MAP: Record<string, string> = {
  '台北市': 'taipei', '臺北市': 'taipei',
  '新北市': 'new-taipei',
  '桃園市': 'taoyuan',
  '台中市': 'taichung', '臺中市': 'taichung',
  '台南市': 'tainan', '臺南市': 'tainan',
  '高雄市': 'kaohsiung',
  '基隆市': 'keelung',
}

/**
 * Parse a districtLabel like "大安 · 忠孝新生 · Taipei" or "台北市信義區"
 * into a housefeel URL slug pair. Returns null if the district cannot be mapped.
 */
export function parseDistrictLabel(label: string): DistrictSlugEntry | null {
  // Handle full Chinese address format: e.g. "台北市信義區", "新北市板橋區"
  for (const [cityName, cityKey] of Object.entries(CITY_NAME_MAP)) {
    if (label.startsWith(cityName)) {
      const rest = label.slice(cityName.length) // e.g. "信義區"
      const districtName = rest.replace(/[區鄉鎮市]$/, '') // strip suffix
      const entry = DISTRICT_TABLE[cityKey]?.[districtName]
      if (entry) return entry
    }
  }

  const tokens = label.split(/[·•·]/).map(t => t.trim()).filter(Boolean)
  if (tokens.length === 0) return null

  const districtName = tokens[0]
  const cityKey = detectCityKey(tokens)

  // Try city-specific lookup first (handles ambiguous district names like 中山)
  if (cityKey) {
    const entry = DISTRICT_TABLE[cityKey]?.[districtName]
    if (entry) return entry
  }

  // Fall back: search all cities (works for unambiguous district names)
  for (const cityDistrictMap of Object.values(DISTRICT_TABLE)) {
    const entry = cityDistrictMap[districtName]
    if (entry) return entry
  }

  return null
}
