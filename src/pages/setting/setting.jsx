import Taro, { Component } from '@tarojs/taro'
import { View, Button, Text, Form, Input } from '@tarojs/components'
import { connect } from '@tarojs/redux'
import Navbar from '../../components/navBar/navBar'
import Loading from '../../components/loading/loading'
import { onSetUserInfo } from '../../actions/global'
import { onClearSocketMessage } from '../../actions/socket'
import './setting.scss'

@connect(
  ({ globalData }) => ({
    globalData
  }),
  dispatch => ({
    onSetUserInfo(userInfo) {
      dispatch(onSetUserInfo(userInfo))
    },
    onClearSocketMessage() {
      dispatch(onClearSocketMessage())
    }
  })
)
class Setting extends Component {
  constructor() {
    super(...arguments)
    this.state = {
      logoutStatus: false
    }
  }

  componentWillReceiveProps(nextProps) {
    console.log(this.props, nextProps)
  }

  componentWillUnmount() {}

  componentDidShow() {}

  componentDidHide() {}

  setSubmit(e) {
    console.log(e)
  }

  signOut() {
    Taro.showModal({
      title: '提示',
      content: '确认退出登录吗？',
      success: res => {
        if (res.cancel) return
        this.setState({
          logoutStatus: true
        })
        Taro.$http({ url: '/logout', method: 'POST' }).finally(() => {
          Taro.removeStorageSync('userInfo')
          this.props.onSetUserInfo({
            profile: {},
            access_token: ''
          })
          this.props.onClearSocketMessage()

          Taro.showToast({
            title: '成功退出',
            icon: 'none'
          })
          setTimeout(() => {
            Taro.reLaunch({
              url: '/pages/me/me'
            })
          }, 1000)
        })
      }
    })
  }

  render() {
    return (
      <View className="setting">
        <Navbar title="设置"></Navbar>
        {this.state.logoutStatus && (
          <View>
            <View className="modal"></View>
            <Loading></Loading>
          </View>
        )}
        <View className="signout">
          <Text onClick={this.signOut.bind(this)}>退出登录</Text>
        </View>
        <Form onSubmit={this.setSubmit}>
          <View className="form">
            <View className="form-field">
              <View className="label required">
                <View>*</View>姓名
              </View>
              <View className="entry">
                <Input type="text" name="name"></Input>
              </View>
            </View>
            <View className="form-field">
              <View className="label required">手机</View>
              <View className="entry">
                <Input type="digit" name="phone"></Input>
              </View>
            </View>
            <View className="form-field">
              <View className="label required">Email</View>
              <View className="entry">
                <Input type="text" name="email"></Input>
              </View>
            </View>
            <Button className="submit-btn" formType="submit">
              保存
            </Button>
          </View>
        </Form>
      </View>
    )
  }
}

export default Setting
