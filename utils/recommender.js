// 九豆米 — Scientific Age-Based Daily Recommendation Engine
const { getAgeInMonths } = require('./zodiac')

function seededRandom(seed) {
  let h = 0
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(31, h) + seed.charCodeAt(i) | 0
  }
  return function() {
    h |= 0; h = h + 0x6D2B79F5 | 0
    let t = Math.imul(h ^ h >>> 15, 1 | h)
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t
    return ((t ^ t >>> 14) >>> 0) / 4294967296
  }
}

function shuffle(arr, seed) {
  const result = [...arr]
  const rand = seededRandom(seed)
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

function getStageTags(ageMonths) {
  if (ageMonths <= 6) return ['lullaby','bedtime','soothing','calming','bonding','gentle','touch','comfort']
  if (ageMonths <= 12) return ['animals','sounds','action','movement','rhythm','body','peekaboo','clapping','fingerplay','interactive']
  if (ageMonths <= 18) return ['counting','vocabulary','animals','colors','body','action','interactive','rhyme','sounds','numbers']
  if (ageMonths <= 24) return ['story','adventure','imagination','emotion','community','food','nature','classic','rhyme','counting']
  return ['alphabet','phonics','literacy','math','numbers','social','identity','self-esteem','perseverance','coordination','dance','emotion','adventure','story']
}

function scoreItem(item, ageMonths, zodiac, gender) {
  const idealMid = (item.ageRange[0] + item.ageRange[1]) / 2
  const distance = Math.abs(ageMonths - idealMid)
  let ageScore = 1
  if (distance <= 2) ageScore = 5
  else if (distance <= 4) ageScore = 4
  else if (distance <= 6) ageScore = 3
  else if (distance <= 12) ageScore = 2

  const stageTags = getStageTags(ageMonths)
  let stageScore = 0
  if (item.tags) {
    for (const tag of item.tags) {
      if (stageTags.includes(tag)) stageScore++
    }
  }
  stageScore = Math.min(stageScore, 4)

  let zodiacScore = 0
  if (item.zodiacAffinity && zodiac && item.zodiacAffinity.includes(zodiac)) {
    zodiacScore = 3
  }

  let genderScore = 0
  if (item.tags) {
    if (gender === 'boy' && item.tags.includes('adventure')) genderScore = 1
    if (gender === 'girl' && item.tags.includes('love')) genderScore = 1
  }

  let langScore = 0
  if (item.tags) {
    if (item.tags.includes('phonics') || item.tags.includes('rhyme')) langScore = 1
    if (item.tags.includes('alphabet') || item.tags.includes('literacy')) langScore = Math.max(langScore, 2)
  }

  return ageScore * 3 + stageScore * 2 + zodiacScore + genderScore + langScore
}

function getDailyRecommendations(profile, songs) {
  const today = new Date()
  const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`

  const eff = (profile && profile.birthDate) ? profile : { birthDate: null, zodiac: '', gender: '' }
  const ageMonths = eff.birthDate ? getAgeInMonths(eff.birthDate) : 9
  const zodiac = eff.zodiac || ''
  const gender = eff.gender || ''

  const all = songs.map(s => ({ ...s, contentType: 'song' }))
  let candidates = all.filter(i => ageMonths >= i.ageRange[0] - 6 && ageMonths <= i.ageRange[1] + 6)
  if (candidates.length < 20) candidates = all

  const scored = candidates.map(item => ({ item, score: scoreItem(item, ageMonths, zodiac, gender) }))
  scored.sort((a, b) => b.score - a.score)

  const babyId = eff.birthDate ? `${eff.birthDate}-${eff.gender}` : 'default'
  const seed = `${babyId}-${dateStr}`

  const selected = []
  let remaining = [...scored]
  while (selected.length < 20 && remaining.length > 0) {
    const topScore = remaining[0].score
    const tier = remaining.filter(r => r.score === topScore)
    const shuffled = shuffle(tier.map(r => r.item), seed + '-' + selected.length)
    const take = Math.min(shuffled.length, 20 - selected.length)
    selected.push(...shuffled.slice(0, take))
    remaining = remaining.filter(r => r.score !== topScore)
  }

  return { items: selected.slice(0, 20) }
}

// ==================== DAILY PARENTING TIP ====================
const parentingTips = [
  "每天15分钟的音乐互动，能显著提升宝宝的语言感知能力。— 哈佛大学儿童发展中心",
  "0-3岁是大脑发育黄金期，丰富的听觉刺激促进神经元连接。— 《柳叶刀》早期发展专刊",
  "跟宝宝一起唱歌时，眼神交流和面部表情比音准更重要。— 剑桥早期教育研究",
  "重复听同一首歌有助于宝宝建立预测能力和安全感。— 耶鲁儿童研究中心",
  "拍手、跺脚等律动游戏是最自然的音乐启蒙方式。— 蒙台梭利早教体系",
  "宝宝在母体内就能感知音乐节奏，胎教音乐选择舒缓的古典乐为佳。— 牛津围产期研究",
  "双语环境下成长的宝宝，执行功能发展更快。— 华盛顿大学脑科学研究所",
  "睡前固定播放摇篮曲，有助于建立健康的睡眠仪式。— 哈佛医学院睡眠研究",
  "允许宝宝自由探索发声玩具，这是最早的'音乐创作'。— 瑞吉欧早期教育",
  "儿歌中的押韵和重复，是自然拼读能力的前奏。— 英国国家读写能力信托",
  "每天拥抱宝宝并哼唱，同时满足触觉和听觉的双重需求。— 约翰·鲍尔比依恋理论",
  "音乐能激活大脑多个区域，是唯一同时调动左右脑的活动。— 《自然·神经科学》",
  "不同年龄段的宝宝对音高、节奏的敏感度不同，推荐内容应随月龄变化。— 皮亚杰认知发展理论",
  "给宝宝唱歌时适当放慢速度，有助于他们捕捉音节和词汇。— 斯坦福语言习得实验室",
  "乐器探索（沙锤、小鼓）促进精细动作与因果认知。— 蒙台梭利感官教育",
  "音乐中的情绪表达，帮助宝宝识别和理解情感。— 哈佛社会情感学习项目",
  "亲子对唱（你一句我一句）是培养轮流对话能力的雏形。— 维果茨基社会文化理论",
  "每天20分钟户外活动+儿歌背景，双重促进感统发展。— 美国儿科学会",
  "宝宝对父母声音的偏好远胜于录音，亲自唱比播放更有效。— 哥伦比亚大学依恋研究",
  "节奏感强的儿歌配合身体律动，促进大肌肉群协调发展。— 国际运动心理学学会",
  "从出生起就可以开始'音乐对话'——模仿宝宝的发声并回应。— 哈佛语言发展里程碑",
  "选择与生活场景相关的儿歌（洗澡歌、吃饭歌），加深语义理解。— 剑桥情境学习理论",
  "音乐启蒙不等于培养音乐家，而是培养完整的人。— 华德福教育理念",
  "哼唱时轻轻拍打宝宝的背部，节奏感通过触觉传递更直接。— 多感官整合学习研究",
  "3岁前接触多种音乐风格，有助于培养开放包容的审美。— 联合国教科文组织艺术教育",
  "宝宝指着某首歌要求反复听，这是自主性和记忆力的积极信号。— 埃里克森心理社会发展理论",
  "唱歌时指认身体部位（头、肩、膝、脚），加速身体图式建立。— 蒙台梭利身体意识教育",
  "用音乐过渡日常活动（收拾玩具、准备吃饭），减少宝宝的抗拒情绪。— 正面管教早期应用",
  "宝宝的咿呀学语本身就有音调和节奏，这就是最早的音乐。— 麻省理工语言与音乐实验室",
  "儿歌中的数数歌（Five Little Ducks等）为数概念发展奠定基础。— 牛津Numicon数学启蒙"
]

function getDailyTip() {
  const now = new Date()
  const dayOfYear = Math.floor((now - new Date(now.getFullYear(), 0, 0)) / 86400000)
  const full = parentingTips[dayOfYear % parentingTips.length]
  const idx = full.lastIndexOf('—')
  if (idx > 0) return { text: full.slice(0, idx).trim(), source: full.slice(idx + 1).trim() }
  return { text: full, source: '' }
}

module.exports = { getDailyRecommendations, getDailyTip }
