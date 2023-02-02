import Taro, { Component } from '@tarojs/taro'
import { connect } from '@tarojs/redux'
import { View, Image, Text, Input, ScrollView } from '@tarojs/components'
import Navbar from '../../components/navBar/navBar';
import './submitOrder.scss'

@connect(({ globalData }) => ({
  globalData
}))
class submitOrder extends Component {

  constructor () {
    super(...arguments)
    this.state = {
      // textHeight: 0,
      timeModal: false,
      addressModal: false,
      // firstChangeHeight: true,
      payModeList: ['微信支付', '支付宝', '银行转账'],
      pickType: ''
    }
  }

  componentWillReceiveProps (nextProps) {
    console.log(this.props, nextProps)
  }
  
  componentDidMount () {
    this.setState({
      // ratio: this.props.globalData.systemInfo.windowWidth / 750,
      // textHeight: 60 * this.props.globalData.systemInfo.windowWidth / 750
    })
  }

  componentWillUnmount () { }

  componentDidShow () {
    let setAddressData = Taro.getStorageSync('setAddressData')
    if (setAddressData) {
      this.setAddress()
    }
    Taro.setStorageSync('setAddressData', null)
  }

  componentDidHide () { }

  // changeHeight () {
  //   if (this.state.firstChangeHeight) {
  //     this.setState({
  //       firstChangeHeight: false
  //     })
  //   } else {
  //     this.setState({
  //       textHeight: this.state.textHeight + this.state.ratio * 40
  //     })
  //   }
  // }

  // textInput (e) {
  //   if (e.detail.value.slice(-1) === '\n') {
  //     this.setState({
  //       textHeight: this.state.textHeight + this.state.ratio * 40
  //     })
  //   }
  // }

  openTimeModal () {
    this.setState({
      timeModal: true
    })
  }

  closeTimeModal () {
    this.setState({
      timeModal: false
    })
  }

  openAddressModal () {
    this.setState({
      addressModal: true
    })
  }

  toAddressList () {
    Taro.navigateTo({
      url: '/pages/addressList/addressList?referrer=order&id=' + 123456
    })
  }

  setAddress () {
    Taro.$http({url: `/shops/${this.state.id || 123456}/cart/set_address`}).then(res => {
      console.log(res)
    })
  }

  toOrderDetail () {
    Taro.navigateTo({
      url: '/pages/orderDetail/orderDetail?referrer=submitOrder'
    })
  }

  changePickType (type) {
    this.setState({
      pickType: type
    })
  }

  render () {
    const { timeModal, payModeList, pickType, addressModal } = this.state
    return (
      <View className='submit-order'>
        <Navbar title='提交订单' bgColor='#f7ce55'></Navbar>
        <View className='pagebg'>
          <View className='address-card'>
            <View className='pick-type'>
              <View className='pick-type-item' onClick={this.changePickType.bind(this, 'p')}><View className={'checkbox ' + (pickType === 'p' ? 'sel' : '')}><View></View></View>派送</View>
              <View className='pick-type-item' onClick={this.changePickType.bind(this, 'z')}><View className={'checkbox ' + (pickType === 'z' ? 'sel' : '')}><View></View></View>自取</View>
            </View>
            {
              pickType && (
                <View>
                  <View className='base'>
                    <View className='base-address'>
                      <Text>家</Text>
                      长宁西巷5-6
                    </View>
                    <View className='base-name'>
                      <Text>Test(先生)</Text>
                      18637790000
                    </View>
                    <View className='at-icon at-icon-chevron-right' onClick={this.toAddressList.bind(this)}></View>
                  </View>
                  {
                    pickType === 'p' && (
                      <View className='time'>
                        <View className='time-select'>
                          <View>指定时间</View>
                          <View className='now-sel' onClick={this.openTimeModal}>
                            <View>4月4日 (周六) 11:10</View>
                            <Text className='at-icon at-icon-chevron-right'></Text>
                          </View>
                        </View>
                        <View className='tips'>为减少接触，封闭管理时，请在地址中更新具体取餐地点</View>
                      </View>
                    )
                  }
                </View>
              )
            }
          </View>
          <View className='product'>
            <View className='store-name'>
              <View>星巴克咖啡代购(扬中雨润中央商圈店)</View>
              <Text>商家自配</Text>
            </View>
            <View className='product-list'>
              <View className='item'>
                <Image mode='aspectFill' src='https://5b0988e595225.cdn.sohucs.com/images/20180703/90bb3c0a46d34abebafc5c2e4ac89476.jpeg'></Image>
                <View className='info'>
                  <View className='info-tit'>
                    <View className='info-name'>榛果拿铁HL</View>
                    <View className='info-price'><Text>¥ </Text>35</View>
                  </View>
                  <View className='info-norm'>大杯 + 热 + 豆奶 + 正常糖</View>
                  <View className='info-num'>x1</View>
                </View>
              </View>
              <View className='item'>
                <Image mode='aspectFill' src='https://5b0988e595225.cdn.sohucs.com/images/20180703/90bb3c0a46d34abebafc5c2e4ac89476.jpeg'></Image>
                <View className='info'>
                  <View className='info-tit'>
                    <View className='info-name'>榛果拿铁HL</View>
                    <View className='info-price'><Text>¥ </Text>35</View>
                  </View>
                  <View className='info-norm'>大杯 + 热 + 豆奶 + 正常糖</View>
                  <View className='info-num'>x1</View>
                </View>
              </View>
            </View>
            <View className='delivery-price'>
              配送费
              <View><Text>¥ </Text>6</View>
            </View>
            <View className='discount'>
              <View className='dis-minus'>
                <View className='name'><Text>减</Text>满减优惠</View>
                <View className='reduce'><Text>-¥ </Text>5</View>
              </View>
              <View className='dis-more'>
                <View>加1元，可再减5元</View>
                <View className='get-more'>去凑单<Text className='at-icon at-icon-chevron-right'></Text></View>
                <View className='triangle'></View>
              </View>
              <View className='dis-merchant'>
                <View className='dis-merchant-hd'>
                  <View className='name'><Text>券</Text>商家代金券</View>
                  <View className='sel'>暂无可用<Text className='at-icon at-icon-chevron-right'></Text></View>
                </View>
                <View className='dis-merchant-tip'>满减券和商品券可同享</View>
              </View>
            </View>
            <View className='order-result'>
              <View className='dismoney'>
                已优惠
                <Text className='cury'>¥<Text className='val'>5</Text></Text>
              </View>
              <View className='total'>小计<Text className='cury'>¥</Text><Text className='val'>100</Text></View>
            </View>
            <View className='pay-mode'>
              <View className='pay-mode-label'>支付方式</View>
              <View className='pay-mode-sel' >{payModeList.join(', ')}<Text></Text></View>
            </View>
          </View>
          <View className='order-other'>
            <View className='o-item'>
              <View className='o-label'>备注</View>
              <Input className='o-text' confirmType='done' type='text' placeholderClass='o-text-placeholder' maxLength={50} placeholder='如加两套餐具'></Input>
            </View>
          </View>
        </View>
        <View className='submit-btn' onClick={this.toOrderDetail}>提交订单</View>
        <View className='submit-btn-blank'></View>
        {/* <View className='address-modal' style={`visibility: ${addressModal ? 'visible' : 'hidden'}`}>
          <View className='time-modal-cover' style={`opacity: ${addressModal ? '1' : '0'}`}></View>
          <View className='box' style={`transform: translateY(${addressModal ? '0' : '100%'})`}>
            <ScrollView className='scroll-address' scrollY>

            </ScrollView>
          </View>
        </View> */}
        <View className='time-modal' style={`visibility: ${timeModal ? 'visible' : 'hidden'}`}>
          <View className='time-modal-cover' style={`opacity: ${timeModal ? '1' : '0'}`}></View>
          <View className='box' style={`transform: translateY(${timeModal ? '0' : '100%'})`}>
            <View className='title'>选择预计送达时间<Text className='at-icon at-icon-close' onClick={this.closeTimeModal}></Text></View>
            <View className='scroll'>
              <ScrollView className='scroll-day' scrollY>
                <View>今天(周四)</View>
                <View className='active'>明天(周五)</View>
                <View>4月4日(周六)</View>
                <View>4月5日(周日)</View>
                <View>4月6日(周一)</View>
                <View>4月7日(周二)</View>
                <View>4月8日(周三)</View>
                <View>4月9日(周四)</View>
              </ScrollView>
              <ScrollView className='scroll-min' scrollY>
                <View className='active'>14:55<Text className='sel'></Text></View>
                <View>15:20</View>
                <View>15:40</View>
                <View>16:00</View>
                <View>16:20</View>
                <View>16:40</View>
                <View>17:00</View>
                <View>17:20</View>
                <View>17:40</View>
                <View>18:00</View>
                <View>18:20</View>
                <View>18:40</View>
                <View>19:00</View>
                <View>19:20</View>
                <View>19:40</View>
                <View>20:00</View>
                <View>20:20</View>
                <View>20:40</View>
              </ScrollView>
            </View>
          </View>
          
        </View>
      </View>
    )
  }
}

export default submitOrder
