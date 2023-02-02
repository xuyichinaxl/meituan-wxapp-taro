import Taro, { Component } from '@tarojs/taro'
import { View } from '@tarojs/components'
import { connect } from '@tarojs/redux'
import { AtButton } from 'taro-ui'
import { onSetUserInfo } from '../../actions/global'
import Navbar from '../../components/navBar/navBar'
import './login.scss'

@connect(
  ({ globalData }) => ({
    globalData
  }),
  dispatch => ({
    onSetUserInfo(userInfo) {
      dispatch(onSetUserInfo(userInfo))
    }
  })
)
class Login extends Component {
  constructor() {
    super(...arguments)
    this.state = {
      loading: false
    }
  }

  componentWillMount() {}

  componentWillUnmount() {}

  componentDidShow() {}

  componentDidHide() {}

  statusCheck() {
    // 需要appid才能拿到真实code
    this.setState({
      loading: true
    })
    Taro.login({
      success: res => {
        if (res.code) {
          Taro.$http({ url: '/wx_auth/' + res.code }).then(result => {
            if (result.register_token && !result.profile) {
              Taro.redirectTo({
                url: '/pages/register/register?token=' + result.register_token
              })
            } else {
              // 设置登录状态，dispatch  todo
              Taro.showToast({
                title: '登录成功',
                icon: 'none'
              })
              this.props.onSetUserInfo(result)
              Taro.setStorageSync('userInfo', result)
              setTimeout(() => {
                Taro.reLaunch({
                  url: '/pages/me/me'
                })
              }, 1500)
            }
          })
        } else {
          console.log('登录失败！' + res.errMsg)
          this.setState({
            loading: false
          })
        }
      }
    })
  }

  render() {
    return (
      <View className="login">
        <Navbar title="登录"></Navbar>
        <AtButton
          loading={this.state.loading}
          type="primary"
          className="login-btn"
          onClick={this.statusCheck.bind(this)}
        >
          微信登录
        </AtButton>
      </View>
    )
  }
}

export default Login
