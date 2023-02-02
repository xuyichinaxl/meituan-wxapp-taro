import Taro, { Component } from '@tarojs/taro'
import { connect } from '@tarojs/redux'
import { AtActivityIndicator } from 'taro-ui'
import { View } from '@tarojs/components'
import './loading.scss'

@connect(({ globalData }) => ({
  globalData
}))
class Loading extends Component {
  static defaultProps = {
    needBack: true,
    bgColor: 'white',
    color: '#333',
    backBackground: 'rgba(255, 255, 255, 0)',
    borderColor: 'transparent'
  }

  constructor() {
    super(...arguments)
    this.state = {
      fixedHeight: 68
    }
  }

  componentDidMount() {
    this.setState({
      fixedHeight:
        this.props.globalData.systemInfo.statusBarHeight +
        (this.props.globalData.systemInfo.system.indexOf('Adr') > -1 ? 48 : 44)
    })
  }

  componentWillUnmount() {}

  componentDidShow() {}

  componentDidHide() {}

  render() {
    return (
      <View
        className="page-loading"
        style={'top:' + this.state.fixedHeight + 'PX; height: calc(100vh - ' + this.state.fixedHeight + 'PX)'}
      >
        <AtActivityIndicator size={48} mode="center" color="#f3b53c"></AtActivityIndicator>
      </View>
    )
  }
}

export default Loading
