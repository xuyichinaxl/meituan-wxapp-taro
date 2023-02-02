import Taro, { Component } from '@tarojs/taro'
import { View, ScrollView, Image } from '@tarojs/components'
import './orderList.scss'

class OrderList extends Component {
  static defaultProps = {
    orderList: []
  }

  // componentWillReceiveProps (nextProps) {
  //   console.log(this.props, nextProps)
  // }

  componentWillUnmount() {}

  componentDidShow() {}

  componentDidHide() {}

  toOrderDetail(id) {
    Taro.navigateTo({
      url: '/pages/orderDetail/orderDetail?id=' + id
    })
  }

  render() {
    const { orderList } = this.props
    return (
      <View className="order-list">
        {orderList.map(item => {
          let qty = 0
          let items = item.items || []
          const images = items.map(imgItem => {
            qty += imgItem.qty
            return (
              <Image
                key={imgItem.id}
                taroKey={imgItem.id}
                mode="aspectFill"
                className="swiper-img"
                src={imgItem.image}
              ></Image>
            )
          })
          return (
            <View
              key={item.id}
              taroKey={item.id}
              className="order-item"
              onClick={this.toOrderDetail.bind(this, item.id)}
            >
              <View className="order-tit">
                <View className="order-tit-name">订单 {item.id}</View>
                <View className="order-tit-status">已发货</View>
              </View>
              <View className="order-use">
                <View className="order-use-name">{item.delivery.receiver}</View>
                <View className="order-use-time">{item.delivery.time}</View>
              </View>
              <ScrollView scrollX className="order-scroll">
                {images}
              </ScrollView>
              <View className="order-goods">
                <View className="order-goods-num">{qty}件商品</View>
                <View className="order-goods-price">金额：$ {item.total}</View>
              </View>
              <View className="order-delivery">
                {item.delivery.type === 'delivery' ? '派送' : '自取'}:
                <View className="order-time">04-02 07:00 ~ 09:00</View>
              </View>
              <View className="order-delivery">{item.delivery.address}</View>
            </View>
          )
        })}
      </View>
    )
  }
}

export default OrderList
