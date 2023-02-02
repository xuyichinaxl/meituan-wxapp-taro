import Taro, { Component } from '@tarojs/taro'
import { View, Button } from '@tarojs/components'
import { connect } from '@tarojs/redux'
import { AtSteps, AtButton } from 'taro-ui'
import { onSetUserInfo } from '../../actions/global'
import Navbar from '../../components/navBar/navBar'
import './register.scss'

@connect(({ globalData }) => ({
  globalData
}), dispatch => ({
  onSetUserInfo (userInfo) {
    dispatch(onSetUserInfo(userInfo))
  }
}))
class Register extends Component {

  constructor() {
    super(...arguments)
    this.user = {}
    this.state = {
      current: 0,
      loading: false
    }
  }

  componentWillMount () {

  }

  componentWillUnmount () { }

  componentDidShow () { }

  componentDidHide () { }

  getPhoneNumber (e) {
    this.setState({
      loading: true
    })
    Taro.$http({method: 'POST', url: '/wx_register', data: {user: this.user, mobile: e.detail, register_token: this.$router.params.token}}).then(res => {
      if (res.statusCode === 400) {
        Taro.showToast({
          title: res.message,
          icon: 'none'
        })
        this.setState({
          current: 0,
          loading: false
        })
        return
      }

      Taro.showToast({
        title: '注册成功',
        icon: 'none'
      })
      this.setState({
        current: 2
      })
      this.props.onSetUserInfo(res)
      Taro.setStorageSync('userInfo', res)
      setTimeout(() => {
        Taro.reLaunch({
          url: '/pages/me/me'
        })
      }, 1500)
    }).catch((err) => {
      Taro.showToast({
        title: '网络异常',
        icon: 'none'
      })
      this.setState({
        current: 0,
        loading: false
      })
    })
  }

  getUserInfo (e) {
    this.user = e.detail
    this.setState({
      current: 1
    })
  }

  render () {
    const { current, loading } = this.state
    const items = [
      { 'title': '绑定个人信息'},
      { 'title': '绑定手机'},
      { 'title': '完成'}
    ]
    return (
      <View className='login'>
        <Navbar title='注册'></Navbar>
        <View className='register'>
          <AtSteps
            items={items}
            current={current}
          />
          {current === 0 && <AtButton type='primary' className='login-btn' openType='getUserInfo' onGetUserInfo={this.getUserInfo.bind(this)}>自动绑定微信账号</AtButton>}
          {current === 1 && <AtButton loading={loading} type='primary' className='login-btn' openType='getPhoneNumber' onGetPhoneNumber={this.getPhoneNumber.bind(this)}>自动绑定手机</AtButton>}
        </View>
      </View>
    )
  }
}

export default Register
