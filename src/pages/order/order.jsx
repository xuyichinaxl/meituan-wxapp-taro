import Taro, { Component } from '@tarojs/taro'
import { connect } from '@tarojs/redux'
import { View, Swiper, SwiperItem, ScrollView, Text } from '@tarojs/components'
import LoadMore from '../../components/loadMore/loadMore'
import Refresh from '../../components/refresh/refresh'
import Navbar from '../../components/navBar/navBar'
import OrderList from '../../components/orderList/orderList'
import './order.scss'

@connect(({ globalData }) => ({
  globalData
}))
class Order extends Component {
  static loadMore = false
  static switchTime = null

  constructor() {
    super(...arguments)

    this.state = {
      referrer: this.$router.params.referrer,
      tab: [
        {
          name: '全部',
          noMore: false,
          pageIndex: 1,
          list: [],
          status: '',
          init: false,
          refresh: false
        },
        {
          name: '待付款',
          noMore: false,
          pageIndex: 1,
          list: [],
          status: 'awaiting_payment',
          init: false,
          refresh: false
        },
        {
          name: '待发货',
          noMore: false,
          pageIndex: 1,
          list: [],
          status: 'processing',
          init: false,
          refresh: false
        },
        {
          name: '待收货',
          noMore: false,
          pageIndex: 1,
          list: [],
          status: 'dispatched',
          init: false,
          refresh: false
        },
        {
          name: '待评论',
          noMore: false,
          pageIndex: 1,
          list: [],
          status: 'feedback',
          init: false,
          refresh: false
        },
        {
          name: '退款',
          noMore: false,
          pageIndex: 1,
          list: [],
          status: 'refunded',
          init: false,
          refresh: false
        }
      ],
      current: isNaN(Number(this.$router.params.type)) ? 0 : Number(this.$router.params.type),
      menuTop: ''
    }
  }

  componentWillMount() {
    this.getOrderList()
  }

  componentDidMount() {
    setTimeout(() => {
      const query = Taro.createSelectorQuery()
      query
        .select('.swiper')
        .boundingClientRect()
        .exec(res => {
          this.setState({
            menuTop: res[0].top
          })
        })
    }, 0)
  }

  componentWillUnmount() {}

  componentDidShow() {}

  componentDidHide() {}

  switchCate(e) {
    this.switchTime = Date.now()
    new Promise((resolve, reject) => {
      if (e.detail.source === 'touch') {
        this.setState(
          {
            current: e.detail.current
          },
          () => {
            resolve()
          }
        )
      } else {
        resolve()
      }
    }).then(() => {
      if (!this.state.tab[e.detail.current].init) {
        this.getOrderList('delay')
      }
    })
  }

  setCurrent(i) {
    this.setState({
      current: i
    })
  }

  getOrderList(type) {
    if (type === 'loadMore' && this.loadMore) {
      return
    }
    this.loadMore = true
    let tabItem = this.state.tab[this.state.current]
    if (type === 'refresh') {
      tabItem.noMore = false
      tabItem.pageIndex = 1
      tabItem.list = []
      tabItem.refresh = false
    }
    if (tabItem.noMore) {
      return
    }
    Taro.$http({ url: `/orders`, data: { page_index: tabItem.pageIndex, page_size: 20, status: tabItem.status } })
      .then(res => {
        if (tabItem.pageIndex * 20 >= res.total) {
          tabItem.noMore = true
        } else {
          tabItem.pageIndex++
        }
        tabItem.init = true
        tabItem.list = tabItem.list.concat(res.orders)
        if (type === 'delay') {
          let time = Date.now() - this.switchTime
          time = time > 500 ? 0 : 500 - time
          setTimeout(() => {
            this.setState({
              tab: this.state.tab
            })
          }, time)
        } else {
          this.setState({
            tab: this.state.tab
          })
        }
      })
      .finally(() => {
        if (type === 'delay') {
          let time = Date.now() - this.switchTime
          time = time > 500 ? 0 : 500 - time
          setTimeout(() => {
            Taro.nextTick(() => {
              this.loadMore = false
            })
          }, time)
        } else {
          Taro.nextTick(() => {
            this.loadMore = false
          })
        }
      })
  }

  refresherRefresh(e) {
    let tabItem = this.state.tab[this.state.current]
    tabItem.refresh = true
    this.setState(
      {
        tab: this.state.tab
      },
      () => {
        this.getOrderList('refresh')
      }
    )
  }

  render() {
    return (
      <View className="order">
        <Navbar title="订单" referrer={this.state.referrer}></Navbar>
        {/* <wxs module='orderRefresh' src='./orderRefresh.wxs'></wxs> */}
        <View className="menu">
          {this.state.tab.map((item, index) => {
            return (
              <View
                key={index}
                taroKey={index}
                className={this.state.current === index ? 'active' : ''}
                onClick={this.setCurrent.bind(this, index)}
              >
                {item.name}
              </View>
            )
          })}
        </View>
        <Swiper
          className="swiper"
          style={`height: calc(100vh - ${this.state.menuTop}PX)`}
          onChange={this.switchCate}
          current={this.state.current}
        >
          {this.state.tab.map(item => {
            return (
              <SwiperItem key={item.name} taroKey={item.name} className="swiper-item">
                <ScrollView
                  scrollY
                  className="sw-scroll"
                  onScrollToLower={this.getOrderList.bind(this, 'loadMore')}
                  lowerThreshold={50}
                  refresherEnabled
                  refresherThreshold={50}
                  // onTest={this.refresherPulling}
                  // onRefresherPulling='{{orderRefresh.refresherPulling}}'
                  onRefresherRefresh={this.refresherRefresh.bind(this)}
                  refresherDefaultStyle="none"
                  refresherTriggered={item.refresh}
                >
                  <View className="sw-scroll-blank"></View>
                  <Refresh refresh={item.refresh}></Refresh>
                  <OrderList orderList={item.list}></OrderList>
                  {!item.refresh && <LoadMore noMore={item.noMore}></LoadMore>}
                </ScrollView>
              </SwiperItem>
            )
          })}
        </Swiper>
      </View>
    )
  }
}

export default Order
