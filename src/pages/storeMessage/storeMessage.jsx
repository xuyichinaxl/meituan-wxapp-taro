import Taro, { Component } from '@tarojs/taro'
import { connect } from '@tarojs/redux'
import { View, Image, Text, ScrollView } from '@tarojs/components'
import Navbar from '../../components/navBar/navBar'
import { onSetSocketRead, onSetSocketClear } from '../../actions/socket'
import { dateFormat, getUTCDate } from '../../utils/util'
import { updateMessageStatus } from '../../utils/ws'
import message1 from '../../assets/img/message_1.png'
import message2 from '../../assets/img/message_2.png'
import './storeMessage.scss'

@connect(
  ({ globalData, socket }) => ({
    globalData,
    socket
  }),
  dispatch => ({
    onSetSocketRead(key) {
      dispatch(onSetSocketRead(key))
    },
    onSetSocketClear(key) {
      dispatch(onSetSocketClear(key))
    }
  })
)
class StoreMessage extends Component {
  constructor() {
    super(...arguments)
    this.loadingData = false
    this.scrollDiff = 0
    this.scrollViewHeight = 0
    this.msgList = []
    this.state = {
      shop: {},
      currList: [],
      pagination: -1,
      loading: true
    }
  }

  componentDidMount() {
    const socketData = this.props.socket.socketShopList.get(this.$router.params.id)
    this.msgList = socketData ? socketData.readList.concat(socketData.msgList) : []
    if (this.msgList.length > 0) {
      const state = {
        loading: false,
        shop: socketData.shop,
        currList: this.msgList,
        pagination: 0,
        navbarHeight:
          this.props.globalData.systemInfo.statusBarHeight +
          (this.props.globalData.systemInfo.system.indexOf('Adr') > -1 ? 48 : 44)
      }
      if (this.msgList.length > 50) {
        state.pagination = this.msgList.length - 50
        state.currList = this.msgList.slice(state.pagination)
      }
      state.scrollIntoViewId = 'msg' + state.currList[state.currList.length - 1].timestamp
      this.updateMessageStatus(state.currList[state.currList.length - 1])
      this.setState(state, () => {
        this.calcScrollViewHeight()
      })
    } else {
      this.setState({
        shop: socketData.shop,
        loading: false
      })
    }
  }

  componentWillReceiveProps(nextProps) {
    const nextSocketData = nextProps.socket.socketShopList.get(this.$router.params.id)
    if (nextSocketData) {
      const nextList = nextSocketData.readList.concat(nextSocketData.msgList)
      if (nextList.length > this.msgList.length) {
        this.msgList = nextList.concat([])
        const state = {
          currList: this.msgList
        }
        if (this.state.pagination) {
          state.currList = this.msgList.slice(this.state.pagination)
        }
        if (this.scrollDiff < this.scrollViewHeight + 50) {
          state.scrollIntoViewId = 'msg' + state.currList[state.currList.length - 1].timestamp
        }
        this.updateMessageStatus(state.currList[state.currList.length - 1])
        this.setState(state)
      }
    } else {
      this.msgList = []
      this.setState({
        currList: [],
        pagination: 0
      })
    }
  }

  componentWillUnmount() {}

  componentDidShow() {}

  componentDidHide() {}

  calcScrollViewHeight() {
    const query = Taro.createSelectorQuery()
    query
      .select('.box')
      .boundingClientRect()
      .exec(res => {
        this.scrollViewHeight = res[0].height
      })
  }

  toStore() {
    Taro.navigateTo({
      url: '/pages/store/store?id=' + this.state.shop.id
    })
  }

  onScrollToUpper() {
    if (this.loadingData || this.state.currList.length === 0) return
    this.loadingData = true
    const newPagination = this.state.pagination - 50
    const scrollIntoViewId = 'msg' + this.state.currList[0].timestamp
    const state = {
      pagination: 0,
      scrollIntoViewId: scrollIntoViewId,
      currList: this.msgList
    }
    if (newPagination > 0) {
      state.pagination = newPagination
      state.currList = state.currList.slice(newPagination)
    }
    this.setState(state, () => {
      this.loadingData = false
    })
  }

  onScroll(e) {
    this.scrollDiff = e.detail.scrollHeight - e.detail.scrollTop
  }

  updateMessageStatus(message) {
    const { type, id } = this.$router.params
    this.props.onSetSocketRead(type === 'shop' ? id : type)
    updateMessageStatus({
      until: getUTCDate(message.timestamp),
      status: 'read',
      type: this.$router.params.type,
      from: message.from_type === 'shop' ? message.from : ''
    })
  }

  clear() {
    Taro.showModal({
      title: '提示',
      content: '确认清空消息？',
      success: res => {
        if (res.confirm) {
          this.props.onSetSocketClear(
            this.$router.params.type === 'shop' ? this.$router.params.id : this.$router.params.type
          )
        }
      }
    })
  }

  messagePage(item) {
    if (item.type === 'order') {
      Taro.navigateTo({
        url: '/pages/orderDetail/orderDetail?id=' + item.ref
      })
    } else {
      Taro.navigateTo({
        url: '/pages/dynamicDetail/dynamicDetail?id=' + item.ref
      })
    }
  }

  render() {
    const { navbarHeight, shop, currList, scrollIntoViewId } = this.state
    const { type } = this.$router.params
    let title = ''
    let icon = ''
    if (type === 'shop') {
      title = shop.name || ''
      icon = shop.icon || ''
    } else if (type === 'sys') {
      title = '系统消息'
      icon = message1
    } else {
      title = '营销活动'
      icon = message2
    }
    return (
      <View className="store-message">
        <Navbar title={title}></Navbar>
        {/* <Navbar title={title} bgColor='#fafafa' borderColor='#ccc'></Navbar> */}
        <ScrollView
          className="box"
          style={`height:calc(100vh - ${navbarHeight}px)`}
          scrollY
          scrollIntoView={scrollIntoViewId}
          upperThreshold={50}
          onScrollToUpper={this.onScrollToUpper.bind(this)}
          onScroll={this.onScroll.bind(this)}
        >
          {this.state.currList.length > 0 && !this.state.loading && (
            <View className="oper" style={'top:' + this.state.navbarHeight + 'px'}>
              <Text onClick={this.clear.bind(this)}>清空</Text>
              {type === 'shop' && (
                <Text className="tostore" onClick={this.toStore}>
                  进入店铺
                </Text>
              )}
            </View>
          )}
          {this.state.currList.length === 0 && !this.state.loading && <View class="empty-msg">暂无消息</View>}
          <View className="oper-blank"></View>
          {this.state.pagination === 0 && currList.length > 0 && (
            <View className="msg-store">
              <View className="loadmore-complete">没有更多了</View>
            </View>
          )}
          {currList.map(item => {
            return (
                <View key={item.id} taroKey={item.id} id={'msg' + item.timestamp}>
                  {(item.timestampDiff > 180000 || !item.timestampDiff) && (
                    <View className="msg-time">{dateFormat(item.timestamp, 'MM月dd日 hh:mm')}</View>
                  )}
                  <View className="msg-item">
                    <Image src={icon}></Image>
                    <View className="msg-item-content">
                      {item.content}
                      {(item.type === 'order' || item.type === 'moment') && (
                        <Text className="detail" onClick={this.messagePage.bind(this, item)}>
                          查看详情
                        </Text>
                      )}
                    </View>
                  </View>
                </View>
              )
            })
          }
          <View className='safe-pad'></View>
        </ScrollView>
      </View>
    )
  }
}

export default StoreMessage
