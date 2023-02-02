import Taro, { Component } from '@tarojs/taro'
import { View, Text, Image, ScrollView } from '@tarojs/components'
import { dateDiff } from '../../utils/util'
import './dynamic.scss'

class Dynamic extends Component {
  static defaultProps = {
    isHome: false,
    momentData: {
      title: '123456',
      created_at: ''
    }
  }

  componentWillMount() {}

  componentWillUnmount() {}

  componentDidHide() {}

  menu(e) {
    e.stopPropagation()
    Taro.showActionSheet({
      itemList: ['不看该店铺动态']
    })
  }

  toDynamicDetail() {
    Taro.navigateTo({
      url: '/pages/dynamicDetail/dynamicDetail?id=' + this.props.momentData.id
    })
  }

  toStore(e) {
    e.stopPropagation()
    Taro.navigateTo({
      url: '/pages/store/store?id=' + this.props.momentData.shop.id
    })
  }

  render() {
    const { momentData } = this.props
    return (
      <View className="dynamic" onClick={this.toDynamicDetail}>
        {this.props.isHome && (
          <View className="dynamic-announcer" onClick={this.toStore}>
            <Image className="image" lazyLoad src={momentData.shop.icon}></Image>
            <View className="dynamic-announcer-con">
              <View className="name">{momentData.shop.name}</View>
              <View className="dynamic-announcer-con-time">{dateDiff(momentData.created_at, 'yyyy/MM/hh')}</View>
            </View>
          </View>
        )}
        {this.props.isHome && (
          <View className="oper" onClick={this.menu}>
            <Text className="text"></Text>
            <Text className="text"></Text>
            <Text className="text"></Text>
          </View>
        )}
        <View className="title">
          <View className="title-name">{momentData.title}</View>
        </View>
        {!this.props.isHome && <View className="time">{dateDiff(momentData.created_at, 'yyyy/MM/hh')}</View>}
        <View className="art">{momentData.content}</View>
        {momentData.images.length > 0 && (
          <ScrollView className="img" scrollX>
            {momentData.images.map(item => {
              return (
                <Image
                  key={item}
                  taroKey={item}
                  lazyLoad
                  mode="aspectFill"
                  className="swiper-img"
                  src={item.thumb}
                ></Image>
              )
            })}
          </ScrollView>
        )}
      </View>
    )
  }
}

export default Dynamic
