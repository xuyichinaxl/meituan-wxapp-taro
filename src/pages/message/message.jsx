import Taro, { Component } from '@tarojs/taro'
import { connect } from '@tarojs/redux'
import { View, Image, Text, ScrollView } from '@tarojs/components'
import { AtSwipeAction } from 'taro-ui'
import { onUpdateSocketShop, onSetSocketClear } from '../../actions/socket'
import Navbar from '../../components/navBar/navBar'
// import Refresh from '../../components/refresh/refresh'
import message1 from '../../assets/img/message_1.png'
import message2 from '../../assets/img/message_2.png'
import { dateFormat } from '../../utils/util'
import './message.scss'

@connect(({ globalData, socket }) => ({
  globalData,
  socket
}), dispatch => ({
  onUpdateSocketShop (key) {
    dispatch(onUpdateSocketShop(key))
  },
  onSetSocketClear (key) {
    dispatch(onSetSocketClear(key))
  }
}))
class Message extends Component {

  constructor(){
    super(...arguments)
    this.state = {
      evalList: [],
      socketStatus: false
    }
  }

  componentDidMount () {
    this.setRenderData(this.props.socket)
    this.setState({
      navbarHeight: this.props.globalData.systemInfo.statusBarHeight + (this.props.globalData.systemInfo.system.indexOf('Adr') > -1 ? 48 : 44)
    })
  }

  componentWillReceiveProps(nextProps){
    this.setRenderData(nextProps.socket)
  }

  setRenderData (socket) {
    const { socketShopList, socketStatus } = socket
    const shopList = [...socketShopList.values()]
    let evalList = []
    shopList.map((item, index) => {
      const taroKey = item.shop.id || index
      const className = item.type === 'shop' ? 'normal' : item.type === 'sys' ? 'sys' : item.type === 'promo' ? 'promo' : 'normal'
      let lastMessage = ''
      let lastTime = ''
      if (item.msgList.length > 0) {
        lastMessage = item.msgList[item.msgList.length - 1].content
        lastTime = item.msgList[item.msgList.length - 1].timestamp
      } else if (item.readList.length > 0) {
        lastMessage = item.readList[item.readList.length - 1].content
        lastTime = item.readList[item.readList.length - 1].timestamp
      } else {
        lastMessage = ''
        lastTime = ''
      }
      evalList.push({
        taroKey,
        className,
        lastMessage,
        lastTime,
        type: item.type,
        shop: item.shop,
        msgListLen: item.msgList.length
      })
    })
    this.setState({
      evalList,
      socketStatus
    })
  }

  componentWillUnmount () { }

  componentDidShow () {
    this.props.onUpdateSocketShop()
  }

  componentDidHide () {}

  toStoreMessage (type, id) {
    let url = '/pages/storeMessage/storeMessage?type=' + type + '&id=' + (id ? id : type)
    Taro.navigateTo({
      url: url
    })
  }

  deleteMessage (item) {
    Taro.showModal({
      title: '提示',
      content: '确认删除吗？',
      success: (res) => {
        if (res.confirm) {
          this.props.onSetSocketClear(item.shop.id ? item.shop.id : item.type)
        }
      }
    })
  }

  // getMessage () {
  //   // 调用接口
  //   setTimeout(() => {
  //     this.setState({
  //       refresh: false
  //     })
  //   }, 2000)
  // }

  // refresherRefresh () {
  //   this.setState({
  //     refresh: true
  //   }, () => {
  //     this.getMessage()
  //   })
  // }

  render () {
    const { navbarHeight, evalList, socketStatus } = this.state
    const { access_token } = this.props.globalData.userInfo
    return (
      <View className='message'>
        <Navbar title={socketStatus || !access_token ? '消息中心' : '连接中...'} needBack={false}></Navbar>
        {/* <View className='scroll-box'> */}
          <ScrollView
            className='box'
            style={`height:calc(100vh - ${navbarHeight}px)`}
            scrollY 
            // 无需下拉刷新
            // refresherEnabled 
            // refresherThreshold={50} 
            // onRefresherRefresh={this.refresherRefresh.bind(this)} 
            // refresherDefaultStyle='none'
            // refresherTriggered={refresh}
          >
            {/* <View className='box-blank'></View> */}
            {/* <Refresh refresh={refresh}></Refresh> */}
            <View className='message-wrap'>
              {/* <View className='al-read'>全部已读</View> */}
              {
                evalList.length === 0 && <View class='empty-msg'>您还没有收到消息哦～</View>
              }
              <View className='message-list'>
                {
                  evalList.map((item, index) => {
                    return (
                      <View className={item.className} key={item.taroKey} taroKey={item.taroKey}>
                        <AtSwipeAction
                          onClick={this.deleteMessage.bind(this, item)}
                          options={[{text: '删除',style: {backgroundColor: '#FF4949'}}]}
                        >
                          {item.type === 'shop' ? (
                            <View className='item' onClick={this.toStoreMessage.bind(this, 'shop', item.shop.id)}>
                              <View className='store'>
                                <Image mode='aspectFill' src={item.shop.icon}></Image>
                              </View>
                              <View className='item-rl'>
                                <View className='name'>
                                  <View>{item.shop.name || '店铺消息'}</View>
                                  {item.lastTime && <Text>{dateFormat(item.lastTime, 'MM-dd')}</Text>}
                                </View>
                                <View className='sub'>
                                  <View>{item.lastMessage}</View>
                                  {
                                    item.msgListLen > 0 && <Text>{item.msgListLen > 99 ? '...' : item.msgListLen}</Text>
                                  }
                                </View>
                              </View>
                            </View>
                            ) : item.type === 'sys' ? (
                            <View className='item' onClick={this.toStoreMessage.bind(this, 'sys', null)}>
                              <View className='store'>
                                <Image src={message1}></Image>
                              </View>
                              <View className='item-rl'>
                                <View className='name'>系统通知</View>
                                <View className='sub'>
                                  <View>{item.lastMessage}</View>
                                  {
                                    item.msgListLen > 0 && <Text>{item.msgListLen > 99 ? '...' : item.msgListLen}</Text>
                                  }
                                </View>
                              </View>
                            </View>
                            ) : item.type === 'promo' ? (
                            <View className='item' onClick={this.toStoreMessage.bind(this, 'promo', null)}>
                              <View className='store'>
                                <Image src={message2}></Image>
                              </View>
                              <View className='item-rl'>
                                <View className='name'>营销活动</View>
                                <View className='sub'>
                                  <View>{item.lastMessage}</View>
                                  {
                                    item.msgListLen > 0 && <Text>{item.msgListLen > 99 ? '...' : item.msgListLen}</Text>
                                  }
                                </View>
                              </View>
                            </View>
                            ) : ''}
                        </AtSwipeAction>
                      </View>
                      
                    )
                    
                  })
                }
              </View>
            </View>
            
          </ScrollView>
        {/* </View> */}
      </View>
    )
  }
}

export default Message
