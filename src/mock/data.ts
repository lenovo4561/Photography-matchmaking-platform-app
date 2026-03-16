/**
 * 演示模式（VITE_DEMO=true）专用本地 Mock 数据
 * 所有图片均使用 /static/ 本地资源，不发起任何外部网络请求
 */

// ======================== 摄影师列表 ========================
export const MOCK_PHOTOGRAPHERS = [
  {
    id: 1,
    userId: 1,
    certStatus: 2,
    level: 5,
    canVisit: true,
    canUrgent: true,
    styleTags: '人像写真,小清新,胶片',
    serviceCity: '北京',
    avgScore: 4.9,
    orderCount: 328,
    minPrice: 599,
    bio: '专注人像写真8年，擅长日系小清新与胶片风格，让每张照片都有呼吸感。',
    covers: [
      'https://picsum.photos/seed/wp1/400/260',
      'https://picsum.photos/seed/wp2/400/260',
      'https://picsum.photos/seed/wp3/400/260'
    ],
    user: { id: 1, nickname: '林晓雨', avatar: 'https://i.pravatar.cc/240?img=47', city: '北京' }
  },
  {
    id: 2,
    userId: 2,
    certStatus: 2,
    level: 4,
    canVisit: true,
    canUrgent: false,
    styleTags: '婚礼跟拍,纪实,轻奢',
    serviceCity: '上海',
    avgScore: 4.8,
    orderCount: 215,
    minPrice: 1280,
    bio: '深耕婚礼摄影多年，纪实情感流派，留住你最珍贵的时刻。',
    covers: [
      'https://picsum.photos/seed/ww1/400/260',
      'https://picsum.photos/seed/ww2/400/260',
      'https://picsum.photos/seed/ww3/400/260'
    ],
    user: { id: 2, nickname: '张明远', avatar: 'https://i.pravatar.cc/240?img=11', city: '上海' }
  },
  {
    id: 3,
    userId: 3,
    certStatus: 2,
    level: 4,
    canVisit: false,
    canUrgent: true,
    styleTags: '商业广告,产品,建筑',
    serviceCity: '广州',
    avgScore: 4.7,
    orderCount: 180,
    minPrice: 800,
    bio: '商业摄影师，服务过众多品牌，产品、建筑、企业文化一站搞定。',
    covers: [
      'https://picsum.photos/seed/wc1/400/260',
      'https://picsum.photos/seed/wc2/400/260',
      'https://picsum.photos/seed/we1/400/260'
    ],
    user: { id: 3, nickname: '陈志豪', avatar: 'https://i.pravatar.cc/240?img=12', city: '广州' }
  },
  {
    id: 4,
    userId: 4,
    certStatus: 0,
    level: 5,
    canVisit: true,
    canUrgent: true,
    styleTags: '旅拍,风光,极简',
    serviceCity: '成都',
    avgScore: 4.9,
    orderCount: 412,
    minPrice: 450,
    bio: '行走在路上的摄影师，擅长旅行纪实与风光大片。',
    covers: [
      'https://picsum.photos/seed/wt1/400/260',
      'https://picsum.photos/seed/wt2/400/260',
      'https://picsum.photos/seed/wt3/400/260'
    ],
    user: { id: 4, nickname: '苏沐阳', avatar: 'https://i.pravatar.cc/240?img=48', city: '成都' }
  },
  {
    id: 5,
    userId: 5,
    certStatus: 2,
    level: 3,
    canVisit: true,
    canUrgent: false,
    styleTags: '亲子家庭,儿童,纪实',
    serviceCity: '杭州',
    avgScore: 4.6,
    orderCount: 97,
    minPrice: 680,
    bio: '用镜头记录家庭温情，儿童成长每一个阶段都值得被珍藏。',
    covers: [
      'https://picsum.photos/seed/wf1/400/260',
      'https://picsum.photos/seed/wf2/400/260',
      'https://picsum.photos/seed/wp4/400/260'
    ],
    user: { id: 5, nickname: '周梦琪', avatar: 'https://i.pravatar.cc/240?img=44', city: '杭州' }
  },
  {
    id: 6,
    userId: 6,
    certStatus: 2,
    level: 3,
    canVisit: false,
    canUrgent: false,
    styleTags: '毕业纪念,校园,青春',
    serviceCity: '南京',
    avgScore: 4.7,
    orderCount: 156,
    minPrice: 380,
    bio: '毕业季的定格师，留住青春最美的校园记忆。',
    covers: [
      'https://picsum.photos/seed/wg1/400/260',
      'https://picsum.photos/seed/wg2/400/260',
      'https://picsum.photos/seed/wp3/400/260'
    ],
    user: { id: 6, nickname: '王宇轩', avatar: 'https://i.pravatar.cc/240?img=15', city: '南京' }
  },
  {
    id: 7,
    userId: 7,
    certStatus: 2,
    level: 4,
    canVisit: true,
    canUrgent: true,
    styleTags: '活动会议,企业,演出',
    serviceCity: '深圳',
    avgScore: 4.5,
    orderCount: 263,
    minPrice: 600,
    bio: '活动现场抓拍专家，年会、发布会、演出记录，专业高效。',
    covers: [
      'https://picsum.photos/seed/we1/400/260',
      'https://picsum.photos/seed/we2/400/260',
      'https://picsum.photos/seed/wc1/400/260'
    ],
    user: { id: 7, nickname: '刘思远', avatar: 'https://i.pravatar.cc/240?img=20', city: '深圳' }
  },
  {
    id: 8,
    userId: 8,
    certStatus: 0,
    level: 3,
    canVisit: false,
    canUrgent: false,
    styleTags: '产品拍摄,静物,电商',
    serviceCity: '武汉',
    avgScore: 4.8,
    orderCount: 189,
    minPrice: 350,
    bio: '电商产品摄影精英，让每件商品都散发光芒，提升转化率。',
    covers: [
      'https://picsum.photos/seed/wpr1/400/260',
      'https://picsum.photos/seed/wpr2/400/260',
      'https://picsum.photos/seed/wc2/400/260'
    ],
    user: { id: 8, nickname: '赵佳宁', avatar: 'https://i.pravatar.cc/240?img=25', city: '武汉' }
  },
  {
    id: 9,
    userId: 9,
    certStatus: 2,
    level: 5,
    canVisit: true,
    canUrgent: false,
    styleTags: '人像写真,日系,复古',
    serviceCity: '西安',
    avgScore: 4.9,
    orderCount: 301,
    minPrice: 520,
    bio: '热爱胶片与复古美学，将每次拍摄变成一段难忘的艺术体验。',
    covers: [
      'https://picsum.photos/seed/wp2/400/260',
      'https://picsum.photos/seed/wp4/400/260',
      'https://picsum.photos/seed/wp1/400/260'
    ],
    user: { id: 9, nickname: '吴晴晴', avatar: 'https://i.pravatar.cc/240?img=30', city: '西安' }
  },
  {
    id: 10,
    userId: 10,
    certStatus: 2,
    level: 4,
    canVisit: true,
    canUrgent: false,
    styleTags: '婚礼跟拍,中式,唯美',
    serviceCity: '成都',
    avgScore: 4.7,
    orderCount: 134,
    minPrice: 1500,
    bio: '中式婚礼记录者，传统美学与现代叙事完美融合。',
    covers: [
      'https://picsum.photos/seed/ww2/400/260',
      'https://picsum.photos/seed/ww3/400/260',
      'https://picsum.photos/seed/wf1/400/260'
    ],
    user: { id: 10, nickname: '何子俊', avatar: 'https://i.pravatar.cc/240?img=35', city: '成都' }
  },
  {
    id: 11,
    userId: 11,
    certStatus: 0,
    level: 2,
    canVisit: false,
    canUrgent: true,
    styleTags: '旅拍,人文,纪实',
    serviceCity: '重庆',
    avgScore: 4.6,
    orderCount: 78,
    minPrice: 400,
    bio: '穿梭城市与山野间的视觉记录者，人文温度是我的拍摄核心。',
    covers: [
      'https://picsum.photos/seed/wt2/400/260',
      'https://picsum.photos/seed/wt3/400/260',
      'https://picsum.photos/seed/we2/400/260'
    ],
    user: { id: 11, nickname: '郑欣悦', avatar: 'https://i.pravatar.cc/240?img=36', city: '重庆' }
  },
  {
    id: 12,
    userId: 12,
    certStatus: 2,
    level: 5,
    canVisit: true,
    canUrgent: true,
    styleTags: '商业广告,时尚,室内',
    serviceCity: '北京',
    avgScore: 4.8,
    orderCount: 224,
    minPrice: 900,
    bio: '时尚商业视觉创作者，多家知名品牌御用摄影师。',
    covers: [
      'https://picsum.photos/seed/wc2/400/260',
      'https://picsum.photos/seed/wc1/400/260',
      'https://picsum.photos/seed/wpr1/400/260'
    ],
    user: { id: 12, nickname: '孟浩然', avatar: 'https://i.pravatar.cc/240?img=37', city: '北京' }
  }
]

// ======================== 套餐列表 ========================
export const MOCK_SERVICES = [
  {
    id: 1,
    photographerId: 1,
    title: '日系清新写真套餐',
    description: '2小时外景拍摄，50张精修，含服装造型指导',
    price: 599,
    duration: 120,
    saleCount: 86,
    coverImage: 'https://picsum.photos/seed/wp1/400/260',
    photographer: { id: 1, user: { nickname: '林晓雨', avatar: 'https://i.pravatar.cc/240?img=47' } }
  },
  {
    id: 2,
    photographerId: 2,
    title: '婚礼全程纪实套餐',
    description: '10小时婚礼跟拍，500张精选，含仪式与宴席',
    price: 3800,
    duration: 600,
    saleCount: 42,
    coverImage: 'https://picsum.photos/seed/ww1/400/260',
    photographer: { id: 2, user: { nickname: '张明远', avatar: 'https://i.pravatar.cc/240?img=11' } }
  },
  {
    id: 3,
    photographerId: 3,
    title: '商业产品拍摄套餐',
    description: '半天产品棚拍，30件商品，白底+场景图各一套',
    price: 1200,
    duration: 240,
    saleCount: 63,
    coverImage: 'https://picsum.photos/seed/wc1/400/260',
    photographer: { id: 3, user: { nickname: '陈志豪', avatar: 'https://i.pravatar.cc/240?img=12' } }
  },
  {
    id: 4,
    photographerId: 4,
    title: '旅行纪实写真套餐',
    description: '半天外景随拍，60张精修，真实记录旅途故事',
    price: 680,
    duration: 240,
    saleCount: 118,
    coverImage: 'https://picsum.photos/seed/wt1/400/260',
    photographer: { id: 4, user: { nickname: '苏沐阳', avatar: 'https://i.pravatar.cc/240?img=48' } }
  },
  {
    id: 5,
    photographerId: 5,
    title: '亲子家庭温情套餐',
    description: '1.5小时家庭外景，40张精修，留存珍贵亲情瞬间',
    price: 880,
    duration: 90,
    saleCount: 35,
    coverImage: 'https://picsum.photos/seed/wf1/400/260',
    photographer: { id: 5, user: { nickname: '周梦琪', avatar: 'https://i.pravatar.cc/240?img=44' } }
  },
  {
    id: 6,
    photographerId: 6,
    title: '毕业季校园纪念套餐',
    description: '2小时校园拍摄，60张精修，毕业证照+外景合拍',
    price: 480,
    duration: 120,
    saleCount: 207,
    coverImage: 'https://picsum.photos/seed/wg1/400/260',
    photographer: { id: 6, user: { nickname: '王宇轩', avatar: 'https://i.pravatar.cc/240?img=15' } }
  }
]

// ======================== 作品集列表（按分类） ========================
const makePortfolio = (
  id: string | number,
  title: string,
  coverImage: string,
  likeCount: number,
  category: string,
  photographerId: number,
  nickname: string,
  avatarIdx: number,
  accessType = 'public',
  price = 0
) => ({
  id,
  title,
  coverImage,
  likeCount,
  isLiked: false,
  category,
  accessType,
  price,
  photographer: {
    id: photographerId,
    user: { nickname, avatar: `https://i.pravatar.cc/240?img=${avatarIdx}` }
  }
})

export const MOCK_PORTFOLIOS_ALL = [
  makePortfolio('p1', '清晨光影写真', 'https://picsum.photos/seed/wp1/400/260', 328, 'portrait', 1, '林晓雨', 1),
  makePortfolio('p2', '草坪婚礼现场', 'https://picsum.photos/seed/ww1/400/260', 689, 'wedding', 2, '张明远', 2),
  makePortfolio('p3', '品牌宣传大片', 'https://picsum.photos/seed/wc1/400/260', 287, 'commercial', 3, '陈志豪', 3),
  makePortfolio('p4', '旅途山野纪实', 'https://picsum.photos/seed/wt1/400/260', 423, 'travel', 4, '苏沐阳', 4),
  makePortfolio('p5', '亲子海边时光', 'https://picsum.photos/seed/wf1/400/260', 312, 'family', 5, '周梦琪', 5),
  makePortfolio('p6', '毕业季最后一课', 'https://picsum.photos/seed/wg1/400/260', 556, 'graduation', 6, '王宇轩', 6),
  makePortfolio('p7', '年会活动精彩瞬间', 'https://picsum.photos/seed/we1/400/260', 198, 'event', 7, '刘思远', 7),
  makePortfolio('p8', '电商爆款产品图', 'https://picsum.photos/seed/wpr1/400/260', 274, 'product', 8, '赵佳宁', 8),
  makePortfolio(
    'p9',
    '日系复古人像',
    'https://picsum.photos/seed/wp2/400/260',
    441,
    'portrait',
    9,
    '吴晴晴',
    9,
    'paid',
    99
  ),
  makePortfolio('p10', '中式传统婚礼', 'https://picsum.photos/seed/ww2/400/260', 318, 'wedding', 10, '何子俊', 10),
  makePortfolio('p11', '城市人文旅拍', 'https://picsum.photos/seed/wt2/400/260', 367, 'travel', 11, '郑欣悦', 11),
  makePortfolio(
    'p12',
    '时尚商业大图',
    'https://picsum.photos/seed/wc2/400/260',
    509,
    'commercial',
    12,
    '孟浩然',
    12,
    'paid',
    199
  )
]

export const MOCK_PORTFOLIOS_BY_CATEGORY: Record<string, any[]> = {
  all: MOCK_PORTFOLIOS_ALL,
  portrait: [
    makePortfolio('m1', '清晨光影写真', 'https://picsum.photos/seed/wp1/400/260', 328, 'portrait', 1, '林晓雨', 1),
    makePortfolio('m2', '黑白人文肖像', 'https://picsum.photos/seed/wp2/400/260', 512, 'portrait', 9, '吴晴晴', 9),
    makePortfolio(
      'm3',
      '日系通透风格',
      'https://picsum.photos/seed/wp3/400/260',
      276,
      'portrait',
      1,
      '林晓雨',
      1,
      'paid',
      99
    ),
    makePortfolio('m4', '复古胶片写真', 'https://picsum.photos/seed/wp4/400/260', 194, 'portrait', 9, '吴晴晴', 9),
    makePortfolio('m5', '蓝调室内人像', 'https://picsum.photos/seed/wp1/400/260', 401, 'portrait', 12, '孟浩然', 12),
    makePortfolio('m6', '自然光棚拍', 'https://picsum.photos/seed/wp3/400/260', 233, 'portrait', 1, '林晓雨', 1)
  ],
  wedding: [
    makePortfolio('w1', '草坪婚礼现场', 'https://picsum.photos/seed/ww1/400/260', 689, 'wedding', 2, '张明远', 2),
    makePortfolio(
      'w2',
      '海边誓言婚纱',
      'https://picsum.photos/seed/ww2/400/260',
      774,
      'wedding',
      10,
      '何子俊',
      10,
      'paid',
      299
    ),
    makePortfolio('w3', '宴会厅浪漫瞬间', 'https://picsum.photos/seed/ww3/400/260', 456, 'wedding', 2, '张明远', 2),
    makePortfolio('w4', '中式传统婚礼', 'https://picsum.photos/seed/ww1/400/260', 318, 'wedding', 10, '何子俊', 10),
    makePortfolio('w5', '新娘特写细节', 'https://picsum.photos/seed/ww2/400/260', 522, 'wedding', 2, '张明远', 2),
    makePortfolio(
      'w6',
      '森系外景婚纱',
      'https://picsum.photos/seed/ww3/400/260',
      411,
      'wedding',
      10,
      '何子俊',
      10,
      'paid',
      199
    )
  ],
  commercial: [
    makePortfolio('c1', '品牌宣传大片', 'https://picsum.photos/seed/wc1/400/260', 287, 'commercial', 3, '陈志豪', 3),
    makePortfolio('c2', '高端办公空间', 'https://picsum.photos/seed/wc2/400/260', 193, 'commercial', 12, '孟浩然', 12),
    makePortfolio(
      'c3',
      '时尚杂志风格',
      'https://picsum.photos/seed/wc1/400/260',
      364,
      'commercial',
      3,
      '陈志豪',
      3,
      'paid',
      399
    ),
    makePortfolio('c4', '企业形象拍摄', 'https://picsum.photos/seed/wc2/400/260', 218, 'commercial', 12, '孟浩然', 12),
    makePortfolio(
      'c5',
      '奢侈品广告大图',
      'https://picsum.photos/seed/wc1/400/260',
      476,
      'commercial',
      3,
      '陈志豪',
      3,
      'paid',
      599
    )
  ],
  family: [
    makePortfolio('f1', '亲子海边时光', 'https://picsum.photos/seed/wf1/400/260', 312, 'family', 5, '周梦琪', 5),
    makePortfolio('f2', '公园家庭漫步', 'https://picsum.photos/seed/wf2/400/260', 245, 'family', 5, '周梦琪', 5),
    makePortfolio('f3', '百天宝宝写真', 'https://picsum.photos/seed/wf1/400/260', 489, 'family', 5, '周梦琪', 5),
    makePortfolio('f4', '三口之家温馨记录', 'https://picsum.photos/seed/wf2/400/260', 178, 'family', 5, '周梦琪', 5)
  ],
  graduation: [
    makePortfolio('g1', '毕业季最后一课', 'https://picsum.photos/seed/wg1/400/260', 556, 'graduation', 6, '王宇轩', 6),
    makePortfolio('g2', '校园樱花道告别', 'https://picsum.photos/seed/wg2/400/260', 423, 'graduation', 6, '王宇轩', 6),
    makePortfolio('g3', '学士服定格时刻', 'https://picsum.photos/seed/wg1/400/260', 367, 'graduation', 6, '王宇轩', 6),
    makePortfolio('g4', '宿舍闺蜜大合拍', 'https://picsum.photos/seed/wg2/400/260', 291, 'graduation', 6, '王宇轩', 6)
  ],
  travel: [
    makePortfolio('t1', '旅途山野纪实', 'https://picsum.photos/seed/wt1/400/260', 423, 'travel', 4, '苏沐阳', 4),
    makePortfolio('t2', '城市人文旅拍', 'https://picsum.photos/seed/wt2/400/260', 367, 'travel', 11, '郑欣悦', 11),
    makePortfolio('t3', '古镇慢时光', 'https://picsum.photos/seed/wt3/400/260', 298, 'travel', 4, '苏沐阳', 4),
    makePortfolio('t4', '海岛阳光假期', 'https://picsum.photos/seed/wt2/400/260', 512, 'travel', 11, '郑欣悦', 11)
  ],
  event: [
    makePortfolio('e1', '年会活动精彩瞬间', 'https://picsum.photos/seed/we1/400/260', 198, 'event', 7, '刘思远', 7),
    makePortfolio('e2', '产品发布会现场', 'https://picsum.photos/seed/we2/400/260', 276, 'event', 7, '刘思远', 7),
    makePortfolio('e3', '演唱会舞台光影', 'https://picsum.photos/seed/we1/400/260', 441, 'event', 7, '刘思远', 7)
  ],
  product: [
    makePortfolio('pr1', '电商爆款产品图', 'https://picsum.photos/seed/wpr1/400/260', 274, 'product', 8, '赵佳宁', 8),
    makePortfolio('pr2', '咖啡品牌静物', 'https://picsum.photos/seed/wpr2/400/260', 348, 'product', 8, '赵佳宁', 8),
    makePortfolio('pr3', '服装平铺细节', 'https://picsum.photos/seed/wpr1/400/260', 193, 'product', 8, '赵佳宁', 8)
  ]
}

// ======================== Banner ========================
export const MOCK_BANNERS = [
  { image: 'https://picsum.photos/seed/banner1/750/300', title: '婚礼跟拍 · 见证最美时刻' },
  { image: 'https://picsum.photos/seed/banner2/750/300', title: '专业写真 · 定格美好瞬间' },
  { image: 'https://picsum.photos/seed/banner3/750/300', title: '商业拍摄 · 让产品更出彩' }
]

// ======================== 分类 ========================
export const MOCK_CATEGORIES = [
  { key: 'portrait', image: 'https://picsum.photos/seed/japanese-portrait/400/260', label: '日系清新' },
  { key: 'wedding', image: 'https://picsum.photos/seed/european-wedding/400/260', label: '欧美婚礼' },
  { key: 'commercial', image: 'https://picsum.photos/seed/vintage-fashion/400/260', label: '复古胶片' },
  { key: 'family', image: 'https://picsum.photos/seed/fresh-family/400/260', label: '小清新' },
  { key: 'graduation', image: 'https://picsum.photos/seed/campus-youth/400/260', label: '校园青春' },
  { key: 'travel', image: 'https://picsum.photos/seed/mori-travel/400/260', label: '森系旅拍' },
  { key: 'event', image: 'https://picsum.photos/seed/hongkong-night/400/260', label: '港风夜景' },
  { key: 'product', image: 'https://picsum.photos/seed/korean-minimal/400/260', label: '韩系极简' }
]

// ======================== 评价列表 ========================
export const MOCK_REVIEWS = [
  {
    id: 1,
    orderId: 1,
    score: 5,
    content: '拍摄非常专业，细节处理到位，照片质感超出预期，强烈推荐！',
    createdAt: '2024-11-15',
    user: { nickname: '小雅', avatar: 'https://i.pravatar.cc/240?img=44' }
  },
  {
    id: 2,
    orderId: 2,
    score: 5,
    content: '摄影师沟通很顺畅，拍摄过程愉快，后期修图很精心。',
    createdAt: '2024-10-28',
    user: { nickname: '晨曦', avatar: 'https://i.pravatar.cc/240?img=15' }
  },
  {
    id: 3,
    orderId: 3,
    score: 4,
    content: '整体满意，照片风格符合预期，下次还会选择这位摄影师。',
    createdAt: '2024-09-10',
    user: { nickname: '阿杰', avatar: 'https://i.pravatar.cc/240?img=20' }
  }
]

// ======================== 演示用户 ========================
export const MOCK_USER = {
  id: 1001,
  phone: '13800138000',
  nickname: '演示用户',
  avatar: 'https://i.pravatar.cc/240?img=47',
  city: '北京',
  currentRole: 'user',
  realnameStatus: 1,
  isAdmin: 0,
  accessToken: 'demo-token-2024',
  refreshToken: 'demo-refresh-token-2024',
  isVip: false,
  photographer: null
}

// ======================== 消息会话 ========================
export const MOCK_SESSIONS = [
  {
    id: 'session1',
    targetUser: { id: 1, nickname: '林晓雨', avatar: 'https://i.pravatar.cc/240?img=47' },
    lastMessage: { content: '您好，我想询问一下写真套餐的详情', createdAt: '2024-11-20 14:30' },
    unreadCount: 0
  },
  {
    id: 'session2',
    targetUser: { id: 2, nickname: '张明远', avatar: 'https://i.pravatar.cc/240?img=11' },
    lastMessage: { content: '好的，档期已为您预留，期待合作！', createdAt: '2024-11-18 09:15' },
    unreadCount: 1
  }
]
