<route lang="json5">
{
  style: {
    navigationBarTitleText: '分类图库',
    navigationBarBackgroundColor: '#ffffff',
    navigationBarTextStyle: 'black'
  }
}
</route>

<template>
  <view class="gallery-page">
    <!-- 顶部筛选标签 -->
    <scroll-view scroll-x class="filter-bar">
      <view
        v-for="tag in filterTags"
        :key="tag.value"
        class="filter-tag"
        :class="{ active: activeTag === tag.value }"
        @click="switchTag(tag.value)"
      >
        {{ tag.label }}
      </view>
    </scroll-view>

    <!-- 统计信息 -->
    <view class="stats-bar">
      <text class="stats-text">共 {{ filteredPhotos.length }} 张作品</text>
      <view class="sort-btn" @click="toggleSort">
        <text class="sort-icon">⇅</text>
        <text class="sort-label">{{ sortLabel }}</text>
      </view>
    </view>

    <!-- 瀑布流图片网格 -->
    <view class="photo-grid">
      <view class="photo-item" v-for="(photo, index) in filteredPhotos" :key="photo.id" @click="previewPhoto(index)">
        <image :src="photo.url" mode="aspectFill" class="photo-img" :class="photo.tall ? 'tall' : ''" lazy-load />
        <view class="photo-overlay">
          <view class="photo-meta">
            <view class="photographer-info">
              <image :src="photo.avatar" mode="aspectFill" class="avatar" />
              <text class="author">{{ photo.author }}</text>
            </view>
            <view class="like-btn" @click.stop="toggleLike(photo)">
              <text :class="photo.liked ? 'liked' : 'like-icon'">{{ photo.liked ? '❤' : '♡' }}</text>
              <text class="like-count">{{ photo.likes }}</text>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 预览弹窗 -->
    <view class="preview-modal" v-if="previewVisible" @click="closePreview">
      <image :src="previewSrc" mode="aspectFit" class="preview-img" />
      <view class="preview-actions" @click.stop>
        <view class="preview-info">
          <text class="preview-title">{{ previewItem?.title }}</text>
          <text class="preview-author">📷 {{ previewItem?.author }}</text>
        </view>
        <view class="preview-btns">
          <button class="btn-book" @click="bookPhotographer">预约摄影师</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
const props = defineProps<{}>() // route params via onLoad

const categoryType = ref('portrait')
const categoryTitle = ref('个人写真')
const activeTag = ref('all')
const sortType = ref<'latest' | 'hot'>('latest')
const previewVisible = ref(false)
const previewIndex = ref(0)

// 按分类定义测试图片数据（Picsum + Unsplash）
const categoryData: Record<string, any> = {
  portrait: {
    title: '个人写真',
    tags: [
      { label: '全部', value: 'all' },
      { label: '日系', value: 'japanese' },
      { label: '欧美', value: 'western' },
      { label: '复古', value: 'vintage' },
      { label: '小清新', value: 'fresh' }
    ],
    photos: [
      {
        id: 1,
        url: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400&q=80',
        title: '日系胶片写真',
        author: '林晓雨',
        avatar: 'https://i.pravatar.cc/60?img=1',
        likes: 328,
        tall: true,
        tag: 'japanese'
      },
      {
        id: 2,
        url: 'https://images.unsplash.com/photo-1524502397800-2eeaad7c3fe5?w=400&q=80',
        title: '清晨阳光系列',
        author: '陈思远',
        avatar: 'https://i.pravatar.cc/60?img=2',
        likes: 256,
        tall: false,
        tag: 'fresh'
      },
      {
        id: 3,
        url: 'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=400&q=80',
        title: '复古胶片风格',
        author: '张美丽',
        avatar: 'https://i.pravatar.cc/60?img=3',
        likes: 412,
        tall: false,
        tag: 'vintage'
      },
      {
        id: 4,
        url: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=400&q=80',
        title: '时尚欧美风',
        author: '王宇航',
        avatar: 'https://i.pravatar.cc/60?img=4',
        likes: 189,
        tall: true,
        tag: 'western'
      },
      {
        id: 5,
        url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&q=80',
        title: '男士正装写真',
        author: '李浩然',
        avatar: 'https://i.pravatar.cc/60?img=5',
        likes: 301,
        tall: false,
        tag: 'western'
      },
      {
        id: 6,
        url: 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=400&q=80',
        title: '清新户外系列',
        author: '赵晓梅',
        avatar: 'https://i.pravatar.cc/60?img=6',
        likes: 445,
        tall: false,
        tag: 'fresh'
      },
      {
        id: 7,
        url: 'https://images.unsplash.com/photo-1513956589380-bad6acb9b9d4?w=400&q=80',
        title: '日式和风写真',
        author: '刘雨欣',
        avatar: 'https://i.pravatar.cc/60?img=7',
        likes: 267,
        tall: true,
        tag: 'japanese'
      },
      {
        id: 8,
        url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&q=80',
        title: '青春校园系列',
        author: '周思涵',
        avatar: 'https://i.pravatar.cc/60?img=8',
        likes: 533,
        tall: false,
        tag: 'fresh'
      },
      {
        id: 9,
        url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&q=80',
        title: '复古上海风',
        author: '吴晓红',
        avatar: 'https://i.pravatar.cc/60?img=9',
        likes: 198,
        tall: false,
        tag: 'vintage'
      },
      {
        id: 10,
        url: 'https://images.unsplash.com/photo-1520813792240-56fc4a3765a7?w=400&q=80',
        title: '纯白写真',
        author: '郑梦洁',
        avatar: 'https://i.pravatar.cc/60?img=10',
        likes: 389,
        tall: true,
        tag: 'japanese'
      },
      {
        id: 11,
        url: 'https://images.unsplash.com/photo-1492106087820-71f1a00d2b11?w=400&q=80',
        title: '街头欧美风',
        author: '孙浩宇',
        avatar: 'https://i.pravatar.cc/60?img=11',
        likes: 476,
        tall: false,
        tag: 'western'
      },
      {
        id: 12,
        url: 'https://images.unsplash.com/photo-1541216970279-affbfdd55aa8?w=400&q=80',
        title: '闺蜜写真',
        author: '林小燕',
        avatar: 'https://i.pravatar.cc/60?img=12',
        likes: 621,
        tall: false,
        tag: 'fresh'
      }
    ]
  },
  wedding: {
    title: '婚礼跟拍',
    tags: [
      { label: '全部', value: 'all' },
      { label: '教堂婚礼', value: 'church' },
      { label: '户外草坪', value: 'outdoor' },
      { label: '中式婚礼', value: 'chinese' },
      { label: '旅拍婚纱', value: 'travel' }
    ],
    photos: [
      {
        id: 1,
        url: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=400&q=80',
        title: '海边浪漫婚礼',
        author: '周浩',
        avatar: 'https://i.pravatar.cc/60?img=13',
        likes: 892,
        tall: true,
        tag: 'outdoor'
      },
      {
        id: 2,
        url: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=400&q=80',
        title: '教堂唯美婚礼',
        author: '杨晓春',
        avatar: 'https://i.pravatar.cc/60?img=14',
        likes: 1024,
        tall: false,
        tag: 'church'
      },
      {
        id: 3,
        url: 'https://images.unsplash.com/photo-1520854221256-17451cc331bf?w=400&q=80',
        title: '草坪户外婚礼',
        author: '徐文博',
        avatar: 'https://i.pravatar.cc/60?img=15',
        likes: 756,
        tall: false,
        tag: 'outdoor'
      },
      {
        id: 4,
        url: 'https://images.unsplash.com/photo-1524824267900-2b3a7bf2f8ba?w=400&q=80',
        title: '浪漫求婚瞬间',
        author: '黄晓明',
        avatar: 'https://i.pravatar.cc/60?img=16',
        likes: 1356,
        tall: true,
        tag: 'outdoor'
      },
      {
        id: 5,
        url: 'https://images.unsplash.com/photo-1469371670807-013ccf25f16a?w=400&q=80',
        title: '白色教堂仪式',
        author: '吴志远',
        avatar: 'https://i.pravatar.cc/60?img=17',
        likes: 834,
        tall: false,
        tag: 'church'
      },
      {
        id: 6,
        url: 'https://images.unsplash.com/photo-1537633552985-df8429e8048b?w=400&q=80',
        title: '中式传统婚礼',
        author: '陈志刚',
        avatar: 'https://i.pravatar.cc/60?img=18',
        likes: 912,
        tall: false,
        tag: 'chinese'
      },
      {
        id: 7,
        url: 'https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?w=400&q=80',
        title: '蜜月旅拍婚纱',
        author: '赵倩倩',
        avatar: 'https://i.pravatar.cc/60?img=19',
        likes: 678,
        tall: true,
        tag: 'travel'
      },
      {
        id: 8,
        url: 'https://images.unsplash.com/photo-1606800052052-a08af7148866?w=400&q=80',
        title: '婚礼现场跟拍',
        author: '钱大宝',
        avatar: 'https://i.pravatar.cc/60?img=20',
        likes: 541,
        tall: false,
        tag: 'church'
      },
      {
        id: 9,
        url: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=400&q=80',
        title: '巴厘岛旅拍',
        author: '孙美玲',
        avatar: 'https://i.pravatar.cc/60?img=21',
        likes: 1102,
        tall: false,
        tag: 'travel'
      },
      {
        id: 10,
        url: 'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=400&q=80',
        title: '自然光婚礼',
        author: '周阳',
        avatar: 'https://i.pravatar.cc/60?img=22',
        likes: 789,
        tall: false,
        tag: 'outdoor'
      },
      {
        id: 11,
        url: 'https://images.unsplash.com/photo-1642704804474-cf779e8ca25e?w=400&q=80',
        title: '北京四合院婚礼',
        author: '朱志伟',
        avatar: 'https://i.pravatar.cc/60?img=23',
        likes: 445,
        tall: true,
        tag: 'chinese'
      },
      {
        id: 12,
        url: 'https://images.unsplash.com/photo-1548690048-cf4c13e54f1a?w=400&q=80',
        title: '云南旅拍婚纱',
        author: '任小敏',
        avatar: 'https://i.pravatar.cc/60?img=24',
        likes: 934,
        tall: false,
        tag: 'travel'
      }
    ]
  },
  commercial: {
    title: '商业拍摄',
    tags: [
      { label: '全部', value: 'all' },
      { label: '企业形象', value: 'corporate' },
      { label: '广告拍摄', value: 'ad' },
      { label: '电商产品', value: 'ecommerce' },
      { label: '建筑空间', value: 'architecture' }
    ],
    photos: [
      {
        id: 1,
        url: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=400&q=80',
        title: '企业形象拍摄',
        author: '魏大勇',
        avatar: 'https://i.pravatar.cc/60?img=25',
        likes: 234,
        tall: false,
        tag: 'corporate'
      },
      {
        id: 2,
        url: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400&q=80',
        title: '科技公司宣传片',
        author: '蒋晓燕',
        avatar: 'https://i.pravatar.cc/60?img=26',
        likes: 189,
        tall: true,
        tag: 'corporate'
      },
      {
        id: 3,
        url: 'https://images.unsplash.com/photo-1542744094-3a31f272c490?w=400&q=80',
        title: '品牌广告大片',
        author: '傅云龙',
        avatar: 'https://i.pravatar.cc/60?img=27',
        likes: 356,
        tall: false,
        tag: 'ad'
      },
      {
        id: 4,
        url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80',
        title: '高管商务形象',
        author: '沈志明',
        avatar: 'https://i.pravatar.cc/60?img=28',
        likes: 421,
        tall: false,
        tag: 'corporate'
      },
      {
        id: 5,
        url: 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=400&q=80',
        title: '互联网公司拍摄',
        author: '崔晓晨',
        avatar: 'https://i.pravatar.cc/60?img=29',
        likes: 267,
        tall: true,
        tag: 'corporate'
      },
      {
        id: 6,
        url: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=400&q=80',
        title: '团队协作场景',
        author: '叶子俊',
        avatar: 'https://i.pravatar.cc/60?img=30',
        likes: 312,
        tall: false,
        tag: 'corporate'
      },
      {
        id: 7,
        url: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=400&q=80',
        title: '创意广告创作',
        author: '杜海涛',
        avatar: 'https://i.pravatar.cc/60?img=31',
        likes: 498,
        tall: false,
        tag: 'ad'
      },
      {
        id: 8,
        url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&q=80',
        title: '现代办公空间',
        author: '袁浩杰',
        avatar: 'https://i.pravatar.cc/60?img=32',
        likes: 156,
        tall: false,
        tag: 'architecture'
      },
      {
        id: 9,
        url: 'https://images.unsplash.com/photo-1444653614773-995cb1ef9efa?w=400&q=80',
        title: '建筑外观拍摄',
        author: '方晓磊',
        avatar: 'https://i.pravatar.cc/60?img=33',
        likes: 234,
        tall: true,
        tag: 'architecture'
      },
      {
        id: 10,
        url: 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=400&q=80',
        title: '电商主图拍摄',
        author: '鲁小虎',
        avatar: 'https://i.pravatar.cc/60?img=34',
        likes: 678,
        tall: false,
        tag: 'ecommerce'
      },
      {
        id: 11,
        url: 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=400&q=80',
        title: '服装电商画报',
        author: '严志远',
        avatar: 'https://i.pravatar.cc/60?img=35',
        likes: 543,
        tall: false,
        tag: 'ecommerce'
      },
      {
        id: 12,
        url: 'https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=400&q=80',
        title: '运动品牌广告',
        author: '何晓峰',
        avatar: 'https://i.pravatar.cc/60?img=36',
        likes: 467,
        tall: true,
        tag: 'ad'
      }
    ]
  },
  family: {
    title: '亲子家庭',
    tags: [
      { label: '全部', value: 'all' },
      { label: '新生儿', value: 'newborn' },
      { label: '百天照', value: 'hundred' },
      { label: '儿童写真', value: 'kids' },
      { label: '全家福', value: 'family' }
    ],
    photos: [
      {
        id: 1,
        url: 'https://images.unsplash.com/photo-1511765224389-37f0e77cf0eb?w=400&q=80',
        title: '温馨全家福',
        author: '钟晓燕',
        avatar: 'https://i.pravatar.cc/60?img=37',
        likes: 892,
        tall: false,
        tag: 'family'
      },
      {
        id: 2,
        url: 'https://images.unsplash.com/photo-1476703993599-0035a21b17a9?w=400&q=80',
        title: '新生宝宝写真',
        author: '金晓琪',
        avatar: 'https://i.pravatar.cc/60?img=38',
        likes: 1234,
        tall: true,
        tag: 'newborn'
      },
      {
        id: 3,
        url: 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=400&q=80',
        title: '亲子互动时光',
        author: '石俊伟',
        avatar: 'https://i.pravatar.cc/60?img=39',
        likes: 678,
        tall: false,
        tag: 'kids'
      },
      {
        id: 4,
        url: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=400&q=80',
        title: '百天纪念写真',
        author: '龙小龙',
        avatar: 'https://i.pravatar.cc/60?img=40',
        likes: 956,
        tall: false,
        tag: 'hundred'
      },
      {
        id: 5,
        url: 'https://images.unsplash.com/photo-1560564850-8c4edea4dd15?w=400&q=80',
        title: '儿童成长记录',
        author: '冯晓玲',
        avatar: 'https://i.pravatar.cc/60?img=41',
        likes: 723,
        tall: true,
        tag: 'kids'
      },
      {
        id: 6,
        url: 'https://images.unsplash.com/photo-1622547748225-3fc4abd2cca0?w=400&q=80',
        title: '萌娃户外写真',
        author: '唐晓娟',
        avatar: 'https://i.pravatar.cc/60?img=42',
        likes: 1089,
        tall: false,
        tag: 'kids'
      },
      {
        id: 7,
        url: 'https://images.unsplash.com/photo-1516627145497-ae6968895b74?w=400&q=80',
        title: '一周岁抓周',
        author: '白晓峰',
        avatar: 'https://i.pravatar.cc/60?img=43',
        likes: 867,
        tall: false,
        tag: 'hundred'
      },
      {
        id: 8,
        url: 'https://images.unsplash.com/photo-1536640712-4d4c36ff0e4e?w=400&q=80',
        title: '家庭美好时光',
        author: '邱志文',
        avatar: 'https://i.pravatar.cc/60?img=44',
        likes: 543,
        tall: true,
        tag: 'family'
      },
      {
        id: 9,
        url: 'https://images.unsplash.com/photo-1531498860502-7b1d0f51ad10?w=400&q=80',
        title: '小公主梦幻写真',
        author: '于晓菊',
        avatar: 'https://i.pravatar.cc/60?img=45',
        likes: 1345,
        tall: false,
        tag: 'kids'
      },
      {
        id: 10,
        url: 'https://images.unsplash.com/photo-1519689680058-324335c77eba?w=400&q=80',
        title: '三口之家',
        author: '薛志远',
        avatar: 'https://i.pravatar.cc/60?img=46',
        likes: 789,
        tall: false,
        tag: 'family'
      },
      {
        id: 11,
        url: 'https://images.unsplash.com/photo-1555252333-9f8e92e65df9?w=400&q=80',
        title: '新生儿安睡',
        author: '廖晓慧',
        avatar: 'https://i.pravatar.cc/60?img=47',
        likes: 1567,
        tall: false,
        tag: 'newborn'
      },
      {
        id: 12,
        url: 'https://images.unsplash.com/photo-1602536052359-ef94c21c5948?w=400&q=80',
        title: '公园亲子游',
        author: '段志勇',
        avatar: 'https://i.pravatar.cc/60?img=48',
        likes: 623,
        tall: true,
        tag: 'family'
      }
    ]
  },
  graduation: {
    title: '毕业照',
    tags: [
      { label: '全部', value: 'all' },
      { label: '学士服', value: 'bachelor' },
      { label: '汉服毕业', value: 'hanfu' },
      { label: '街拍风格', value: 'street' },
      { label: '校园清新', value: 'campus' }
    ],
    photos: [
      {
        id: 1,
        url: 'https://images.unsplash.com/photo-1627556704283-a3e0d5d9faf0?w=400&q=80',
        title: '学士服毕业照',
        author: '林毕宁',
        avatar: 'https://i.pravatar.cc/60?img=49',
        likes: 567,
        tall: false,
        tag: 'bachelor'
      },
      {
        id: 2,
        url: 'https://images.unsplash.com/photo-1597733336794-12d05021d510?w=400&q=80',
        title: '校园樱花季',
        author: '关晓彤',
        avatar: 'https://i.pravatar.cc/60?img=50',
        likes: 834,
        tall: true,
        tag: 'campus'
      },
      {
        id: 3,
        url: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=400&q=80',
        title: '毕业典礼现场',
        author: '刘子骏',
        avatar: 'https://i.pravatar.cc/60?img=51',
        likes: 1023,
        tall: false,
        tag: 'bachelor'
      },
      {
        id: 4,
        url: 'https://images.unsplash.com/photo-1577896851231-70ef18881754?w=400&q=80',
        title: '闺蜜毕业合影',
        author: '方圆',
        avatar: 'https://i.pravatar.cc/60?img=52',
        likes: 756,
        tall: false,
        tag: 'campus'
      },
      {
        id: 5,
        url: 'https://images.unsplash.com/photo-1562077772-3bd90403f7f0?w=400&q=80',
        title: '汉服毕业写真',
        author: '李子轩',
        avatar: 'https://i.pravatar.cc/60?img=53',
        likes: 912,
        tall: true,
        tag: 'hanfu'
      },
      {
        id: 6,
        url: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400&q=80',
        title: '图书馆文艺风',
        author: '杨阳',
        avatar: 'https://i.pravatar.cc/60?img=54',
        likes: 445,
        tall: false,
        tag: 'campus'
      },
      {
        id: 7,
        url: 'https://images.unsplash.com/photo-1571260899304-425eee4c7efc?w=400&q=80',
        title: '毕业季街拍',
        author: '赵铭',
        avatar: 'https://i.pravatar.cc/60?img=55',
        likes: 678,
        tall: false,
        tag: 'street'
      },
      {
        id: 8,
        url: 'https://images.unsplash.com/photo-1567168544230-b01f2b19dcbb?w=400&q=80',
        title: '操场奔跑纪念',
        author: '孔晓伟',
        avatar: 'https://i.pravatar.cc/60?img=56',
        likes: 534,
        tall: false,
        tag: 'campus'
      },
      {
        id: 9,
        url: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=400&q=80',
        title: '汉服古风毕业',
        author: '毛志远',
        avatar: 'https://i.pravatar.cc/60?img=57',
        likes: 1123,
        tall: true,
        tag: 'hanfu'
      },
      {
        id: 10,
        url: 'https://images.unsplash.com/photo-1635107510862-53886e926b74?w=400&q=80',
        title: '鲜花毕业纪念',
        author: '卢晓燕',
        avatar: 'https://i.pravatar.cc/60?img=58',
        likes: 789,
        tall: false,
        tag: 'campus'
      },
      {
        id: 11,
        url: 'https://images.unsplash.com/photo-1543269665-7821e259c9ba?w=400&q=80',
        title: '城市街头毕业',
        author: '谢志豪',
        avatar: 'https://i.pravatar.cc/60?img=59',
        likes: 456,
        tall: false,
        tag: 'street'
      },
      {
        id: 12,
        url: 'https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?w=400&q=80',
        title: '学院派学士照',
        author: '邓晓燕',
        avatar: 'https://i.pravatar.cc/60?img=60',
        likes: 667,
        tall: false,
        tag: 'bachelor'
      }
    ]
  },
  travel: {
    title: '旅拍',
    tags: [
      { label: '全部', value: 'all' },
      { label: '国内', value: 'domestic' },
      { label: '出境', value: 'abroad' },
      { label: '海边', value: 'beach' },
      { label: '古镇', value: 'town' }
    ],
    photos: [
      {
        id: 1,
        url: 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=400&q=80',
        title: '云南大理旅拍',
        author: '白志远',
        avatar: 'https://i.pravatar.cc/60?img=1',
        likes: 1234,
        tall: false,
        tag: 'domestic'
      },
      {
        id: 2,
        url: 'https://images.unsplash.com/photo-1506929562872-bb421503ef21?w=400&q=80',
        title: '马尔代夫海边',
        author: '田晓春',
        avatar: 'https://i.pravatar.cc/60?img=2',
        likes: 2341,
        tall: true,
        tag: 'beach'
      },
      {
        id: 3,
        url: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=400&q=80',
        title: '拉萨布达拉宫',
        author: '翁晓燕',
        avatar: 'https://i.pravatar.cc/60?img=3',
        likes: 987,
        tall: false,
        tag: 'domestic'
      },
      {
        id: 4,
        url: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=400&q=80',
        title: '青海湖旅拍',
        author: '梁志文',
        avatar: 'https://i.pravatar.cc/60?img=4',
        likes: 1567,
        tall: false,
        tag: 'domestic'
      },
      {
        id: 5,
        url: 'https://images.unsplash.com/photo-1539367628448-4bc5c9d171c8?w=400&q=80',
        title: '巴厘岛日落',
        author: '覃晓',
        avatar: 'https://i.pravatar.cc/60?img=5',
        likes: 1892,
        tall: true,
        tag: 'abroad'
      },
      {
        id: 6,
        url: 'https://images.unsplash.com/photo-1552733407-5d5c46c3bb3b?w=400&q=80',
        title: '普罗旺斯薰衣草',
        author: '章子怡',
        avatar: 'https://i.pravatar.cc/60?img=6',
        likes: 2156,
        tall: false,
        tag: 'abroad'
      },
      {
        id: 7,
        url: 'https://images.unsplash.com/photo-1563206767-5b18f218e8de?w=400&q=80',
        title: '乌镇古镇风情',
        author: '范冰冰',
        avatar: 'https://i.pravatar.cc/60?img=7',
        likes: 789,
        tall: false,
        tag: 'town'
      },
      {
        id: 8,
        url: 'https://images.unsplash.com/photo-1519046904884-53103b34b206?w=400&q=80',
        title: '三亚海边度假',
        author: '刘诗诗',
        avatar: 'https://i.pravatar.cc/60?img=8',
        likes: 1456,
        tall: false,
        tag: 'beach'
      },
      {
        id: 9,
        url: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=400&q=80',
        title: '巴黎埃菲尔铁塔',
        author: '李小璐',
        avatar: 'https://i.pravatar.cc/60?img=9',
        likes: 3241,
        tall: true,
        tag: 'abroad'
      },
      {
        id: 10,
        url: 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=400&q=80',
        title: '西塘古镇漫步',
        author: '唐嫣',
        avatar: 'https://i.pravatar.cc/60?img=10',
        likes: 654,
        tall: false,
        tag: 'town'
      },
      {
        id: 11,
        url: 'https://images.unsplash.com/photo-1540202404-a2f29016b523?w=400&q=80',
        title: '冰岛极光旅拍',
        author: '赵薇',
        avatar: 'https://i.pravatar.cc/60?img=11',
        likes: 4523,
        tall: false,
        tag: 'abroad'
      },
      {
        id: 12,
        url: 'https://images.unsplash.com/photo-1516483638261-f4dbaf036963?w=400&q=80',
        title: '意大利海岸线',
        author: '孙俪',
        avatar: 'https://i.pravatar.cc/60?img=12',
        likes: 2678,
        tall: false,
        tag: 'abroad'
      }
    ]
  },
  event: {
    title: '活动会议',
    tags: [
      { label: '全部', value: 'all' },
      { label: '企业年会', value: 'annual' },
      { label: '发布会', value: 'launch' },
      { label: '展会博览', value: 'expo' },
      { label: '公益活动', value: 'charity' }
    ],
    photos: [
      {
        id: 1,
        url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&q=80',
        title: '企业年会精彩瞬间',
        author: '黄海冰',
        avatar: 'https://i.pravatar.cc/60?img=13',
        likes: 345,
        tall: false,
        tag: 'annual'
      },
      {
        id: 2,
        url: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=400&q=80',
        title: '新品发布会现场',
        author: '许晴',
        avatar: 'https://i.pravatar.cc/60?img=14',
        likes: 567,
        tall: true,
        tag: 'launch'
      },
      {
        id: 3,
        url: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=400&q=80',
        title: '国际展览会',
        author: '辛晓琪',
        avatar: 'https://i.pravatar.cc/60?img=15',
        likes: 289,
        tall: false,
        tag: 'expo'
      },
      {
        id: 4,
        url: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=400&q=80',
        title: '年度颁奖典礼',
        author: '蔡依林',
        avatar: 'https://i.pravatar.cc/60?img=16',
        likes: 678,
        tall: false,
        tag: 'annual'
      },
      {
        id: 5,
        url: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=400&q=80',
        title: '科技博览会',
        author: '王力宏',
        avatar: 'https://i.pravatar.cc/60?img=17',
        likes: 412,
        tall: true,
        tag: 'expo'
      },
      {
        id: 6,
        url: 'https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=400&q=80',
        title: '公益慈善活动',
        author: '周华健',
        avatar: 'https://i.pravatar.cc/60?img=18',
        likes: 534,
        tall: false,
        tag: 'charity'
      },
      {
        id: 7,
        url: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=400&q=80',
        title: '户外音乐节',
        author: '齐秦',
        avatar: 'https://i.pravatar.cc/60?img=19',
        likes: 892,
        tall: false,
        tag: 'annual'
      },
      {
        id: 8,
        url: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=400&q=80',
        title: '产品发布会',
        author: '林志炫',
        avatar: 'https://i.pravatar.cc/60?img=20',
        likes: 456,
        tall: false,
        tag: 'launch'
      },
      {
        id: 9,
        url: 'https://images.unsplash.com/photo-1551818255-e6e10975bc17?w=400&q=80',
        title: '论坛峰会现场',
        author: '张惠妹',
        avatar: 'https://i.pravatar.cc/60?img=21',
        likes: 234,
        tall: true,
        tag: 'launch'
      },
      {
        id: 10,
        url: 'https://images.unsplash.com/photo-1491438590914-bc09fcaaf77a?w=400&q=80',
        title: '社区公益活动',
        author: '苏慧伦',
        avatar: 'https://i.pravatar.cc/60?img=22',
        likes: 567,
        tall: false,
        tag: 'charity'
      },
      {
        id: 11,
        url: 'https://images.unsplash.com/photo-1468234847176-28606331216a?w=400&q=80',
        title: '汽车展览会',
        author: '那英',
        avatar: 'https://i.pravatar.cc/60?img=23',
        likes: 378,
        tall: false,
        tag: 'expo'
      },
      {
        id: 12,
        url: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=400&q=80',
        title: '年会舞台灯光',
        author: '孟庭苇',
        avatar: 'https://i.pravatar.cc/60?img=24',
        likes: 723,
        tall: false,
        tag: 'annual'
      }
    ]
  },
  product: {
    title: '产品拍摄',
    tags: [
      { label: '全部', value: 'all' },
      { label: '食品饮料', value: 'food' },
      { label: '美妆护肤', value: 'beauty' },
      { label: '数码科技', value: 'tech' },
      { label: '服装配饰', value: 'fashion' }
    ],
    photos: [
      {
        id: 1,
        url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=80',
        title: '高级手表产品图',
        author: '柴静',
        avatar: 'https://i.pravatar.cc/60?img=25',
        likes: 567,
        tall: false,
        tag: 'fashion'
      },
      {
        id: 2,
        url: 'https://images.unsplash.com/photo-1563203369-26f2e4a5ccf7?w=400&q=80',
        title: '美妆产品精拍',
        author: '朱迅',
        avatar: 'https://i.pravatar.cc/60?img=26',
        likes: 834,
        tall: true,
        tag: 'beauty'
      },
      {
        id: 3,
        url: 'https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=400&q=80',
        title: '运动鞋主图拍摄',
        author: '白岩松',
        avatar: 'https://i.pravatar.cc/60?img=27',
        likes: 1023,
        tall: false,
        tag: 'fashion'
      },
      {
        id: 4,
        url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80',
        title: '耐克产品广告',
        author: '郎咸平',
        avatar: 'https://i.pravatar.cc/60?img=28',
        likes: 1456,
        tall: false,
        tag: 'fashion'
      },
      {
        id: 5,
        url: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&q=80',
        title: '精品咖啡饮品',
        author: '马未都',
        avatar: 'https://i.pravatar.cc/60?img=29',
        likes: 678,
        tall: true,
        tag: 'food'
      },
      {
        id: 6,
        url: 'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=400&q=80',
        title: '护肤品摆拍',
        author: '曾子墨',
        avatar: 'https://i.pravatar.cc/60?img=30',
        likes: 912,
        tall: false,
        tag: 'beauty'
      },
      {
        id: 7,
        url: 'https://images.unsplash.com/photo-1567581935884-3349723552ca?w=400&q=80',
        title: '数码耳机精拍',
        author: '鲁豫',
        avatar: 'https://i.pravatar.cc/60?img=31',
        likes: 534,
        tall: false,
        tag: 'tech'
      },
      {
        id: 8,
        url: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=400&q=80',
        title: '旗舰手机产品',
        author: '朱军',
        avatar: 'https://i.pravatar.cc/60?img=32',
        likes: 789,
        tall: false,
        tag: 'tech'
      },
      {
        id: 9,
        url: 'https://images.unsplash.com/photo-1605296867304-46d5465a13f1?w=400&q=80',
        title: '精品食材拍摄',
        author: '撒贝宁',
        avatar: 'https://i.pravatar.cc/60?img=33',
        likes: 345,
        tall: true,
        tag: 'food'
      },
      {
        id: 10,
        url: 'https://images.unsplash.com/photo-1560343090-f0409e92791a?w=400&q=80',
        title: '时尚包包主图',
        author: '李詠',
        avatar: 'https://i.pravatar.cc/60?img=34',
        likes: 1123,
        tall: false,
        tag: 'fashion'
      },
      {
        id: 11,
        url: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400&q=80',
        title: '香水瓶高级感',
        author: '高晓松',
        avatar: 'https://i.pravatar.cc/60?img=35',
        likes: 867,
        tall: false,
        tag: 'beauty'
      },
      {
        id: 12,
        url: 'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=400&q=80',
        title: '笔记本电脑精拍',
        author: '窦文涛',
        avatar: 'https://i.pravatar.cc/60?img=36',
        likes: 453,
        tall: false,
        tag: 'tech'
      }
    ]
  }
}

const filterTags = ref<any[]>([])
const allPhotos = ref<any[]>([])

const filteredPhotos = computed(() => {
  let list = activeTag.value === 'all' ? allPhotos.value : allPhotos.value.filter(p => p.tag === activeTag.value)
  if (sortType.value === 'hot') {
    return [...list].sort((a, b) => b.likes - a.likes)
  }
  return list
})

const sortLabel = computed(() => (sortType.value === 'latest' ? '最新' : '最热'))

const previewItem = computed(() => filteredPhotos.value[previewIndex.value])
const previewSrc = computed(() => previewItem.value?.url || '')

const switchTag = (val: string) => {
  activeTag.value = val
}

const toggleSort = () => {
  sortType.value = sortType.value === 'latest' ? 'hot' : 'latest'
}

const toggleLike = (photo: any) => {
  photo.liked = !photo.liked
  photo.likes += photo.liked ? 1 : -1
}

const previewPhoto = (index: number) => {
  previewIndex.value = index
  previewVisible.value = true
}

const closePreview = () => {
  previewVisible.value = false
}

const bookPhotographer = () => {
  previewVisible.value = false
  uni.navigateTo({ url: '/pages/photographer/list' })
}

onLoad((options: any) => {
  const type = options?.type || 'portrait'
  const title = options?.title || '分类图库'
  categoryType.value = type
  categoryTitle.value = title
  uni.setNavigationBarTitle({ title })
  const data = categoryData[type] || categoryData['portrait']
  filterTags.value = data.tags
  allPhotos.value = data.photos.map((p: any) => ({ ...p, liked: false }))
})
</script>

<style scoped lang="scss">
.gallery-page {
  min-height: 100vh;
  background: #f5f5f5;

  .filter-bar {
    background: #fff;
    white-space: nowrap;
    padding: 0 20rpx;
    border-bottom: 1rpx solid #f0f0f0;

    .filter-tag {
      display: inline-block;
      padding: 20rpx 28rpx;
      font-size: 26rpx;
      color: #666;
      border-bottom: 4rpx solid transparent;
      transition: all 0.2s;

      &.active {
        color: #ff6b35;
        font-weight: bold;
        border-bottom-color: #ff6b35;
      }
    }
  }

  .stats-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16rpx 30rpx;
    background: #fff;
    margin-bottom: 16rpx;

    .stats-text {
      font-size: 24rpx;
      color: #999;
    }

    .sort-btn {
      display: flex;
      align-items: center;
      gap: 6rpx;

      .sort-icon {
        font-size: 28rpx;
        color: #666;
      }
      .sort-label {
        font-size: 26rpx;
        color: #333;
      }
    }
  }

  .photo-grid {
    padding: 0 12rpx;
    column-count: 2;
    column-gap: 12rpx;

    .photo-item {
      break-inside: avoid;
      margin-bottom: 12rpx;
      border-radius: 16rpx;
      overflow: hidden;
      position: relative;
      background: #e0e0e0;

      .photo-img {
        width: 100%;
        height: 340rpx;
        display: block;

        &.tall {
          height: 440rpx;
        }
      }

      .photo-overlay {
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        padding: 16rpx;
        background: linear-gradient(transparent, rgba(0, 0, 0, 0.6));

        .photo-meta {
          display: flex;
          justify-content: space-between;
          align-items: center;

          .photographer-info {
            display: flex;
            align-items: center;
            gap: 8rpx;

            .avatar {
              width: 40rpx;
              height: 40rpx;
              border-radius: 20rpx;
              border: 1rpx solid rgba(255, 255, 255, 0.6);
            }
            .author {
              font-size: 22rpx;
              color: #fff;
            }
          }

          .like-btn {
            display: flex;
            align-items: center;
            gap: 6rpx;

            .like-icon {
              font-size: 28rpx;
              color: rgba(255, 255, 255, 0.8);
            }
            .liked {
              font-size: 28rpx;
              color: #ff4455;
            }
            .like-count {
              font-size: 22rpx;
              color: #fff;
            }
          }
        }
      }
    }
  }

  .preview-modal {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.9);
    z-index: 9999;
    display: flex;
    flex-direction: column;
    justify-content: center;

    .preview-img {
      width: 100%;
      flex: 1;
    }

    .preview-actions {
      padding: 30rpx;
      background: rgba(0, 0, 0, 0.7);

      .preview-info {
        margin-bottom: 20rpx;
        .preview-title {
          font-size: 32rpx;
          color: #fff;
          font-weight: bold;
          display: block;
          margin-bottom: 8rpx;
        }
        .preview-author {
          font-size: 26rpx;
          color: #ccc;
        }
      }

      .preview-btns {
        .btn-book {
          width: 100%;
          height: 88rpx;
          background: linear-gradient(135deg, #ff6b35, #ff8c5a);
          color: #fff;
          border-radius: 44rpx;
          border: none;
          font-size: 30rpx;
          font-weight: bold;
        }
      }
    }
  }
}
</style>
