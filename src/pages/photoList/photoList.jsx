import Taro, { Component } from '@tarojs/taro'
import { View, Image } from '@tarojs/components'
import Navbar from '../../components/navBar/navBar'
import Loading from '../../components/loading/loading'
import LoadMore from '../../components/loadMore/loadMore'

import './photoList.scss'

class PhotoList extends Component {
  config = {
    onReachBottomDistance: 50
  }

  constructor() {
    super(...arguments)
    this.isEval = false
    this.state = {
      photoList: [],
      loading: true
    }
  }

  componentDidMount() {
    this.getPhotoList()
  }

  componentWillUnmount() {}

  componentDidShow() {}

  componentDidHide() {}

  previewImage(index) {
    Taro.previewImage({
      current: this.state.photoList.map(i => i.url)[index],
      urls: this.state.photoList.map(i => i.url)
    })
  }

  getPhotoList() {
    if (this.isEval) return
    this.isEval = true
    let { photoList } = this.state

    Taro.$http({
      url: `/shops/${this.$router.params.id}/gallery`
    }).then(res => {
      this.setState(
        {
          photoList: photoList.concat(res.photos),
          loading: false
        },
        () => {
          this.isEval = false
        }
      )
    })
  }

  onReachBottom() {
    this.getPhotoList()
  }

  render() {
    return (
      <View>
        <Navbar title="商家相册"></Navbar>
        {this.state.loading ? (
          <Loading></Loading>
        ) : (
          <View className="photo-list">
            {this.state.photoList.map((item, index) => {
              return (
                <View
                  key={item.id}
                  taroKey={item.id}
                  className="photo-item"
                  onClick={this.previewImage.bind(this, index)}
                >
                  <Image mode="aspectFill" lazyLoad src={item.thumb}></Image>
                </View>
              )
            })}
          </View>
        )}
      </View>
    )
  }
}

export default PhotoList
