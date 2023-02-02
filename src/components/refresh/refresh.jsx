import Taro, { Component } from '@tarojs/taro'
import { AtActivityIndicator } from 'taro-ui'
import { View, Text } from '@tarojs/components'
import './refresh.scss'

class Refresh extends Component {
  static defaultProps = {
    refresh: false
  }

  constructor() {
    super(...arguments)
  }

  componentDidMount() {}

  componentWillUnmount() {}

  componentDidShow() {}

  componentDidHide() {}

  render() {
    return (
      <View className="refresh">
        <AtActivityIndicator size={36} color="#f3b53c"></AtActivityIndicator>
        <Text className="status">{this.props.refresh ? '加载中...' : '释放即可刷新...'}</Text>
      </View>
    )
  }
}

export default Refresh
