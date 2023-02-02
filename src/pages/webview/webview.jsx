import Taro, { Component } from '@tarojs/taro'
import { connect } from '@tarojs/redux'
import { WebView } from '@tarojs/components'


@connect(({ globalData }) => ({
  globalData
}))
class CustomizeWebView extends Component {

  config = {
    navigationBarTitleText: '网页'
  }

  constructor() {
    super(...arguments)
    this.state = {
      src: this.$router.params.url
    }
  }

  componentDidMount () {
    
  }

  componentWillUnmount () { }

  componentDidShow () { }

  componentDidHide () { }

  render () {
    return (
      <WebView src={this.state.src}>
        
      </WebView>
    )
  }
}

export default CustomizeWebView
