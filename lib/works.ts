export type Work = {
  slug: string
  title: string
  category: '散文' | '新詩' | '小說'
  author: string
  grade: string
  issue: string
  excerpt: string
  image: string
  imageAlt: string
  paragraphs: string[]
}

export const works: Work[] = [
  {
    slug: 'after-the-last-bell',
    title: '我愛東山',
    category: '散文',
    author: '林知夏',
    grade: '高二',
    issue: '第 27 期・2026 春季號',
    excerpt: '我愛東山',
    image: '/images/hero-library.png',
    imageAlt: '雨後圖書館窗邊的閱讀桌',
    paragraphs: [
      '我愛東山我愛東山我愛東山我愛東山我愛東山我愛東山我愛東山我愛東山我愛東山',
      '我愛東山我愛東山我愛東山我愛東山我愛東山我愛東山我愛東山我愛東山我愛東山',
      '我愛東山我愛東山我愛東山我愛東山我愛東山我愛東山我愛東山我愛東山我愛東山',
      '我愛東山我愛東山我愛東山我愛東山我愛東山我愛東山我愛東山我愛東山我愛東山',
      '我愛東山我愛東山我愛東山我愛東山我愛東山我愛東山我愛東山我愛東山我愛東山',
    ],
  },
  {
    slug: 'rainy-window-seat',
    title: '我愛東山',
    category: '新詩',
    author: '陳予安',
    grade: '高一',
    issue: '第 27 期・2026 春季號',
    excerpt: '我愛東山',
    image: '/images/campus-corridor.png',
    imageAlt: '午後光影下安靜的校園走廊',
    paragraphs: ['雨把操場／寫成一張反覆修改的草稿紙', '靠窗的我收集水痕／也收集鐘聲抵達以前／你沒有說完的句子', '風穿過走廊／替每一扇門翻頁', '而青春是一行太長的詩／我們讀得太快／直到離開才想起停頓'],
  },
  {
    slug: 'the-map-in-drawer',
    title: '抽屜裡的那張地圖',
    category: '小說',
    author: '周以澄',
    grade: '高三',
    issue: '第 26 期・2025 冬季號',
    excerpt: '搬教室那天，向遠在最底層的抽屜找到一張手繪地圖，終點標在校園裡不存在的第七棵樹。',
    image: '/images/writing-desk.png',
    imageAlt: '散落著手稿與鉛筆的書桌',
    paragraphs: ['搬教室那天，向遠在最底層的抽屜找到一張地圖。紙已泛黃，折線卻清楚得像昨天才畫上去。', '地圖從舊音樂教室開始，繞過司令台後方的矮牆，最後停在「第七棵樹」。但那一排鳳凰木，無論怎麼數都只有六棵。', '他把地圖收進口袋，決定在畢業典禮以前，找出那棵不存在的樹。也許有些地方，必須等一個人準備離開時，才肯出現。'],
  },
  {
    slug: 'light-on-stairs',
    title: '樓梯轉角的光',
    category: '散文',
    author: '許庭維',
    grade: '高二',
    issue: '第 26 期・2025 冬季號',
    excerpt: '每天經過同一段樓梯，我們卻從沒遇見同一束光。時間用最安靜的方式，提醒我正在長大。',
    image: '/images/campus-corridor.png',
    imageAlt: '校園走廊灑落的午後陽光',
    paragraphs: ['四樓到五樓的轉角有一扇窄窗。冬天三點半，光會正好落在第九階。', '我曾經以為日子都一樣，直到某天發現，那束光已經移到扶手之外。季節沒有通知任何人，就完成了一次交接。', '我們也是這樣長大的吧。在每日相同的鐘聲裡，慢慢成為不同的自己。'],
  },
  {
    slug: 'unnamed-island',
    title: '未命名的島',
    category: '新詩',
    author: '葉子晴',
    grade: '高三',
    issue: '第 25 期・2025 秋季號',
    excerpt: '把沒寄出的信摺成船，教室便成了海。我們都是等待被命名的小島。',
    image: '/images/hero-library.png',
    imageAlt: '窗邊攤開的筆記本與書籍',
    paragraphs: ['把沒寄出的信摺成船／教室便成了海', '我們以沉默測量彼此／在點名簿上／各自擁有一座島', '多年以後／若潮水仍記得方向／請循著墨水淡去的地方來找我'],
  },
  {
    slug: 'night-bus',
    title: '末班公車沒有終點',
    category: '小說',
    author: '吳允禾',
    grade: '高二',
    issue: '第 25 期・2025 秋季號',
    excerpt: '凌晨十一點四十分，一輛從未出現在時刻表上的公車停在校門口。',
    image: '/images/writing-desk.png',
    imageAlt: '舊書與手稿構成的靜物',
    paragraphs: ['凌晨十一點四十分，一輛沒有號碼的公車停在校門口。司機問我：「今天想回到哪一天？」', '車廂裡只有三位乘客，每個人都抱著一件遺失過的東西。我坐到最後一排，想起書包深處那張一直不敢打開的成績單。', '公車緩緩駛離。窗外不是熟悉的街道，而是一間間亮著燈的舊教室。'],
  },
{
    slug: 'night-bus1',
    title: '末班公車沒有終點',
    category: '小說',
    author: '吳允禾',
    grade: '高二',
    issue: '第 25 期・2025 秋季號',
    excerpt: '凌晨十一點四十分，一輛從未出現在時刻表上的公車停在校門口。',
    image: '/images/writing-desk.png',
    imageAlt: '舊書與手稿構成的靜物',
    paragraphs: ['凌晨十一點四十分，一輛沒有號碼的公車停在校門口。司機問我：「今天想回到哪一天？」', '車廂裡只有三位乘客，每個人都抱著一件遺失過的東西。我坐到最後一排，想起書包深處那張一直不敢打開的成績單。', '公車緩緩駛離。窗外不是熟悉的街道，而是一間間亮著燈的舊教室。'],
  },
  {
    slug: 'night-bus2',
    title: '末班公車沒有終點',
    category: '小說',
    author: '吳允禾',
    grade: '高二',
    issue: '第 25 期・2025 秋季號',
    excerpt: '凌晨十一點四十分，一輛從未出現在時刻表上的公車停在校門口。',
    image: '/images/writing-desk.png',
    imageAlt: '舊書與手稿構成的靜物',
    paragraphs: ['凌晨十一點四十分，一輛沒有號碼的公車停在校門口。司機問我：「今天想回到哪一天？」', '車廂裡只有三位乘客，每個人都抱著一件遺失過的東西。我坐到最後一排，想起書包深處那張一直不敢打開的成績單。', '公車緩緩駛離。窗外不是熟悉的街道，而是一間間亮著燈的舊教室。'],
  },
  {
    slug: 'night-bus3',
    title: '末班公車沒有終點',
    category: '小說',
    author: '吳允禾',
    grade: '高二',
    issue: '第 25 期・2025 秋季號',
    excerpt: '凌晨十一點四十分，一輛從未出現在時刻表上的公車停在校門口。',
    image: '/images/writing-desk.png',
    imageAlt: '舊書與手稿構成的靜物',
    paragraphs: ['凌晨十一點四十分，一輛沒有號碼的公車停在校門口。司機問我：「今天想回到哪一天？」', '車廂裡只有三位乘客，每個人都抱著一件遺失過的東西。我坐到最後一排，想起書包深處那張一直不敢打開的成績單。', '公車緩緩駛離。窗外不是熟悉的街道，而是一間間亮著燈的舊教室。'],
  },
  {
    slug: 'night-bus4',
    title: '末班公車沒有終點',
    category: '小說',
    author: '吳允禾',
    grade: '高二',
    issue: '第 25 期・2025 秋季號',
    excerpt: '凌晨十一點四十分，一輛從未出現在時刻表上的公車停在校門口。',
    image: '/images/writing-desk.png',
    imageAlt: '舊書與手稿構成的靜物',
    paragraphs: ['凌晨十一點四十分，一輛沒有號碼的公車停在校門口。司機問我：「今天想回到哪一天？」', '車廂裡只有三位乘客，每個人都抱著一件遺失過的東西。我坐到最後一排，想起書包深處那張一直不敢打開的成績單。', '公車緩緩駛離。窗外不是熟悉的街道，而是一間間亮著燈的舊教室。'],
  },
  {
    slug: 'night-bus5',
    title: '末班公車沒有終點',
    category: '小說',
    author: '吳允禾',
    grade: '高二',
    issue: '第 25 期・2025 秋季號',
    excerpt: '凌晨十一點四十分，一輛從未出現在時刻表上的公車停在校門口。',
    image: '/images/writing-desk.png',
    imageAlt: '舊書與手稿構成的靜物',
    paragraphs: ['凌晨十一點四十分，一輛沒有號碼的公車停在校門口。司機問我：「今天想回到哪一天？」', '車廂裡只有三位乘客，每個人都抱著一件遺失過的東西。我坐到最後一排，想起書包深處那張一直不敢打開的成績單。', '公車緩緩駛離。窗外不是熟悉的街道，而是一間間亮著燈的舊教室。'],
  },
  {
    slug: 'night-bus6',
    title: '末班公車沒有終點',
    category: '小說',
    author: '吳允禾',
    grade: '高二',
    issue: '第 25 期・2025 秋季號',
    excerpt: '凌晨十一點四十分，一輛從未出現在時刻表上的公車停在校門口。',
    image: '/images/writing-desk.png',
    imageAlt: '舊書與手稿構成的靜物',
    paragraphs: ['凌晨十一點四十分，一輛沒有號碼的公車停在校門口。司機問我：「今天想回到哪一天？」', '車廂裡只有三位乘客，每個人都抱著一件遺失過的東西。我坐到最後一排，想起書包深處那張一直不敢打開的成績單。', '公車緩緩駛離。窗外不是熟悉的街道，而是一間間亮著燈的舊教室。'],
  },
  {
    slug: 'night-bus7',
    title: '末班公車沒有終點',
    category: '小說',
    author: '吳允禾',
    grade: '高二',
    issue: '第 25 期・2025 秋季號',
    excerpt: '凌晨十一點四十分，一輛從未出現在時刻表上的公車停在校門口。',
    image: '/images/writing-desk.png',
    imageAlt: '舊書與手稿構成的靜物',
    paragraphs: ['凌晨十一點四十分，一輛沒有號碼的公車停在校門口。司機問我：「今天想回到哪一天？」', '車廂裡只有三位乘客，每個人都抱著一件遺失過的東西。我坐到最後一排，想起書包深處那張一直不敢打開的成績單。', '公車緩緩駛離。窗外不是熟悉的街道，而是一間間亮著燈的舊教室。'],
  },
  {
    slug: 'night-bus8',
    title: '末班公車沒有終點',
    category: '小說',
    author: '吳允禾',
    grade: '高二',
    issue: '第 25 期・2025 秋季號',
    excerpt: '凌晨十一點四十分，一輛從未出現在時刻表上的公車停在校門口。',
    image: '/images/writing-desk.png',
    imageAlt: '舊書與手稿構成的靜物',
    paragraphs: ['凌晨十一點四十分，一輛沒有號碼的公車停在校門口。司機問我：「今天想回到哪一天？」', '車廂裡只有三位乘客，每個人都抱著一件遺失過的東西。我坐到最後一排，想起書包深處那張一直不敢打開的成績單。', '公車緩緩駛離。窗外不是熟悉的街道，而是一間間亮著燈的舊教室。'],
  },
  {
    slug: 'night-bus9',
    title: '末班公車沒有終點',
    category: '小說',
    author: '吳允禾',
    grade: '高二',
    issue: '第 25 期・2025 秋季號',
    excerpt: '凌晨十一點四十分，一輛從未出現在時刻表上的公車停在校門口。',
    image: '/images/fafa.jpg',
    imageAlt: 'fafa',
    paragraphs: ['凌晨十一點四十分，一輛沒有號碼的公車停在校門口。司機問我：「今天想回到哪一天？」', '車廂裡只有三位乘客，每個人都抱著一件遺失過的東西。我坐到最後一排，想起書包深處那張一直不敢打開的成績單。', '公車緩緩駛離。窗外不是熟悉的街道，而是一間間亮著燈的舊教室。'],
  },






]






















export const categories = ['全部', '散文', '新詩', '小說'] as const

export function getWork(slug: string) {
  return works.find((work) => work.slug === slug)
}
