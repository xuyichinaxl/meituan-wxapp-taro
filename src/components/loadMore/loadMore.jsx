import Taro, { Component } from '@tarojs/taro'
import { AtActivityIndicator } from 'taro-ui'
import { View } from '@tarojs/components'
import './loadMore.scss'

class LoadMore extends Component {
  static defaultProps = {
    noMore: false
  }

  constructor() {
    super(...arguments)
    this.state = {}
  }

  componentDidMount() {}

  componentWillUnmount() {}

  componentDidShow() {}

  componentDidHide() {}

  render() {
    return (
      <View className="loadmore">
        {this.props.noMore ? (
          <View className="loadmore-complete">没有更多了</View>
        ) : (
          <View className="loadmore-ing">
            <AtActivityIndicator size={36} mode="center" color="#f3b53c"></AtActivityIndicator>
          </View>
        )}
      </View>
    )
  }
}

export default LoadMore
