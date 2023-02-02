import Taro, { Component } from '@tarojs/taro'
import { connect } from '@tarojs/redux'
import { View, Swiper, SwiperItem, Image, ScrollView, Text } from '@tarojs/components'
import { onUpdateSocketShop } from '../../actions/socket'
import Navbar from '../../components/navBar/navBar'
import Dynamic from '../../components/dynamic/dynamic'
import Loading from '../../components/loading/loading'
import LoadMore from '../../components/loadMore/loadMore'
import Refresh from '../../components/refresh/refresh'
import './home.scss'

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
class Home extends Component {
  constructor() {
    super(...arguments)
    this.loadMore = false
    this.state = {
      bannerList: [],
      visitedList: [],
      moments: [],
      pageIndex: 1,
      noMore: false,
      loading: true,
      refresh: false
    }
  }

  componentWillMount() {
    this.loadMoments()
    this.getBanner()
  }

  componentDidMount() {
    this.setState({
      navbarHeight:
        this.props.globalData.systemInfo.statusBarHeight +
        (this.props.globalData.systemInfo.system.indexOf('Adr') > -1 ? 48 : 44)
    })
  }

  componentWillUnmount() {}

  componentDidShow() {
    let lastTime = Taro.getStorageSync('homeUpdateTime') || Date.now()
    if (Date.now() - lastTime > 600000) {
      this.loadMoments('refresh')
    }
    Taro.getStorage({
      key: 'visitedList',
      success: res => {
        let hashMap = {}
        let visitedList = []
        res.data.map(item => {
          if (!hashMap[item.id]) {
            visitedList.push(item)
            hashMap[item.id] = true
          }
        })
        visitedList = visitedList.slice(0, 10)
        Taro.setStorage({
          key: 'visitedList',
          data: visitedList
        })
        this.setState({
          visitedList: visitedList.slice(0, 4)
        })
      },
      fail: () => {
        // should not happen
        // this.setState({
        //   visitedList: []
        // })
      }
    })
    this.props.onUpdateSocketShop()
  }

  componentDidHide() {}

  loadMoments(type) {
    if (this.loadMore) return
    this.loadMore = true
    let { pageIndex, noMore, moments } = this.state
    if (type === 'refresh') {
      pageIndex = 1
      noMore = false
      moments = []
    }
    if (noMore) {
      this.loadMore = false
      return
    }

    Taro.$http({ url: '/moments', data: { page_index: pageIndex, page_size: 20 } })
      .then(res => {
        if (pageIndex === 1) {
          Taro.setStorage({
            key: 'homeUpdateTime',
            data: Date.now()
          })
        }
        if (pageIndex * 20 >= res.total) {
          noMore = true
        } else {
          pageIndex++
        }
        this.setState({
          moments: res.moments.concat(moments),
          noMore: noMore,
          pageIndex: pageIndex,
          loading: false,
          refresh: false
        })
      })
      .finally(() => {
        this.loadMore = false
      })
  }

  getBanner() {
    Taro.$http({ url: '/home_banners' }).then(res => {
      this.setState({
        bannerList: res
      })
    })
  }

  refresherRefresh(e) {
    this.setState(
      {
        refresh: true
      },
      () => {
        this.loadMoments('refresh')
      }
    )
  }

  toStore(id) {
    Taro.navigateTo({
      url: '/pages/store/store?id=' + id
    })
  }

  toPug() {
    Taro.navigateTo({
      url: '/pages/pug/pug'
    })
  }

  openUrl(url) {
    Taro.navigateTo({
      url: '/pages/webview/webview?url=' + url
    })
  }

  render() {
    const { moments, refresh, navbarHeight, visitedList } = this.state
    return (
      <View className="home">
        <Navbar title="首页" needBack={false}></Navbar>
        {this.state.loading ? (
          <Loading></Loading>
        ) : (
          // <View className='scroll-box'>
          <ScrollView
            className="scroll"
            style={`height:calc(100vh - ${navbarHeight}px)`}
            scrollY
            refresherEnabled
            refresherThreshold={50}
            onRefresherRefresh={this.refresherRefresh.bind(this)}
            refresherDefaultStyle="none"
            refresherTriggered={refresh}
            onScrollToLower={this.loadMoments.bind(this)}
            lowerThreshold={50}
          >
            <View className="scroll-blank"></View>
            <Refresh refresh={this.state.refresh}></Refresh>
            {visitedList && visitedList.length > 0 && (
              <View className="card-item">
                <View className="card-item-head">
                  <Text className="card-item-head-tit">最近访问</Text>
                  <Text className="card-item-head-all" onClick={this.toPug}>
                    更多
                  </Text>
                </View>
                <View className="card-item-order">
                  {visitedList.map(item => {
                    return (
                      <View
                        key={item.id}
                        taroKey={item.id}
                        className="card-item-order-li"
                        onClick={this.toStore.bind(this, item.id)}
                      >
                        <Image src={item.icon}></Image>
                        <View>{item.name}</View>
                      </View>
                    )
                  })}
                </View>
              </View>
            )}
            <Swiper
              className="swiper"
              indicatorColor="rgba(255, 255, 255, .3)"
              indicatorActiveColor="#fff"
              circular
              indicatorDots
              autoplay
            >
              {this.state.bannerList.map(item => {
                return (
                  <SwiperItem key={item.image} taroKey={item.image}>
                    <Image
                      className="swiper-img"
                      mode="aspectFill"
                      src={item.image}
                      onClick={this.openUrl.bind(this, item.url)}
                    ></Image>
                  </SwiperItem>
                )
              })}
            </Swiper>
            <View className="dynamic-title">商家动态</View>
            {moments.map(item => {
              return (
                <View key={item.id} taroKey={item.id} className="dynamic-card">
                  <Dynamic isHome momentData={item}></Dynamic>
                </View>
              )
            })}
            <LoadMore noMore={this.state.noMore}></LoadMore>
          </ScrollView>
          // </View>
        )}
      </View>
    )
  }
}

export default Home
