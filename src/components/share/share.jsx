import Taro, { Component } from '@tarojs/taro'
import { View, Button, Image } from '@tarojs/components'
import { AtActivityIndicator } from 'taro-ui'
import './share.scss'

class Share extends Component {
  static defaultProps = {
    isShareShow: false,
    type: 'shops',
    rqId: ''
  }

  constructor() {
    super(...arguments)
    this.state = {
      img: '',
      posterLoading: false
    }
  }

  componentDidMount() {}

  componentWillUnmount() {}

  componentDidShow() {}

  componentDidHide() {}

  catchEvent(e) {
    e.stopPropagation()
  }

  switchShareShow() {
    this.setState({
      img: ''
    })
    this.props.onChangeShareShow()
  }

  createImg() {
    this.setState({
      posterLoading: true
    })
    let url = '/' + this.props.type + '/' + this.props.rqId + '/share'
    Taro.$http({ url }).then(res => {
      this.setState({
        img: res
      })
    })
  }

  imgLoad() {
    this.setState({
      posterLoading: false
    })
  }

  clearImg() {
    this.setState({
      img: ''
    })
  }

  saveImg() {
    Taro.downloadFile({
      url: this.state.img,
      success: res => {
        Taro.saveImageToPhotosAlbum({
          filePath: res.tempFilePath,
          success: () => {
            Taro.showToast({
              title: '保存成功',
              icon: 'none'
            })
            this.setState({
              img: ''
            })
            this.props.onChangeShareShow()
          },
          fail: () => {
            Taro.showToast({
              title: '保存失败',
              icon: 'none'
            })
          }
        })
      },
      fail: err => {
        console.log(err)
        Taro.showToast({
          title: '保存失败',
          icon: 'none'
        })
      }
    })
  }

  onShareAppMessage() {
    return {}
  }

  render() {
    const { isShareShow } = this.props
    const { posterLoading } = this.state
    return (
      <View className="share" style={`visibility: ${isShareShow ? 'visible' : 'hidden'}`} onTouchMove={this.catchEvent}>
        <View
          className="share-modal"
          style={`opacity: ${isShareShow ? '1' : '0'}`}
          onClick={this.switchShareShow.bind(this)}
        ></View>
        <View className="share-wrap">
          <View className="share-wrap-rl">
            {this.state.img ? (
              <View className="share-img">
                <Image
                  className="img"
                  mode="widthFix"
                  showMenuByLongpress
                  src={this.state.img}
                  onLoad={this.imgLoad.bind(this)}
                ></Image>
                <View className="tip">
                  <View>长按图片保存到相册</View>
                </View>
                <View className="oper">
                  <View className="cancel" onClick={this.clearImg.bind(this)}>
                    关闭
                  </View>
                  {/* <View className='save' onClick={this.saveImg.bind(this)}>保存</View> */}
                </View>
              </View>
            ) : (
              <View className="share-action">
                <Button openType="share" className="button">
                  分享给好友
                </Button>
                <View className="view" onClick={this.createImg.bind(this)}>
                  生成海报
                </View>
              </View>
            )}
            {posterLoading && (
              <View className="loading">
                <AtActivityIndicator size={48} mode="center" color="#f3b53c"></AtActivityIndicator>
              </View>
            )}
          </View>
        </View>
      </View>
    )
  }
}

export default Share
