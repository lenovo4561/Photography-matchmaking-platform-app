import { defineUniPages } from '@uni-helper/vite-plugin-uni-pages'

export default defineUniPages({
  pages: [],
  globalStyle: {
    navigationBarBackgroundColor: '#ffffff',
    navigationBarTextStyle: 'black',
    navigationBarTitleText: '摄影匹配平台'
  },
  tabBar: {
    custom: true,
    color: '#999999',
    selectedColor: '#ff6b35',
    borderStyle: 'white',
    backgroundColor: '#ffffff',
    list: [
      {
        pagePath: 'pages/index/index',
        text: '首页',
        iconPath: 'static/tab/home.png',
        selectedIconPath: 'static/tab/homeActive.png'
      },
      {
        pagePath: 'pages/discover/index',
        text: '发现',
        iconPath: 'static/tab/discover.png',
        selectedIconPath: 'static/tab/discoverActive.png'
      },
      {
        pagePath: 'pages/message/index',
        text: '消息',
        iconPath: 'static/tab/message.png',
        selectedIconPath: 'static/tab/messageActive.png'
      },
      {
        pagePath: 'pages/profile/index',
        text: '我的',
        iconPath: 'static/tab/profile.png',
        selectedIconPath: 'static/tab/profileActive.png'
      }
    ]
  },
  easycom: {
    autoscan: true,
    custom: {
      '^wd-(.*)': 'wot-design-uni/components/wd-$1/wd-$1.vue',
      '^(?!z-paging-refresh|z-paging-load-more)z-paging(.*)': 'z-paging/components/z-paging$1/z-paging$1.vue'
    }
  }
})
