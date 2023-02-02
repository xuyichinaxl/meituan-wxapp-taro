import Taro, { Component } from '@tarojs/taro'
import { View, Image, Text } from '@tarojs/components'
import productDelivery from '../../assets/img/green_check.png'
import './storeCard.scss'

class StoreCard extends Component {
  static defaultProps = {
    isStore: false,
    isPug: false,
    isCollect: false,
    share: false,
    storeInfo: {}
  }

  componentWillMount() {}

  componentWillUnmount() {}

  componentDidShow() {}

  componentDidHide() {}

  toStore(type, e) {
    e.stopPropagation()
    if ((this.props.isStore && type !== 'wrap') || !this.props.isStore) {
      Taro.navigateTo({
        url: '/pages/store/store?referrer=' + (this.props.share ? 'share' : 'normal') + '&id=' + this.props.storeInfo.id
      })
    }
  }

  delCollect(e) {
    e.stopPropagation()
    Taro.showModal({
      title: '提示',
      content: '确认删除吗？',
      success: res => {
        if (res.confirm) {
          Taro.$http({ url: '/bookmarks/' + this.props.storeInfo.id, method: 'DELETE' })
          this.props.onDelShop()
        }
      }
    })
  }

  render() {
    const { storeInfo } = this.props
    return (
      <View className="store">
        <View className="store-info" onClick={this.toStore.bind(this, 'wrap')}>
          <View className="all">
            <View className="img">
              <Image className="image" src={storeInfo.image}></Image>
              {/* <View className="view">品牌</View> */}
            </View>
            <View className="name">
              <View className="name-word">{storeInfo.name}</View>
              <View className="name-score">
                <View className="at-icon at-icon-star-2"></View>
                <View className="score">{storeInfo.rating}</View>
                <View className="distance">{storeInfo.distance}</View>
              </View>
            </View>
            {this.props.isCollect && (
              <Text className="at-icon at-icon-trash" onClick={this.delCollect.bind(this)}></Text>
            )}
            {this.props.isStore && (
              <View className="tostore" onClick={this.toStore.bind(this, 'btn')}>
                进店逛逛
              </View>
            )}
          </View>
          {this.props.isStore && storeInfo.services && storeInfo.services.length > 0 && (
            <View className="delivery">
              <View className="delivery-lt">
                {storeInfo.services.map(item => {
                  return (
                    <View key={item} taroKey={item} className="delivery-lt-item">
                      <Image className="image" src={productDelivery}></Image>
                      <View>{item}</View>
                    </View>
                  )
                })}
              </View>
            </View>
          )}
          <View className="coupon">
            <View className="label">优惠</View>
            <View className="coupon-item">
              {(!storeInfo.promos || storeInfo.promos.length === 0) && <text>-</text>}
              {storeInfo.promos &&
                storeInfo.promos.map(item => {
                  return item.type === 'mj' ? (
                    <Text className="minus" key={item.off} taroKey={item.off}>
                      {item.spending}减{item.off}
                    </Text>
                  ) : (
                    <View className="dis" key="new" taroKey="new">
                      <View className="view">
                        首单满{item.spending}减{item.off}
                      </View>
                    </View>
                  )
                })}
            </View>
            {/* <View className='coupon-get'>
              <Text>去领取</Text>
              <Text className='at-icon at-icon-chevron-right'></Text>
          </View>*/}
          </View>
        </View>
      </View>
    )
  }
}

export default StoreCard
