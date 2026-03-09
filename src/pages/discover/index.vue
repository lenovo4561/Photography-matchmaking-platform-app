<route lang="json5">
{
  layout: 'foot',
  style: {
    navigationBarTitleText: '发现',
    navigationBarBackgroundColor: '#ffffff',
    navigationBarTextStyle: 'black'
  }
}
</route>

<template>
  <view class="discover-page">
    <!-- 顶部筛选 -->
    <view class="filter-bar">
      <scroll-view scroll-x class="filter-scroll">
        <view
          v-for="cat in categories"
          :key="cat.key"
          class="filter-item"
          :class="{ active: activeCategory === cat.key }"
          @click="selectCategory(cat.key)"
        >
          {{ cat.label }}
        </view>
      </scroll-view>
    </view>

    <!-- 瀑布流作品 -->
    <scroll-view scroll-y class="portfolio-scroll" @scrolltolower="loadMore">
      <waterfall class="waterfall">
        <cell v-for="item in portfolioList" :key="item.id">
          <view class="portfolio-card" @click="goDetail(item.id)">
            <image
              :src="item.coverImage || '/static/default-cover.png'"
              mode="widthFix"
              class="portfolio-img"
              @load="onImgLoad"
            />
            <view class="card-body">
              <text class="card-title">{{ item.title }}</text>
              <view class="card-meta">
                <view class="author" @click.stop="goPhotographer(item.photographer?.id)">
                  <image
                    :src="item.photographer?.user?.avatar || '/static/default-avatar.png'"
                    mode="aspectFill"
                    class="author-avatar"
                  />
                  <text class="author-name">{{ item.photographer?.user?.nickname }}</text>
                </view>
                <view class="card-actions">
                  <text class="like-btn" @click.stop="toggleLike(item)">
                    {{ item.isLiked ? '❤️' : '🤍' }} {{ item.likeCount }}
                  </text>
                </view>
              </view>
              <view v-if="item.accessType !== 'public'" class="lock-badge">
                🔒 {{ item.accessType === 'paid' ? `¥${item.price}` : '私密' }}
              </view>
            </view>
          </view>
        </cell>
      </waterfall>

      <view class="loading-more" v-if="loadingMore">加载中...</view>
      <view class="no-more" v-if="noMore">— 没有更多了 —</view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { getPortfolioListApi, likePortfolioApi } from '@/api/photoApi'

const activeCategory = ref('all')
const portfolioList = ref<any[]>([])
const page = ref(1)
const loadingMore = ref(false)
const noMore = ref(false)

const categories = [
  { key: 'all', label: '全部' },
  { key: 'portrait', label: '人像写真' },
  { key: 'wedding', label: '婚礼婚纱' },
  { key: 'commercial', label: '商业广告' },
  { key: 'family', label: '亲子家庭' },
  { key: 'graduation', label: '毕业纪念' },
  { key: 'travel', label: '旅行纪实' },
  { key: 'event', label: '活动演出' },
  { key: 'product', label: '产品静物' }
]

// ========== 按分类分组的演示图片数据 ==========
const mockMap: Record<string, any[]> = {
  portrait: [
    {
      id: 'm1',
      title: '清晨光影写真',
      coverImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop',
      likeCount: 328,
      isLiked: false,
      accessType: 'public',
      photographer: {
        id: 1,
        user: {
          nickname: '林小鹿',
          avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=80&auto=format&fit=crop'
        }
      }
    },
    {
      id: 'm2',
      title: '黑白人文肖像',
      coverImage: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400&auto=format&fit=crop',
      likeCount: 512,
      isLiked: false,
      accessType: 'public',
      photographer: {
        id: 2,
        user: {
          nickname: '陈阳光',
          avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=80&auto=format&fit=crop'
        }
      }
    },
    {
      id: 'm3',
      title: '日系通透风格',
      coverImage: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&auto=format&fit=crop',
      likeCount: 276,
      isLiked: false,
      accessType: 'paid',
      price: 99,
      photographer: {
        id: 3,
        user: {
          nickname: '木子摄影',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&auto=format&fit=crop'
        }
      }
    },
    {
      id: 'm4',
      title: '复古胶片写真',
      coverImage: 'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=400&auto=format&fit=crop',
      likeCount: 194,
      isLiked: false,
      accessType: 'public',
      photographer: {
        id: 4,
        user: {
          nickname: '叶青Studio',
          avatar: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=80&auto=format&fit=crop'
        }
      }
    },
    {
      id: 'm5',
      title: '蓝调室内人像',
      coverImage: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&auto=format&fit=crop',
      likeCount: 401,
      isLiked: false,
      accessType: 'public',
      photographer: {
        id: 5,
        user: {
          nickname: '光影师傅',
          avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&auto=format&fit=crop'
        }
      }
    },
    {
      id: 'm6',
      title: '自然光棚拍',
      coverImage: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&auto=format&fit=crop',
      likeCount: 233,
      isLiked: false,
      accessType: 'public',
      photographer: {
        id: 1,
        user: {
          nickname: '林小鹿',
          avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=80&auto=format&fit=crop'
        }
      }
    }
  ],
  wedding: [
    {
      id: 'm7',
      title: '草坪婚礼现场',
      coverImage: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=400&auto=format&fit=crop',
      likeCount: 689,
      isLiked: false,
      accessType: 'public',
      photographer: {
        id: 6,
        user: {
          nickname: '婚礼定格',
          avatar: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=80&auto=format&fit=crop'
        }
      }
    },
    {
      id: 'm8',
      title: '海边誓言婚纱',
      coverImage: 'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=400&auto=format&fit=crop',
      likeCount: 774,
      isLiked: false,
      accessType: 'paid',
      price: 299,
      photographer: {
        id: 7,
        user: {
          nickname: '一诺摄影',
          avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&auto=format&fit=crop'
        }
      }
    },
    {
      id: 'm9',
      title: '宴会厅浪漫瞬间',
      coverImage: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=400&auto=format&fit=crop',
      likeCount: 456,
      isLiked: false,
      accessType: 'public',
      photographer: {
        id: 6,
        user: {
          nickname: '婚礼定格',
          avatar: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=80&auto=format&fit=crop'
        }
      }
    },
    {
      id: 'm10',
      title: '中式传统婚礼',
      coverImage: 'https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=400&auto=format&fit=crop',
      likeCount: 318,
      isLiked: false,
      accessType: 'public',
      photographer: {
        id: 8,
        user: {
          nickname: '喜事影像',
          avatar: 'https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?w=80&auto=format&fit=crop'
        }
      }
    },
    {
      id: 'm11',
      title: '新娘特写细节',
      coverImage: 'https://images.unsplash.com/photo-1507504031003-b417219a0fde?w=400&auto=format&fit=crop',
      likeCount: 522,
      isLiked: false,
      accessType: 'public',
      photographer: {
        id: 7,
        user: {
          nickname: '一诺摄影',
          avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&auto=format&fit=crop'
        }
      }
    },
    {
      id: 'm12',
      title: '森系外景婚纱',
      coverImage: 'https://images.unsplash.com/photo-1550005809-91ad75fb315f?w=400&auto=format&fit=crop',
      likeCount: 411,
      isLiked: false,
      accessType: 'paid',
      price: 199,
      photographer: {
        id: 8,
        user: {
          nickname: '喜事影像',
          avatar: 'https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?w=80&auto=format&fit=crop'
        }
      }
    }
  ],
  commercial: [
    {
      id: 'm13',
      title: '品牌宣传大片',
      coverImage: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&auto=format&fit=crop',
      likeCount: 287,
      isLiked: false,
      accessType: 'public',
      photographer: {
        id: 9,
        user: {
          nickname: '商业视觉',
          avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&auto=format&fit=crop'
        }
      }
    },
    {
      id: 'm14',
      title: '高端办公空间',
      coverImage: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=400&auto=format&fit=crop',
      likeCount: 193,
      isLiked: false,
      accessType: 'public',
      photographer: {
        id: 10,
        user: {
          nickname: '创意图片',
          avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&auto=format&fit=crop'
        }
      }
    },
    {
      id: 'm15',
      title: '时尚杂志风格',
      coverImage: 'https://images.unsplash.com/photo-1553028826-f4804a6dba3b?w=400&auto=format&fit=crop',
      likeCount: 364,
      isLiked: false,
      accessType: 'paid',
      price: 399,
      photographer: {
        id: 9,
        user: {
          nickname: '商业视觉',
          avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&auto=format&fit=crop'
        }
      }
    },
    {
      id: 'm16',
      title: '企业形象拍摄',
      coverImage: 'https://images.unsplash.com/photo-1560472355-536de3962603?w=400&auto=format&fit=crop',
      likeCount: 218,
      isLiked: false,
      accessType: 'public',
      photographer: {
        id: 10,
        user: {
          nickname: '创意图片',
          avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&auto=format&fit=crop'
        }
      }
    },
    {
      id: 'm17',
      title: '奢侈品广告大图',
      coverImage: 'https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=400&auto=format&fit=crop',
      likeCount: 476,
      isLiked: false,
      accessType: 'paid',
      price: 599,
      photographer: {
        id: 9,
        user: {
          nickname: '商业视觉',
          avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&auto=format&fit=crop'
        }
      }
    }
  ],
  family: [
    {
      id: 'm18',
      title: '公园亲子时光',
      coverImage: 'https://images.unsplash.com/photo-1476703993599-0035a21b17a9?w=400&auto=format&fit=crop',
      likeCount: 342,
      isLiked: false,
      accessType: 'public',
      photographer: {
        id: 11,
        user: {
          nickname: '温暖时光',
          avatar: 'https://images.unsplash.com/photo-1544725176-7c40e5a71c5e?w=80&auto=format&fit=crop'
        }
      }
    },
    {
      id: 'm19',
      title: '妈妈和宝贝',
      coverImage: 'https://images.unsplash.com/photo-1511895426328-dc8714191011?w=400&auto=format&fit=crop',
      likeCount: 589,
      isLiked: false,
      accessType: 'public',
      photographer: {
        id: 12,
        user: {
          nickname: '家庭记忆',
          avatar: 'https://images.unsplash.com/photo-1552058544-f2b08422138a?w=80&auto=format&fit=crop'
        }
      }
    },
    {
      id: 'm20',
      title: '爸爸与女儿',
      coverImage: 'https://images.unsplash.com/photo-1533483595632-c5f0e57a1936?w=400&auto=format&fit=crop',
      likeCount: 421,
      isLiked: false,
      accessType: 'public',
      photographer: {
        id: 11,
        user: {
          nickname: '温暖时光',
          avatar: 'https://images.unsplash.com/photo-1544725176-7c40e5a71c5e?w=80&auto=format&fit=crop'
        }
      }
    },
    {
      id: 'm21',
      title: '三口之家外拍',
      coverImage: 'https://images.unsplash.com/photo-1540479859555-17af45c78602?w=400&auto=format&fit=crop',
      likeCount: 263,
      isLiked: false,
      accessType: 'public',
      photographer: {
        id: 12,
        user: {
          nickname: '家庭记忆',
          avatar: 'https://images.unsplash.com/photo-1552058544-f2b08422138a?w=80&auto=format&fit=crop'
        }
      }
    },
    {
      id: 'm22',
      title: '儿童百天照',
      coverImage: 'https://images.unsplash.com/photo-1555252333-9f8e92e65df9?w=400&auto=format&fit=crop',
      likeCount: 312,
      isLiked: false,
      accessType: 'paid',
      price: 129,
      photographer: {
        id: 11,
        user: {
          nickname: '温暖时光',
          avatar: 'https://images.unsplash.com/photo-1544725176-7c40e5a71c5e?w=80&auto=format&fit=crop'
        }
      }
    }
  ],
  graduation: [
    {
      id: 'm23',
      title: '学士服毕业照',
      coverImage: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=400&auto=format&fit=crop',
      likeCount: 407,
      isLiked: false,
      accessType: 'public',
      photographer: {
        id: 13,
        user: {
          nickname: '青春影像',
          avatar: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=80&auto=format&fit=crop'
        }
      }
    },
    {
      id: 'm24',
      title: '毕业季校园留念',
      coverImage: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=400&auto=format&fit=crop',
      likeCount: 328,
      isLiked: false,
      accessType: 'public',
      photographer: {
        id: 14,
        user: {
          nickname: '年华摄影',
          avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=80&auto=format&fit=crop'
        }
      }
    },
    {
      id: 'm25',
      title: '抛帽仪式定格',
      coverImage: 'https://images.unsplash.com/photo-1627556704302-624286467c65?w=400&auto=format&fit=crop',
      likeCount: 516,
      isLiked: false,
      accessType: 'public',
      photographer: {
        id: 13,
        user: {
          nickname: '青春影像',
          avatar: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=80&auto=format&fit=crop'
        }
      }
    },
    {
      id: 'm26',
      title: '毕业班合影',
      coverImage: 'https://images.unsplash.com/photo-1562774053-701939374585?w=400&auto=format&fit=crop',
      likeCount: 244,
      isLiked: false,
      accessType: 'public',
      photographer: {
        id: 14,
        user: {
          nickname: '年华摄影',
          avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=80&auto=format&fit=crop'
        }
      }
    },
    {
      id: 'm27',
      title: '操场跑道奔跑',
      coverImage: 'https://images.unsplash.com/photo-1589994965851-a8f479c573a9?w=400&auto=format&fit=crop',
      likeCount: 189,
      isLiked: false,
      accessType: 'public',
      photographer: {
        id: 13,
        user: {
          nickname: '青春影像',
          avatar: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=80&auto=format&fit=crop'
        }
      }
    }
  ],
  travel: [
    {
      id: 'm28',
      title: '云南梯田日出',
      coverImage: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=400&auto=format&fit=crop',
      likeCount: 834,
      isLiked: false,
      accessType: 'public',
      photographer: {
        id: 15,
        user: {
          nickname: '行者视界',
          avatar: 'https://images.unsplash.com/photo-1463453091185-61582044d556?w=80&auto=format&fit=crop'
        }
      }
    },
    {
      id: 'm29',
      title: '沙漠极光之旅',
      coverImage: 'https://images.unsplash.com/photo-1503220317375-aaad61436b1b?w=400&auto=format&fit=crop',
      likeCount: 612,
      isLiked: false,
      accessType: 'public',
      photographer: {
        id: 16,
        user: {
          nickname: '流浪镜头',
          avatar: 'https://images.unsplash.com/photo-1499996860823-5214fcc65f8f?w=80&auto=format&fit=crop'
        }
      }
    },
    {
      id: 'm30',
      title: '马尔代夫碧海',
      coverImage: 'https://images.unsplash.com/photo-1506929562872-bb421503ef21?w=400&auto=format&fit=crop',
      likeCount: 921,
      isLiked: false,
      accessType: 'paid',
      price: 199,
      photographer: {
        id: 15,
        user: {
          nickname: '行者视界',
          avatar: 'https://images.unsplash.com/photo-1463453091185-61582044d556?w=80&auto=format&fit=crop'
        }
      }
    },
    {
      id: 'm31',
      title: '雪山徒步纪实',
      coverImage: 'https://images.unsplash.com/photo-1501446529957-6226b4655a25?w=400&auto=format&fit=crop',
      likeCount: 487,
      isLiked: false,
      accessType: 'public',
      photographer: {
        id: 16,
        user: {
          nickname: '流浪镜头',
          avatar: 'https://images.unsplash.com/photo-1499996860823-5214fcc65f8f?w=80&auto=format&fit=crop'
        }
      }
    },
    {
      id: 'm32',
      title: '欧洲古城街拍',
      coverImage: 'https://images.unsplash.com/photo-1530521954074-e64f6810b32d?w=400&auto=format&fit=crop',
      likeCount: 553,
      isLiked: false,
      accessType: 'public',
      photographer: {
        id: 15,
        user: {
          nickname: '行者视界',
          avatar: 'https://images.unsplash.com/photo-1463453091185-61582044d556?w=80&auto=format&fit=crop'
        }
      }
    },
    {
      id: 'm33',
      title: '日本京都樱花道',
      coverImage: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=400&auto=format&fit=crop',
      likeCount: 742,
      isLiked: false,
      accessType: 'public',
      photographer: {
        id: 16,
        user: {
          nickname: '流浪镜头',
          avatar: 'https://images.unsplash.com/photo-1499996860823-5214fcc65f8f?w=80&auto=format&fit=crop'
        }
      }
    }
  ],
  event: [
    {
      id: 'm34',
      title: '音乐节现场',
      coverImage: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&auto=format&fit=crop',
      likeCount: 673,
      isLiked: false,
      accessType: 'public',
      photographer: {
        id: 17,
        user: {
          nickname: '现场快拍',
          avatar: 'https://images.unsplash.com/photo-1506918641053-a4acb2e7736d?w=80&auto=format&fit=crop'
        }
      }
    },
    {
      id: 'm35',
      title: '年会舞台演出',
      coverImage: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=400&auto=format&fit=crop',
      likeCount: 318,
      isLiked: false,
      accessType: 'public',
      photographer: {
        id: 18,
        user: {
          nickname: '聚焦影视',
          avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=80&auto=format&fit=crop'
        }
      }
    },
    {
      id: 'm36',
      title: '摇滚演唱会灯光',
      coverImage: 'https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?w=400&auto=format&fit=crop',
      likeCount: 589,
      isLiked: false,
      accessType: 'public',
      photographer: {
        id: 17,
        user: {
          nickname: '现场快拍',
          avatar: 'https://images.unsplash.com/photo-1506918641053-a4acb2e7736d?w=80&auto=format&fit=crop'
        }
      }
    },
    {
      id: 'm37',
      title: '路演产品发布会',
      coverImage: 'https://images.unsplash.com/photo-1524368535928-5b5e00ddc76b?w=400&auto=format&fit=crop',
      likeCount: 241,
      isLiked: false,
      accessType: 'public',
      photographer: {
        id: 18,
        user: {
          nickname: '聚焦影视',
          avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=80&auto=format&fit=crop'
        }
      }
    },
    {
      id: 'm38',
      title: '体育赛事纪实',
      coverImage: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400&auto=format&fit=crop',
      likeCount: 407,
      isLiked: false,
      accessType: 'public',
      photographer: {
        id: 17,
        user: {
          nickname: '现场快拍',
          avatar: 'https://images.unsplash.com/photo-1506918641053-a4acb2e7736d?w=80&auto=format&fit=crop'
        }
      }
    }
  ],
  product: [
    {
      id: 'm39',
      title: '腕表特写静物',
      coverImage: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&auto=format&fit=crop',
      likeCount: 456,
      isLiked: false,
      accessType: 'public',
      photographer: {
        id: 19,
        user: {
          nickname: '物语摄影',
          avatar: 'https://images.unsplash.com/photo-1542909168-82c3e7fdca5c?w=80&auto=format&fit=crop'
        }
      }
    },
    {
      id: 'm40',
      title: '球鞋电商棚拍',
      coverImage: 'https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=400&auto=format&fit=crop',
      likeCount: 312,
      isLiked: false,
      accessType: 'public',
      photographer: {
        id: 20,
        user: {
          nickname: '商拍工坊',
          avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=80&auto=format&fit=crop'
        }
      }
    },
    {
      id: 'm41',
      title: '美妆护肤品系列',
      coverImage: 'https://images.unsplash.com/photo-1586495777744-4e6232bf2e46?w=400&auto=format&fit=crop',
      likeCount: 528,
      isLiked: false,
      accessType: 'paid',
      price: 299,
      photographer: {
        id: 19,
        user: {
          nickname: '物语摄影',
          avatar: 'https://images.unsplash.com/photo-1542909168-82c3e7fdca5c?w=80&auto=format&fit=crop'
        }
      }
    },
    {
      id: 'm42',
      title: '数码产品特写',
      coverImage: 'https://images.unsplash.com/photo-1581235720704-06d3acfcb36f?w=400&auto=format&fit=crop',
      likeCount: 287,
      isLiked: false,
      accessType: 'public',
      photographer: {
        id: 20,
        user: {
          nickname: '商拍工坊',
          avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=80&auto=format&fit=crop'
        }
      }
    },
    {
      id: 'm43',
      title: '食品美食摄影',
      coverImage: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&auto=format&fit=crop',
      likeCount: 394,
      isLiked: false,
      accessType: 'public',
      photographer: {
        id: 19,
        user: {
          nickname: '物语摄影',
          avatar: 'https://images.unsplash.com/photo-1542909168-82c3e7fdca5c?w=80&auto=format&fit=crop'
        }
      }
    },
    {
      id: 'm44',
      title: '珠宝首饰光效',
      coverImage: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400&auto=format&fit=crop',
      likeCount: 467,
      isLiked: false,
      accessType: 'paid',
      price: 199,
      photographer: {
        id: 20,
        user: {
          nickname: '商拍工坊',
          avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=80&auto=format&fit=crop'
        }
      }
    }
  ]
}

// 全部 = 所有分类合并
mockMap['all'] = Object.values(mockMap)
  .flat()
  .sort(() => Math.random() - 0.5)

onMounted(() => fetchList(true))

const selectCategory = (key: string) => {
  activeCategory.value = key
  page.value = 1
  noMore.value = false
  fetchList(true)
}

const fetchList = async (reset = false) => {
  if (loadingMore.value) return
  loadingMore.value = true
  try {
    const params: any = { page: page.value, pageSize: 20 }
    if (activeCategory.value !== 'all') params.category = activeCategory.value
    const res = await getPortfolioListApi(params)
    const apiList = res?.data?.list || []

    // API 有数据优先用真实数据，否则用分类 mock 演示数据
    const list = apiList.length > 0 ? apiList : mockMap[activeCategory.value] || []
    if (reset) portfolioList.value = list
    else portfolioList.value.push(...list)
    noMore.value = true // mock 数据一次性加载完
  } catch {
    // 请求失败时直接展示 mock 数据
    const list = mockMap[activeCategory.value] || []
    if (reset) portfolioList.value = list
    noMore.value = true
  } finally {
    loadingMore.value = false
  }
}

const loadMore = () => {
  if (noMore.value) return
  page.value++
  fetchList()
}

const onImgLoad = () => {}

const toggleLike = async (item: any) => {
  const token = uni.getStorageSync('token')
  if (!token) {
    uni.navigateTo({ url: '/pages/auth/login' })
    return
  }
  try {
    if (item.id?.toString().startsWith('m')) {
      // mock 数据本地切换
      item.isLiked = !item.isLiked
      item.likeCount += item.isLiked ? 1 : -1
      return
    }
    const res = await likePortfolioApi(item.id)
    item.isLiked = res?.data?.liked
    item.likeCount = res?.data?.liked ? item.likeCount + 1 : item.likeCount - 1
  } catch {}
}

const goDetail = (id: number) => uni.navigateTo({ url: `/pages/portfolio/detail?id=${id}` })
const goPhotographer = (id: number) => uni.navigateTo({ url: `/pages/photographer/detail?id=${id}` })
</script>

<style scoped lang="scss">
.discover-page {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f5f5f5;

  .filter-bar {
    background: #fff;
    padding: 16rpx 0;
    border-bottom: 1rpx solid #f0f0f0;

    .filter-scroll {
      white-space: nowrap;
      padding: 0 20rpx;
    }

    .filter-item {
      display: inline-block;
      padding: 10rpx 28rpx;
      font-size: 26rpx;
      color: #666;
      border-radius: 32rpx;
      margin-right: 12rpx;
      background: #f5f5f5;

      &.active {
        background: #ff6b35;
        color: #fff;
      }
    }
  }

  .portfolio-scroll {
    flex: 1;
    overflow: hidden;
  }

  .waterfall {
    padding: 12rpx;
  }

  .portfolio-card {
    margin: 0 6rpx 12rpx;
    background: #fff;
    border-radius: 16rpx;
    overflow: hidden;

    .portfolio-img {
      width: 100%;
    }

    .card-body {
      padding: 16rpx;

      .card-title {
        font-size: 26rpx;
        color: #333;
        font-weight: bold;
        display: block;
        margin-bottom: 10rpx;
      }

      .card-meta {
        display: flex;
        align-items: center;
        justify-content: space-between;

        .author {
          display: flex;
          align-items: center;

          .author-avatar {
            width: 44rpx;
            height: 44rpx;
            border-radius: 22rpx;
            margin-right: 8rpx;
          }
          .author-name {
            font-size: 22rpx;
            color: #999;
          }
        }

        .like-btn {
          font-size: 24rpx;
          color: #999;
        }
      }

      .lock-badge {
        margin-top: 8rpx;
        background: rgba(255, 107, 53, 0.1);
        color: #ff6b35;
        font-size: 22rpx;
        padding: 4rpx 16rpx;
        border-radius: 8rpx;
        display: inline-block;
      }
    }
  }

  .loading-more,
  .no-more {
    text-align: center;
    padding: 24rpx;
    color: #999;
    font-size: 26rpx;
  }
}
</style>
