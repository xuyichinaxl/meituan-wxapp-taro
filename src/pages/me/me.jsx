import Taro, { Component } from '@tarojs/taro'
import { connect } from '@tarojs/redux'
import { View, Image, Text, ScrollView } from '@tarojs/components'
import { onUpdateSocketShop } from '../../actions/socket'
import Navbar from '../../components/navBar/navBar'
import Refresh from '../../components/refresh/refresh'
import './me.scss'
import icoBookmarks from '../../assets/img/bookmarks.png'
import icoTrail from '../../assets/img/trail.png'
import icoSetting from '../../assets/img/setting.png'
import icoContact from '../../assets/img/contact.png'
import icoStore from '../../assets/img/store.png'
import icoWallet from '../../assets/img/wallet.png'
import icoFeedback from '../../assets/img/feedback.png'
import icoTruck from '../../assets/img/truck.png'
import icoPack from '../../assets/img/pack.png'

@connect(
  ({ globalData }) => ({
    globalData
  }),
  dispatch => ({
    onUpdateSocketShop(key) {
      dispatch(onUpdateSocketShop(key))
    }
  })
)
class Me extends Component {
  constructor() {
    super(...arguments)
    this.state = {
      refresh: false,
      userInfo: {}
    }
  }

  componentDidMount() {
    this.getMineInfo()
    this.setState({
      navbarHeight:
        this.props.globalData.systemInfo.statusBarHeight +
        (this.props.globalData.systemInfo.system.indexOf('Adr') > -1 ? 48 : 44)
    })
  }

  componentWillUnmount() {}

  componentDidShow() {
    let lastTime = Taro.getStorageSync('meUpdateTime') || Date.now()
    if (Date.now() - lastTime > 900000) {
      this.getMineInfo()
    }
    if (!this.props.globalData.userInfo.access_token) {
      Taro.removeTabBarBadge({
        index: 2
      })
    }
    this.props.onUpdateSocketShop()
  }

  componentDidHide() {}

  pageTo(url) {
    if (!this.state.userInfo.nickname) {
      Taro.showModal({
        title: '尚未登录',
        content: '请登录后再执行该操作',
        confirmText: '登录',
        success: res => {
          if (res.confirm) {
            Taro.navigateTo({
              url: '/pages/login/login'
            })
          }
        }
      })
    } else {
      Taro.navigateTo({
        url: url
      })
    }
  }

  getMineInfo() {
    // 调用接口
    Taro.$http({ url: '/profile', noModal: true })
      .then(res => {
        this.setState({
          userInfo: res
        })
      })
      .finally(() => {
        this.setState({
          refresh: false
        })
      })
  }

  refresherRefresh() {
    this.setState(
      {
        refresh: true
      },
      () => {
        this.getMineInfo()
      }
    )
  }

  toLogin() {
    if (!this.props.globalData.userInfo.access_token) {
      Taro.navigateTo({
        url: '/pages/login/login'
      })
    }
  }

  render() {
    const { refresh, navbarHeight, userInfo } = this.state
    return (
      <View className="me">
        <Navbar title="个人中心" needBack={false}></Navbar>
        {/* <View className='scroll-box'> */}
        <ScrollView
          className="box"
          style={`height:calc(100vh - ${navbarHeight}px)`}
          scrollY
          refresherEnabled={userInfo.nickname}
          refresherThreshold={50}
          onRefresherRefresh={this.refresherRefresh.bind(this)}
          refresherDefaultStyle="none"
          refresherTriggered={refresh}
        >
          <View className="box-blank"></View>
          <Refresh refresh={refresh}></Refresh>
          <View className="me-header">
            <Image
              src={userInfo.avatar || 'https://images.liqucn.com/img/h1/h994/img201802021024070_info300X300.jpg'}
            ></Image>
            <View onClick={this.toLogin.bind(this)}>{userInfo.nickname || '登录'}</View>
          </View>
          <View className="me-card">
            <View className="card-item">
              <View className="card-item-head">
                <Text className="card-item-head-tit">订单</Text>
                <Text className="card-item-head-all" onClick={this.pageTo.bind(this, '/pages/order/order?type=0')}>
                  查看全部
                </Text>
              </View>
              <View className="card-item-order">
                <View className="card-item-order-li" onClick={this.pageTo.bind(this, '/pages/order/order?type=1')}>
                  <Image src={icoWallet}></Image>
                  <View>待付款</View>
                </View>
                <View className="card-item-order-li" onClick={this.pageTo.bind(this, '/pages/order/order?type=2')}>
                  <Image src={icoPack}></Image>
                  <View>待发货</View>
                </View>
                <View className="card-item-order-li" onClick={this.pageTo.bind(this, '/pages/order/order?type=3')}>
                  <Image src={icoTruck}></Image>
                  <View>待收货</View>
                </View>
                <View className="card-item-order-li" onClick={this.pageTo.bind(this, '/pages/order/order?type=4')}>
                  <Image src={icoFeedback}></Image>
                  <View>评价</View>
                </View>
              </View>
            </View>
            <View className="card-item">
              <View className="card-item-head">
                <Text className="card-item-head-tit">我的功能</Text>
              </View>
              <View className="card-item-order">
                <View className="card-item-order-li" onClick={this.pageTo.bind(this, '/pages/addressList/addressList')}>
                  <Image src={icoContact}></Image>
                  <View>地址簿</View>
                </View>
                <View className="card-item-order-li" onClick={this.pageTo.bind(this, '/pages/collect/collect')}>
                  <Image src={icoBookmarks}></Image>
                  <View>收藏</View>
                </View>
                <View className="card-item-order-li" onClick={this.pageTo.bind(this, '/pages/pug/pug')}>
                  <Image src={icoTrail}></Image>
                  <View>足迹</View>
                </View>
                <View className="card-item-order-li" onClick={this.pageTo.bind(this, '/pages/setting/setting')}>
                  <Image src={icoSetting}></Image>
                  <View>设置</View>
                </View>
                <View className="card-item-order-li" onClick={this.pageTo.bind(this, '/pages/settleIn/settleIn')}>
                  <Image src={icoStore}></Image>
                  <View>开店</View>
                </View>
              </View>
            </View>
          </View>
        </ScrollView>
        {/* </View> */}
      </View>
    )
  }
}

export default Me
