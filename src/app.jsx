import Taro, { Component } from '@tarojs/taro'
import { Provider, connect } from '@tarojs/redux'
import request from './utils/request'
import Index from './pages/index'
import { openSocket } from './utils/ws'
import store from './store'
import { onSetStatusBarHeight, onSetSystemInfo, onSetCartsData } from './actions/global'

import './app.scss'

Taro.$http = request

// 如果需要在 h5 环境中开启 React Devtools
// 取消以下注释：
// if (process.env.NODE_ENV !== 'production' && process.env.TARO_ENV === 'h5')  {
//   require('nerv-devtools')
// }

// const store = configStore()
@connect(
  ({ globalData }) => ({
    globalData
  }),
  dispatch => ({
    onSetStatusBarHeight(height) {
      dispatch(onSetStatusBarHeight(height))
    },
    onSetSystemInfo(systemInfo) {
      dispatch(onSetSystemInfo(systemInfo))
    },
    onSetCartsData(carts) {
      dispatch(onSetCartsData(carts))
    }
  })
)
class App extends Component {
  config = {
    pages: [
      'pages/home/home',
      'pages/index/index',
      'pages/settleIn/settleIn',
      'pages/message/message',
      'pages/store/store',
      'pages/cart/cart',
      'pages/me/me',
      'pages/product/product',
      'pages/submitOrder/submitOrder',
      'pages/photoList/photoList',
      'pages/orderDetail/orderDetail',
      'pages/storeMessage/storeMessage',
      'pages/collect/collect',
      'pages/pug/pug',
      'pages/assess/assess',
      'pages/dynamicDetail/dynamicDetail',
      'pages/order/order',
      'pages/setting/setting',
      'pages/addressList/addressList',
      'pages/editAddress/editAddress',
      'pages/login/login',
      'pages/register/register',
      'pages/webview/webview'
    ],
    window: {
      navigationStyle: 'custom',
      backgroundTextStyle: 'light',
      navigationBarBackgroundColor: '#fff',
      navigationBarTitleText: 'WeChat',
      navigationBarTextStyle: 'black'
    },
    tabBar: {
      borderStyle: 'white',
      selectedColor: '#f7cc62',
      list: [
        {
          pagePath: 'pages/home/home',
          text: '首页',
          iconPath: 'assets/img/icon_home.png',
          selectedIconPath: 'assets/img/icon_home_active.png'
        },
        {
          pagePath: 'pages/cart/cart',
          text: '购物车',
          iconPath: 'assets/img/icon_shop_cart.png',
          selectedIconPath: 'assets/img/icon_shop_cart_active.png'
        },
        {
          pagePath: 'pages/message/message',
          text: '消息',
          iconPath: 'assets/img/icon_contact.png',
          selectedIconPath: 'assets/img/icon_contact_active.png'
        },
        {
          pagePath: 'pages/me/me',
          text: '我的',
          iconPath: 'assets/img/icon_info.png',
          selectedIconPath: 'assets/img/icon_info_active.png'
        }
      ]
    }
  }

  componentWillMount() {
    this.props.onSetCartsData({ items: [] })
  }

  componentDidMount() {
    openSocket(this.props.globalData.userInfo.access_token)

    Taro.getSystemInfo({}).then(res => {
      this.props.onSetStatusBarHeight(res.statusBarHeight || 0)
      this.props.onSetSystemInfo(res)
    })
  }

  componentDidShow() {}

  componentDidHide() {}

  componentDidCatchError() {}

  // 在 App 类中的 render() 函数没有实际作用
  // 请勿修改此函数
  render() {
    return (
      <Provider store={store}>
        <Index />
      </Provider>
    )
  }
}

Taro.render(<App />, document.getElementById('app'))
