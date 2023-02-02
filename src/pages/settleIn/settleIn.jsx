import Taro, { Component } from '@tarojs/taro'
import { View, Text, Image, Input } from '@tarojs/components'
import { AtModal } from 'taro-ui'
import Navbar from '../../components/navBar/navBar'
import './settleIn.scss'
import eyes from '../../assets/img/eye_s.png'
import eyec from '../../assets/img/eye_c.png'

class SettleIn extends Component {

  constructor() {
    super(...arguments)
    this.timer = null
    this.getCoding = false
    this.state = {
      errorModal: false,
      passwordType: true,
      contact: '',
      mobile: '',
      auth_code: '',
      password: '',
      waitCode: 0,
      registerSuccess: false
    }
  }

  componentWillUnmount () { 
    clearInterval(this.timer)
  }

  componentDidShow () { }

  componentDidHide () { }

  closeErrorModal () {
    this.setState({
      errorModal: false
    })
  }

  changeEye () {
    this.setState({
      passwordType: !this.state.passwordType
    })
  }

  inputText (type, e) {
    this.setState({
      [type]: e.detail.value
    })
  }

  getCode () {
    if (this.getCoding) return
    this.getCoding = true
    if (/^04\d{8}$/.test(this.state.mobile)) {
      Taro.$http({method: 'POST', url: '/merchant/auth_code/register', data: {country_code: '61', mobile: this.state.mobile}}).then(res => {
        if (res.statusCode === 400) {
          this.setState({
            errorMsg: res.message,
            errorModal: true,
            submiting: false
          })
          this.getCoding = false
          return
        }
        this.setState({
          waitCode: 60
        }, () => {
          this.getCoding = false
          this.calcWaitCode()
          Taro.showToast({
            title: '手机验证码已发送，请注意查收',
            icon: 'none'
          })
        })
      })
    } else {
      this.getCoding = false
      Taro.showToast({
        title: '手机号不正确',
        icon: 'none'
      })
    }
  }

  calcWaitCode () {
    this.timer = setInterval(() => {
      if (this.state.waitCode === 1) {
        clearInterval(this.timer)
      }
      this.setState({
        waitCode: this.state.waitCode - 1
      })
    }, 1000)
  }

  submit () {
    const { contact, mobile, auth_code, password } = this.state
    this.setState({
      submiting: true
    })
    Taro.$http({method: 'POST', baseURL: 'https://orca-api-ap.yundian.xyz', url: '/merchant/register', data: {
      country: "AU",
      country_code: "61",
      contact,
      mobile,
      auth_code,
      password
    }}).then(res => {
      if (res.statusCode === 400) {
        this.setState({
          errorMsg: res.message,
          errorModal: true,
          submiting: false
        })
        return
      }
      if (res.status === 400) {
        let errorMsg = ''
        res.response.message.map(item => {
          for (let itemKey in item.constraints) {
            errorMsg += item.constraints[itemKey] + '\n\r'
          }
        })
        this.setState({
          errorMsg: errorMsg,
          errorModal: true,
          submiting: false
        })
      } else {
        this.setState({
          registerSuccess: true,
          submiting: false
        })
      }
    })
  }

  render () {
    const { errorModal, errorMsg, passwordType, waitCode, submiting, registerSuccess } = this.state
    return (
      <View className='settle-in'>
        <Navbar title='商户注册'></Navbar>
        <AtModal
          isOpened={errorModal}
          title='出错啦'
          confirmText='确认'
          onConfirm={this.closeErrorModal.bind(this)}
          content={errorMsg}
        />
        {
          registerSuccess ? (
            <View className='success'>感谢您的注册，请访问xxxx下载商家专用app管理您的店铺。\n\r<Text>复制网址</Text></View>
          )
          : (
            <View className='form'>
              <View className='field'>
                <View className='label'>国家</View>
                <View className='entry'>
                  澳洲
                </View>
              </View>
              <View className='field'>
                <View className='label'>姓名</View>
                <View className='entry'>
                  <Input type='text' onInput={this.inputText.bind(this, 'contact')}></Input>
                </View>
              </View>
              <View className='field'>
                <View className='label'>手机号</View>
                <View className='entry'>
                  <Input type='number' onInput={this.inputText.bind(this, 'mobile')}></Input>
                </View>
              </View>
              <View className='field'>
                <View className='label'>手机验证码</View>
                <View className='entry'>
                  <Input type='text' onInput={this.inputText.bind(this, 'auth_code')}></Input>
                  {
                    waitCode > 0 ? <View className='wait code' onClick={this.getCode.bind(this)}>{waitCode}s</View> : <View className='code' onClick={this.getCode.bind(this)}>获取验证码</View>
                  }
                </View>
              </View>
              <View className='field'>
                <View className='label'>登录密码</View>
                <View className='entry'>
                  <Input type='text' password={passwordType} onInput={this.inputText.bind(this, 'password')}></Input>
                  <Image className='eye' src={passwordType ? eyes : eyec} onClick={this.changeEye.bind(this)}></Image>
                </View>
              </View>

              <View className={submiting ? 'confirm submiting' : 'confirm'} onClick={this.submit.bind(this)}>
                {submiting && <Text className='at-icon at-icon-loading-2'></Text>}
                <View>提交</View>
              </View>
            </View>
          )
        }
        
      </View>
    )
  }
}

export default SettleIn
