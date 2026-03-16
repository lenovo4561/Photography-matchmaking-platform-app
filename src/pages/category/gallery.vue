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
        url: 'https://picsum.photos/seed/jp-portrait-film/400/260',
        title: '日系胶片写真',
        author: '林晓雨',
        avatar: 'https://i.pravatar.cc/240?img=47',
        likes: 328,
        tall: true,
        tag: 'japanese'
      },
      {
        id: 2,
        url: 'https://picsum.photos/seed/morning-sunlight-girl/400/260',
        title: '清晨阳光系列',
        author: '陈思远',
        avatar: 'https://i.pravatar.cc/240?img=11',
        likes: 256,
        tall: false,
        tag: 'fresh'
      },
      {
        id: 3,
        url: 'https://picsum.photos/seed/retro-film-vintage/400/260',
        title: '复古胶片风格',
        author: '张美丽',
        avatar: 'https://i.pravatar.cc/240?img=12',
        likes: 412,
        tall: false,
        tag: 'vintage'
      },
      {
        id: 4,
        url: 'https://picsum.photos/seed/western-fashion-model/400/260',
        title: '时尚欧美风',
        author: '王宇航',
        avatar: 'https://i.pravatar.cc/240?img=48',
        likes: 189,
        tall: true,
        tag: 'western'
      },
      {
        id: 5,
        url: 'https://picsum.photos/seed/men-formal-suit/400/260',
        title: '男士正装写真',
        author: '李浩然',
        avatar: 'https://i.pravatar.cc/240?img=44',
        likes: 301,
        tall: false,
        tag: 'western'
      },
      {
        id: 6,
        url: 'https://picsum.photos/seed/outdoor-nature-fresh/400/260',
        title: '清新户外系列',
        author: '赵晓梅',
        avatar: 'https://i.pravatar.cc/240?img=15',
        likes: 445,
        tall: false,
        tag: 'fresh'
      },
      {
        id: 7,
        url: 'https://picsum.photos/seed/japan-wafuu-portrait/400/260',
        title: '日式和风写真',
        author: '刘雨欣',
        avatar: 'https://i.pravatar.cc/240?img=20',
        likes: 267,
        tall: true,
        tag: 'japanese'
      },
      {
        id: 8,
        url: 'https://picsum.photos/seed/campus-youth-smile/400/260',
        title: '青春校园系列',
        author: '周思涵',
        avatar: 'https://i.pravatar.cc/240?img=25',
        likes: 533,
        tall: false,
        tag: 'fresh'
      },
      {
        id: 9,
        url: 'https://picsum.photos/seed/shanghai-retro-style/400/260',
        title: '复古上海风',
        author: '吴晓红',
        avatar: 'https://i.pravatar.cc/240?img=30',
        likes: 198,
        tall: false,
        tag: 'vintage'
      },
      {
        id: 10,
        url: 'https://picsum.photos/seed/pure-white-portrait/400/260',
        title: '纯白写真',
        author: '郑梦洁',
        avatar: 'https://i.pravatar.cc/240?img=470',
        likes: 389,
        tall: true,
        tag: 'japanese'
      },
      {
        id: 11,
        url: 'https://picsum.photos/seed/street-western-style/400/260',
        title: '街头欧美风',
        author: '孙浩宇',
        avatar: 'https://i.pravatar.cc/240?img=471',
        likes: 476,
        tall: false,
        tag: 'western'
      },
      {
        id: 12,
        url: 'https://picsum.photos/seed/bestfriend-girls-photo/400/260',
        title: '闺蜜写真',
        author: '林小燕',
        avatar: 'https://i.pravatar.cc/240?img=472',
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
        url: 'https://picsum.photos/seed/beach-wedding-romance/400/260',
        title: '海边浪漫婚礼',
        author: '周浩',
        avatar: 'https://i.pravatar.cc/240?img=473',
        likes: 892,
        tall: true,
        tag: 'outdoor'
      },
      {
        id: 2,
        url: 'https://picsum.photos/seed/church-wedding-beauty/400/260',
        title: '教堂唯美婚礼',
        author: '杨晓春',
        avatar: 'https://i.pravatar.cc/240?img=474',
        likes: 1024,
        tall: false,
        tag: 'church'
      },
      {
        id: 3,
        url: 'https://picsum.photos/seed/lawn-outdoor-wedding/400/260',
        title: '草坪户外婚礼',
        author: '徐文博',
        avatar: 'https://i.pravatar.cc/240?img=475',
        likes: 756,
        tall: false,
        tag: 'outdoor'
      },
      {
        id: 4,
        url: 'https://picsum.photos/seed/proposal-romantic-moment/400/260',
        title: '浪漫求婚瞬间',
        author: '黄晓明',
        avatar: 'https://i.pravatar.cc/240?img=476',
        likes: 1356,
        tall: true,
        tag: 'outdoor'
      },
      {
        id: 5,
        url: 'https://picsum.photos/seed/white-chapel-ceremony/400/260',
        title: '白色教堂仪式',
        author: '吴志远',
        avatar: 'https://i.pravatar.cc/240?img=477',
        likes: 834,
        tall: false,
        tag: 'church'
      },
      {
        id: 6,
        url: 'https://picsum.photos/seed/chinese-traditional-wedding/400/260',
        title: '中式传统婚礼',
        author: '陈志刚',
        avatar: 'https://i.pravatar.cc/240?img=478',
        likes: 912,
        tall: false,
        tag: 'chinese'
      },
      {
        id: 7,
        url: 'https://picsum.photos/seed/honeymoon-travel-bride/400/260',
        title: '蜜月旅拍婚纱',
        author: '赵倩倩',
        avatar: 'https://i.pravatar.cc/240?img=479',
        likes: 678,
        tall: true,
        tag: 'travel'
      },
      {
        id: 8,
        url: 'https://picsum.photos/seed/wedding-live-shooting/400/260',
        title: '婚礼现场跟拍',
        author: '钱大宝',
        avatar: 'https://i.pravatar.cc/240?img=110',
        likes: 541,
        tall: false,
        tag: 'church'
      },
      {
        id: 9,
        url: 'https://picsum.photos/seed/bali-island-wedding/400/260',
        title: '巴厘岛旅拍',
        author: '孙美玲',
        avatar: 'https://i.pravatar.cc/240?img=111',
        likes: 1102,
        tall: false,
        tag: 'travel'
      },
      {
        id: 10,
        url: 'https://picsum.photos/seed/natural-light-wedding/400/260',
        title: '自然光婚礼',
        author: '周阳',
        avatar: 'https://i.pravatar.cc/240?img=112',
        likes: 789,
        tall: false,
        tag: 'outdoor'
      },
      {
        id: 11,
        url: 'https://picsum.photos/seed/beijing-courtyard-wed/400/260',
        title: '北京四合院婚礼',
        author: '朱志伟',
        avatar: 'https://i.pravatar.cc/240?img=113',
        likes: 445,
        tall: true,
        tag: 'chinese'
      },
      {
        id: 12,
        url: 'https://picsum.photos/seed/yunnan-travel-bridal/400/260',
        title: '云南旅拍婚纱',
        author: '任小敏',
        avatar: 'https://i.pravatar.cc/240?img=114',
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
        url: 'https://picsum.photos/seed/corporate-portrait-biz/400/260',
        title: '企业形象拍摄',
        author: '魏大勇',
        avatar: 'https://i.pravatar.cc/240?img=115',
        likes: 234,
        tall: false,
        tag: 'corporate'
      },
      {
        id: 2,
        url: 'https://picsum.photos/seed/tech-company-promo/400/260',
        title: '科技公司宣传片',
        author: '蒋晓燕',
        avatar: 'https://i.pravatar.cc/240?img=116',
        likes: 189,
        tall: true,
        tag: 'corporate'
      },
      {
        id: 3,
        url: 'https://picsum.photos/seed/brand-advertising-big/400/260',
        title: '品牌广告大片',
        author: '傅云龙',
        avatar: 'https://i.pravatar.cc/240?img=117',
        likes: 356,
        tall: false,
        tag: 'ad'
      },
      {
        id: 4,
        url: 'https://picsum.photos/seed/executive-business-look/400/260',
        title: '高管商务形象',
        author: '沈志明',
        avatar: 'https://i.pravatar.cc/240?img=118',
        likes: 421,
        tall: false,
        tag: 'corporate'
      },
      {
        id: 5,
        url: 'https://picsum.photos/seed/internet-office-shoot/400/260',
        title: '互联网公司拍摄',
        author: '崔晓晨',
        avatar: 'https://i.pravatar.cc/240?img=119',
        likes: 267,
        tall: true,
        tag: 'corporate'
      },
      {
        id: 6,
        url: 'https://picsum.photos/seed/team-collaboration-work/400/260',
        title: '团队协作场景',
        author: '叶子俊',
        avatar: 'https://i.pravatar.cc/240?img=120',
        likes: 312,
        tall: false,
        tag: 'corporate'
      },
      {
        id: 7,
        url: 'https://picsum.photos/seed/creative-ad-production/400/260',
        title: '创意广告创作',
        author: '杜海涛',
        avatar: 'https://i.pravatar.cc/240?img=121',
        likes: 498,
        tall: false,
        tag: 'ad'
      },
      {
        id: 8,
        url: 'https://picsum.photos/seed/modern-office-interior/400/260',
        title: '现代办公空间',
        author: '袁浩杰',
        avatar: 'https://i.pravatar.cc/240?img=122',
        likes: 156,
        tall: false,
        tag: 'architecture'
      },
      {
        id: 9,
        url: 'https://picsum.photos/seed/building-facade-exterior/400/260',
        title: '建筑外观拍摄',
        author: '方晓磊',
        avatar: 'https://i.pravatar.cc/240?img=123',
        likes: 234,
        tall: true,
        tag: 'architecture'
      },
      {
        id: 10,
        url: 'https://picsum.photos/seed/ecommerce-main-photo/400/260',
        title: '电商主图拍摄',
        author: '鲁小虎',
        avatar: 'https://i.pravatar.cc/240?img=124',
        likes: 678,
        tall: false,
        tag: 'ecommerce'
      },
      {
        id: 11,
        url: 'https://picsum.photos/seed/fashion-ecom-clothing/400/260',
        title: '服装电商画报',
        author: '严志远',
        avatar: 'https://i.pravatar.cc/240?img=125',
        likes: 543,
        tall: false,
        tag: 'ecommerce'
      },
      {
        id: 12,
        url: 'https://picsum.photos/seed/sports-brand-campaign/400/260',
        title: '运动品牌广告',
        author: '何晓峰',
        avatar: 'https://i.pravatar.cc/240?img=126',
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
        url: 'https://picsum.photos/seed/family-warm-portrait/400/260',
        title: '温馨全家福',
        author: '钟晓燕',
        avatar: 'https://i.pravatar.cc/240?img=127',
        likes: 892,
        tall: false,
        tag: 'family'
      },
      {
        id: 2,
        url: 'https://picsum.photos/seed/newborn-baby-wrapped/400/260',
        title: '新生宝宝写真',
        author: '金晓琪',
        avatar: 'https://i.pravatar.cc/240?img=128',
        likes: 1234,
        tall: true,
        tag: 'newborn'
      },
      {
        id: 3,
        url: 'https://picsum.photos/seed/parent-child-playtime/400/260',
        title: '亲子互动时光',
        author: '石俊伟',
        avatar: 'https://i.pravatar.cc/240?img=129',
        likes: 678,
        tall: false,
        tag: 'kids'
      },
      {
        id: 4,
        url: 'https://picsum.photos/seed/hundred-days-baby/400/260',
        title: '百天纪念写真',
        author: '龙小龙',
        avatar: 'https://i.pravatar.cc/240?img=480',
        likes: 956,
        tall: false,
        tag: 'hundred'
      },
      {
        id: 5,
        url: 'https://picsum.photos/seed/child-growth-record/400/260',
        title: '儿童成长记录',
        author: '冯晓玲',
        avatar: 'https://i.pravatar.cc/240?img=481',
        likes: 723,
        tall: true,
        tag: 'kids'
      },
      {
        id: 6,
        url: 'https://picsum.photos/seed/cute-kid-outdoor-fun/400/260',
        title: '萌娃户外写真',
        author: '唐晓娟',
        avatar: 'https://i.pravatar.cc/240?img=482',
        likes: 1089,
        tall: false,
        tag: 'kids'
      },
      {
        id: 7,
        url: 'https://picsum.photos/seed/one-year-birthday-baby/400/260',
        title: '一周岁抓周',
        author: '白晓峰',
        avatar: 'https://i.pravatar.cc/240?img=483',
        likes: 867,
        tall: false,
        tag: 'hundred'
      },
      {
        id: 8,
        url: 'https://picsum.photos/seed/happy-family-moments/400/260',
        title: '家庭美好时光',
        author: '邱志文',
        avatar: 'https://i.pravatar.cc/240?img=484',
        likes: 543,
        tall: true,
        tag: 'family'
      },
      {
        id: 9,
        url: 'https://picsum.photos/seed/princess-dream-kids/400/260',
        title: '小公主梦幻写真',
        author: '于晓菊',
        avatar: 'https://i.pravatar.cc/240?img=485',
        likes: 1345,
        tall: false,
        tag: 'kids'
      },
      {
        id: 10,
        url: 'https://picsum.photos/seed/three-family-together/400/260',
        title: '三口之家',
        author: '薛志远',
        avatar: 'https://i.pravatar.cc/240?img=486',
        likes: 789,
        tall: false,
        tag: 'family'
      },
      {
        id: 11,
        url: 'https://picsum.photos/seed/newborn-sleeping-peace/400/260',
        title: '新生儿安睡',
        author: '廖晓慧',
        avatar: 'https://i.pravatar.cc/240?img=487',
        likes: 1567,
        tall: false,
        tag: 'newborn'
      },
      {
        id: 12,
        url: 'https://picsum.photos/seed/park-family-outing/400/260',
        title: '公园亲子游',
        author: '段志勇',
        avatar: 'https://i.pravatar.cc/240?img=488',
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
        url: 'https://picsum.photos/seed/bachelor-gown-ceremony/400/260',
        title: '学士服毕业照',
        author: '林毕宁',
        avatar: 'https://i.pravatar.cc/240?img=489',
        likes: 567,
        tall: false,
        tag: 'bachelor'
      },
      {
        id: 2,
        url: 'https://picsum.photos/seed/campus-cherry-blossom/400/260',
        title: '校园樱花季',
        author: '关晓彤',
        avatar: 'https://i.pravatar.cc/240?img=440',
        likes: 834,
        tall: true,
        tag: 'campus'
      },
      {
        id: 3,
        url: 'https://picsum.photos/seed/graduation-ceremony-live/400/260',
        title: '毕业典礼现场',
        author: '刘子骏',
        avatar: 'https://i.pravatar.cc/240?img=441',
        likes: 1023,
        tall: false,
        tag: 'bachelor'
      },
      {
        id: 4,
        url: 'https://picsum.photos/seed/bestfriend-graduation/400/260',
        title: '闺蜜毕业合影',
        author: '方圆',
        avatar: 'https://i.pravatar.cc/240?img=442',
        likes: 756,
        tall: false,
        tag: 'campus'
      },
      {
        id: 5,
        url: 'https://picsum.photos/seed/hanfu-graduation-dress/400/260',
        title: '汉服毕业写真',
        author: '李子轩',
        avatar: 'https://i.pravatar.cc/240?img=443',
        likes: 912,
        tall: true,
        tag: 'hanfu'
      },
      {
        id: 6,
        url: 'https://picsum.photos/seed/library-artistic-mood/400/260',
        title: '图书馆文艺风',
        author: '杨阳',
        avatar: 'https://i.pravatar.cc/240?img=444',
        likes: 445,
        tall: false,
        tag: 'campus'
      },
      {
        id: 7,
        url: 'https://picsum.photos/seed/grad-street-shooting/400/260',
        title: '毕业季街拍',
        author: '赵铭',
        avatar: 'https://i.pravatar.cc/240?img=445',
        likes: 678,
        tall: false,
        tag: 'street'
      },
      {
        id: 8,
        url: 'https://picsum.photos/seed/playground-running-grad/400/260',
        title: '操场奔跑纪念',
        author: '孔晓伟',
        avatar: 'https://i.pravatar.cc/240?img=446',
        likes: 534,
        tall: false,
        tag: 'campus'
      },
      {
        id: 9,
        url: 'https://picsum.photos/seed/hanfu-ancient-style-grad/400/260',
        title: '汉服古风毕业',
        author: '毛志远',
        avatar: 'https://i.pravatar.cc/240?img=447',
        likes: 1123,
        tall: true,
        tag: 'hanfu'
      },
      {
        id: 10,
        url: 'https://picsum.photos/seed/flower-graduation-day/400/260',
        title: '鲜花毕业纪念',
        author: '卢晓燕',
        avatar: 'https://i.pravatar.cc/240?img=448',
        likes: 789,
        tall: false,
        tag: 'campus'
      },
      {
        id: 11,
        url: 'https://picsum.photos/seed/urban-street-grad/400/260',
        title: '城市街头毕业',
        author: '谢志豪',
        avatar: 'https://i.pravatar.cc/240?img=449',
        likes: 456,
        tall: false,
        tag: 'street'
      },
      {
        id: 12,
        url: 'https://picsum.photos/seed/academic-bachelor-photo/400/260',
        title: '学院派学士照',
        author: '邓晓燕',
        avatar: 'https://i.pravatar.cc/240?img=150',
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
        url: 'https://picsum.photos/seed/dali-yunnan-travel/400/260',
        title: '云南大理旅拍',
        author: '白志远',
        avatar: 'https://i.pravatar.cc/240?img=47',
        likes: 1234,
        tall: false,
        tag: 'domestic'
      },
      {
        id: 2,
        url: 'https://picsum.photos/seed/maldives-ocean-beach/400/260',
        title: '马尔代夫海边',
        author: '田晓春',
        avatar: 'https://i.pravatar.cc/240?img=11',
        likes: 2341,
        tall: true,
        tag: 'beach'
      },
      {
        id: 3,
        url: 'https://picsum.photos/seed/lhasa-potala-palace/400/260',
        title: '拉萨布达拉宫',
        author: '翁晓燕',
        avatar: 'https://i.pravatar.cc/240?img=12',
        likes: 987,
        tall: false,
        tag: 'domestic'
      },
      {
        id: 4,
        url: 'https://picsum.photos/seed/qinghai-lake-scenic/400/260',
        title: '青海湖旅拍',
        author: '梁志文',
        avatar: 'https://i.pravatar.cc/240?img=48',
        likes: 1567,
        tall: false,
        tag: 'domestic'
      },
      {
        id: 5,
        url: 'https://picsum.photos/seed/bali-sunset-golden/400/260',
        title: '巴厘岛日落',
        author: '覃晓',
        avatar: 'https://i.pravatar.cc/240?img=44',
        likes: 1892,
        tall: true,
        tag: 'abroad'
      },
      {
        id: 6,
        url: 'https://picsum.photos/seed/provence-lavender-field/400/260',
        title: '普罗旺斯薰衣草',
        author: '章子怡',
        avatar: 'https://i.pravatar.cc/240?img=15',
        likes: 2156,
        tall: false,
        tag: 'abroad'
      },
      {
        id: 7,
        url: 'https://picsum.photos/seed/wuzhen-ancient-town/400/260',
        title: '乌镇古镇风情',
        author: '范冰冰',
        avatar: 'https://i.pravatar.cc/240?img=20',
        likes: 789,
        tall: false,
        tag: 'town'
      },
      {
        id: 8,
        url: 'https://picsum.photos/seed/sanya-beach-holiday/400/260',
        title: '三亚海边度假',
        author: '刘诗诗',
        avatar: 'https://i.pravatar.cc/240?img=25',
        likes: 1456,
        tall: false,
        tag: 'beach'
      },
      {
        id: 9,
        url: 'https://picsum.photos/seed/paris-eiffel-tower/400/260',
        title: '巴黎埃菲尔铁塔',
        author: '李小璐',
        avatar: 'https://i.pravatar.cc/240?img=30',
        likes: 3241,
        tall: true,
        tag: 'abroad'
      },
      {
        id: 10,
        url: 'https://picsum.photos/seed/xitang-water-village/400/260',
        title: '西塘古镇漫步',
        author: '唐嫣',
        avatar: 'https://i.pravatar.cc/240?img=470',
        likes: 654,
        tall: false,
        tag: 'town'
      },
      {
        id: 11,
        url: 'https://picsum.photos/seed/iceland-aurora-night/400/260',
        title: '冰岛极光旅拍',
        author: '赵薇',
        avatar: 'https://i.pravatar.cc/240?img=471',
        likes: 4523,
        tall: false,
        tag: 'abroad'
      },
      {
        id: 12,
        url: 'https://picsum.photos/seed/italy-coast-amalfi/400/260',
        title: '意大利海岸线',
        author: '孙俪',
        avatar: 'https://i.pravatar.cc/240?img=472',
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
        url: 'https://picsum.photos/seed/annual-gala-moment/400/260',
        title: '企业年会精彩瞬间',
        author: '黄海冰',
        avatar: 'https://i.pravatar.cc/240?img=473',
        likes: 345,
        tall: false,
        tag: 'annual'
      },
      {
        id: 2,
        url: 'https://picsum.photos/seed/new-product-launch-event/400/260',
        title: '新品发布会现场',
        author: '许晴',
        avatar: 'https://i.pravatar.cc/240?img=474',
        likes: 567,
        tall: true,
        tag: 'launch'
      },
      {
        id: 3,
        url: 'https://picsum.photos/seed/international-expo-hall/400/260',
        title: '国际展览会',
        author: '辛晓琪',
        avatar: 'https://i.pravatar.cc/240?img=475',
        likes: 289,
        tall: false,
        tag: 'expo'
      },
      {
        id: 4,
        url: 'https://picsum.photos/seed/awards-ceremony-night/400/260',
        title: '年度颁奖典礼',
        author: '蔡依林',
        avatar: 'https://i.pravatar.cc/240?img=476',
        likes: 678,
        tall: false,
        tag: 'annual'
      },
      {
        id: 5,
        url: 'https://picsum.photos/seed/tech-expo-display/400/260',
        title: '科技博览会',
        author: '王力宏',
        avatar: 'https://i.pravatar.cc/240?img=477',
        likes: 412,
        tall: true,
        tag: 'expo'
      },
      {
        id: 6,
        url: 'https://picsum.photos/seed/charity-public-event/400/260',
        title: '公益慈善活动',
        author: '周华健',
        avatar: 'https://i.pravatar.cc/240?img=478',
        likes: 534,
        tall: false,
        tag: 'charity'
      },
      {
        id: 7,
        url: 'https://picsum.photos/seed/outdoor-music-festival/400/260',
        title: '户外音乐节',
        author: '齐秦',
        avatar: 'https://i.pravatar.cc/240?img=479',
        likes: 892,
        tall: false,
        tag: 'annual'
      },
      {
        id: 8,
        url: 'https://picsum.photos/seed/launch-conference-scene/400/260',
        title: '产品发布会',
        author: '林志炫',
        avatar: 'https://i.pravatar.cc/240?img=110',
        likes: 456,
        tall: false,
        tag: 'launch'
      },
      {
        id: 9,
        url: 'https://picsum.photos/seed/forum-summit-stage/400/260',
        title: '论坛峰会现场',
        author: '张惠妹',
        avatar: 'https://i.pravatar.cc/240?img=111',
        likes: 234,
        tall: true,
        tag: 'launch'
      },
      {
        id: 10,
        url: 'https://picsum.photos/seed/community-welfare-act/400/260',
        title: '社区公益活动',
        author: '苏慧伦',
        avatar: 'https://i.pravatar.cc/240?img=112',
        likes: 567,
        tall: false,
        tag: 'charity'
      },
      {
        id: 11,
        url: 'https://picsum.photos/seed/auto-show-exhibition/400/260',
        title: '汽车展览会',
        author: '那英',
        avatar: 'https://i.pravatar.cc/240?img=113',
        likes: 378,
        tall: false,
        tag: 'expo'
      },
      {
        id: 12,
        url: 'https://picsum.photos/seed/stage-lighting-gala/400/260',
        title: '年会舞台灯光',
        author: '孟庭苇',
        avatar: 'https://i.pravatar.cc/240?img=114',
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
        url: 'https://picsum.photos/seed/luxury-watch-product/400/260',
        title: '高级手表产品图',
        author: '柴静',
        avatar: 'https://i.pravatar.cc/240?img=115',
        likes: 567,
        tall: false,
        tag: 'fashion'
      },
      {
        id: 2,
        url: 'https://picsum.photos/seed/makeup-cosmetics-flat/400/260',
        title: '美妆产品精拍',
        author: '朱迅',
        avatar: 'https://i.pravatar.cc/240?img=116',
        likes: 834,
        tall: true,
        tag: 'beauty'
      },
      {
        id: 3,
        url: 'https://picsum.photos/seed/sneakers-main-shoot/400/260',
        title: '运动鞋主图拍摄',
        author: '白岩松',
        avatar: 'https://i.pravatar.cc/240?img=117',
        likes: 1023,
        tall: false,
        tag: 'fashion'
      },
      {
        id: 4,
        url: 'https://picsum.photos/seed/sports-shoe-advert/400/260',
        title: '耐克产品广告',
        author: '郎咸平',
        avatar: 'https://i.pravatar.cc/240?img=118',
        likes: 1456,
        tall: false,
        tag: 'fashion'
      },
      {
        id: 5,
        url: 'https://picsum.photos/seed/coffee-drink-premium/400/260',
        title: '精品咖啡饮品',
        author: '马未都',
        avatar: 'https://i.pravatar.cc/240?img=119',
        likes: 678,
        tall: true,
        tag: 'food'
      },
      {
        id: 6,
        url: 'https://picsum.photos/seed/skincare-flatlay-shot/400/260',
        title: '护肤品摆拍',
        author: '曾子墨',
        avatar: 'https://i.pravatar.cc/240?img=120',
        likes: 912,
        tall: false,
        tag: 'beauty'
      },
      {
        id: 7,
        url: 'https://picsum.photos/seed/earphone-detail-tech/400/260',
        title: '数码耳机精拍',
        author: '鲁豫',
        avatar: 'https://i.pravatar.cc/240?img=121',
        likes: 534,
        tall: false,
        tag: 'tech'
      },
      {
        id: 8,
        url: 'https://picsum.photos/seed/flagship-phone-shoot/400/260',
        title: '旗舰手机产品',
        author: '朱军',
        avatar: 'https://i.pravatar.cc/240?img=122',
        likes: 789,
        tall: false,
        tag: 'tech'
      },
      {
        id: 9,
        url: 'https://picsum.photos/seed/food-styling-ingredient/400/260',
        title: '精品食材拍摄',
        author: '撒贝宁',
        avatar: 'https://i.pravatar.cc/240?img=123',
        likes: 345,
        tall: true,
        tag: 'food'
      },
      {
        id: 10,
        url: 'https://picsum.photos/seed/handbag-fashion-main/400/260',
        title: '时尚包包主图',
        author: '李詠',
        avatar: 'https://i.pravatar.cc/240?img=124',
        likes: 1123,
        tall: false,
        tag: 'fashion'
      },
      {
        id: 11,
        url: 'https://picsum.photos/seed/perfume-bottle-luxury/400/260',
        title: '香水瓶高级感',
        author: '高晓松',
        avatar: 'https://i.pravatar.cc/240?img=125',
        likes: 867,
        tall: false,
        tag: 'beauty'
      },
      {
        id: 12,
        url: 'https://picsum.photos/seed/laptop-detail-product/400/260',
        title: '笔记本电脑精拍',
        author: '窦文涛',
        avatar: 'https://i.pravatar.cc/240?img=126',
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
