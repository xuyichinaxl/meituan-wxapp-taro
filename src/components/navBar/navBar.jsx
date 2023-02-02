import Taro, { Component } from '@tarojs/taro'
import { connect } from '@tarojs/redux'
import { View } from '@tarojs/components'
import './navBar.scss'

@connect(({ globalData }) => ({
  globalData
}))
class Navbar extends Component {
  static defaultProps = {
    needBack: true,
    backHome: false,
    bgColor: 'white',
    color: '#333',
    backBackground: 'rgba(255, 255, 255, 0)',
    borderColor: 'transparent',
    backDelta: 1,
    referrer: ''
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

  goBack() {
    if (this.props.referrer === 'submitOrder') {
      Taro.redirectTo({
        url: '/pages/order/order?referrer=submitOrderDetail'
      })
      return
    }
    if (this.props.referrer === 'submitOrderDetail') {
      Taro.switchTab({
        url: '/pages/me/me'
      })
      return
    }
    Taro.navigateBack({
      delta: this.props.backDelta
    })
  }

  goHome() {
    Taro.switchTab({
      url: '/pages/home/home'
    })
  }

  render() {
    return (
      <View className="navbar" style={'height:' + this.state.fixedHeight + 'PX'}>
        <View
          className="fixed"
          style={
            'height:' +
            this.state.fixedHeight +
            'PX; padding-top:' +
            this.props.globalData.systemInfo.statusBarHeight +
            'PX; background:' +
            this.props.bgColor +
            '; border-bottom: 1px solid ' +
            this.props.borderColor
          }
        >
          <View className="fixed-box" style={'color:' + this.props.color}>
            {this.props.needBack && (
              <View
                onClick={this.goBack}
                style={`background: ${this.props.backBackground}`}
                className="back at-icon at-icon-chevron-left"
              ></View>
            )}
            {this.props.backHome && (
              <View
                onClick={this.goHome}
                style={`background: ${this.props.backBackground}`}
                className="home at-icon at-icon-home"
              ></View>
            )}
            <View className="title">{this.props.title}</View>
          </View>
        </View>
      </View>
    )
  }
}

export default Navbar
