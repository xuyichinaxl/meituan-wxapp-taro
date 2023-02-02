import Taro, { Component } from '@tarojs/taro'
import { View, Text, Image } from '@tarojs/components'
import './contact.scss'

class Contact extends Component {
  static defaultProps = {
    phone: '',
    photo: ''
  }

  constructor() {
    super(...arguments)
    this.state = {}
  }

  componentDidMount() {}

  componentWillUnmount() {}

  componentDidShow() {}

  componentDidHide() {}

  phoneContact() {
    Taro.makePhoneCall({
      phoneNumber: this.props.phone
    })
  }

  closeModal() {
    this.props.onSetContactModal()
  }

  render() {
    const { phone, photo } = this.props
    return (
      <View className="contact">
        <View className="contact-body">
          {photo && (
            <View className="photo-wrap">
              <View className="photo-flex">
                <View className="photo">
                  <Image className="image" mode="aspectFit" src={photo} show-menu-by-longpress="true"></Image>
                </View>
                <View className="tip">
                  <View>长按微信二维码图片保存到本地</View>
                </View>
              </View>
            </View>
          )}
          <View className="phone">
            <Text className="text" onClick={this.phoneContact.bind(this)}>
              拨打电话: {phone}
            </Text>
          </View>
          <View className="operate">
            <View className="ok" onClick={this.closeModal.bind(this)}>
              关闭
            </View>
          </View>
        </View>
      </View>
    )
  }
}

export default Contact
