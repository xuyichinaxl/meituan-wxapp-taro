import Taro, { Component } from '@tarojs/taro'
import { View, Text, Image, Textarea } from '@tarojs/components'
import Navbar from '../../components/navBar/navBar'
// import assessN from '../../assets/img/assess_n.png'
// import assessY from '../../assets/img/assess_y.png'
import assessZ from '../../assets/img/assess_z.png'
import praise_2 from '../../assets/img/praise_2.png'
import assessC from '../../assets/img/assess_c.png'
import assessCS from '../../assets/img/assess_c_s.png'
import './assess.scss'

class Assess extends Component {
  constructor() {
    super(...arguments)
    this.photos = []
    this.state = {
      id: this.$router.params.id,
      imgList: [],
      shop: {},
      items: [],
      anonymous: false,
      rate: 5,
      comment: '',
      rateConvert: {
        1: '很差',
        2: '一般',
        3: '满意',
        4: '很满意',
        5: '完美'
      }
    }
  }

  componentWillMount() {
    let assessData = Taro.getStorageSync('assessData')
    assessData.items = assessData.items.map(item => {
      item.vote = 'up'
      return item
    })
    this.setState({
      shop: assessData.shop,
      items: assessData.items
    })
  }

  componentWillUnmount() {}

  componentDidShow() {}

  componentDidHide() {}

  changeRate(rate) {
    this.setState({
      rate: rate
    })
  }

  addImg() {
    Taro.chooseImage().then(res => {
      console.log(res.tempFiles)
      if (this.state.imgList.length + res.tempFilePaths.length > 5) {
        Taro.showToast({
          title: '最多5张图片',
          icon: 'none'
        })
        return
      }
      if (res.tempFiles.some(item => item.size > 5242880)) {
        Taro.showToast({
          title: '图片不能大于5M',
          icon: 'none'
        })
        return
      }
      if (res.tempFiles.some(item => item.size < 51200)) {
        Taro.showToast({
          title: '图片不能小于50KB',
          icon: 'none'
        })
        return
      }
      res.tempFilePaths = res.tempFilePaths.map(item => {
        return {
          image: item,
          progress: 0
        }
      })
      let len = this.state.imgList.length
      this.setState(
        {
          imgList: this.state.imgList.concat(res.tempFilePaths)
        },
        () => {
          res.tempFilePaths.map((item, index) => {
            this.uploadImage(item.image, index + len)
          })
        }
      )
    })
  }

  uploadImage(item, index) {
    const uploadTask = Taro.uploadFile({
      url: 'https://orca-file-ap.yundian.xyz/upload_multiple/feedback',
      filePath: item,
      name: 'files',
      header: {
        Authorization:
          'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IlJheSIsImlhdCI6MTUxNjIzOTAyMn0.cqHnyqfq34zAeFEcdPkU58TQJU6uJ10awKe196RJEZg'
      },
      success: res => {
        let data = JSON.parse(res.data)
        this.photos[index] = data[0].url
      }
    })
    uploadTask.progress(res => {
      let imgList = this.state.imgList
      imgList[index].progress = res.progress
      this.setState({
        imgList: imgList
      })
    })
  }

  delImg(index) {
    let imgList = this.state.imgList
    console.log(index, imgList)
    imgList.splice(index, 1)
    console.log(index, imgList)
    this.setState({
      imgList: imgList
    })
  }

  changeIncognito() {
    this.setState({
      anonymous: !this.state.anonymous
    })
  }

  voteDown(index) {
    let item = this.state.items[index]
    item.vote = 'down'
    this.setState({
      items: this.state.items
    })
  }

  voteUp(index) {
    let item = this.state.items[index]
    item.vote = 'up'
    this.setState({
      items: this.state.items
    })
  }

  setComment(e) {
    this.setState({
      comment: e.detail.value
    })
  }

  submitAssess() {
    const { comment, anonymous, rate, items } = this.state
    let itemVoteList = []
    items.map(item => {
      itemVoteList.push({
        item: item.name,
        vote: item.vote
      })
    })
    Taro.$http({
      method: 'POST',
      url: `/orders/${this.state.id}/feedback`,
      data: {
        comment,
        anonymous,
        rating: rate,
        items: itemVoteList,
        photos: this.photos
      }
    }).then(() => {
      Taro.setStorageSync('assessSubmit', 1)
      Taro.navigateBack()
    })
  }

  render() {
    const { shop, items, comment, anonymous, rate, rateConvert, imgList } = this.state
    return (
      <View className="assess">
        <Navbar title="评价" bgColor="#f5f5f5"></Navbar>
        <View className="submit" onClick={this.submitAssess.bind(this)}>
          <Text>提交</Text>
        </View>
        <View className="submit-blank"></View>
        <View className="assess-wrap">
          {/* <View className='block horseman'>
            <View className='horseman-info'>
              <Image src='https://img2.woyaogexing.com/2018/09/25/a7ecc2686e6e43698d1cebfdce8eb237!400x400.jpeg'></Image>
              <View className='horseman-info-rt'>
                <View className='name'>王硕<Text>美团专送</Text></View>
                <View className='time'>今天13:35左右送达<Text className='time-revise'>校准时间<Text className='at-icon at-icon-chevron-right'></Text></Text></View>
              </View>
            </View>
            <View className='manner'>
              <View className='manner-item'>
                <Image src={assessN}></Image>
                <View>不满意</View>
              </View>
              <View className='manner-item manner-y active'>
                <Image src={assessY}></Image>
                <View>满意</View>
              </View>
            </View>
            <View className='impression'>
              <View className='impression-item active'>礼貌热情</View>
              <View className='impression-item active'>穿戴工服</View>
              <View className='impression-item active'>仪表整洁</View>
              <View className='impression-item'>货品完好</View>
              <View className='impression-item active'>风雨无阻</View>
              <View className='impression-item'>快速准时</View>
              <View className='impression-item'><Text className='at-icon at-icon-edit'></Text>写评价</View>
            </View>
          </View> */}

          <View className="block rate">
            <View className="rate-tit">
              <View>您对商家/菜品满意吗？</View>
              <View className="incognito" onClick={this.changeIncognito}>
                匿名提交<Text className={'at-icon at-icon-check ' + (anonymous ? 'sel' : '')}></Text>
              </View>
            </View>
            <View className="store">
              <Image src={shop.icon}></Image>
              <View>{shop.name}</View>
            </View>
            <View className="rate-score">
              <View className="label">评分</View>
              <View className="star">
                {[1, 2, 3, 4, 5].map(item => {
                  return (
                    <View
                      key={item}
                      taroKey={item}
                      className={'at-icon at-icon-star-2 ' + (item <= rate ? 'sel' : '')}
                      onClick={this.changeRate.bind(this, item)}
                    ></View>
                  )
                })}
              </View>
              <View>{rateConvert[rate]}</View>
            </View>
            <View className="graphic">
              <Textarea
                className="textarea"
                value={comment}
                onBlur={this.setComment.bind(this)}
                placeholder="口味赞，包装好，推荐给大家"
                placeholderClass="textarea-placeholder"
              ></Textarea>
              <View className="graphic-list">
                {imgList.map((item, index) => {
                  return (
                    <View className="graphic-item" key={item.image} taroKey={item.image}>
                      <Image mode="aspectFill" src={item.image}></Image>
                      {item.progress !== 100 ? (
                        <View className="cover">
                          <View className="progress-wrap">
                            <View className="progress" style={`width: ${item.progress}%`}></View>
                          </View>
                        </View>
                      ) : (
                        <Text onClick={this.delImg.bind(this, index)} className="at-icon at-icon-close"></Text>
                      )}
                    </View>
                  )
                })}
                <View className="graphic-add" onClick={this.addImg}>
                  <View className="at-icon at-icon-camera"></View>
                  <View>添加图片</View>
                </View>
              </View>
            </View>
            <View className="product-list">
              {items.map((item, index) => {
                return (
                  <View key={item.id} taroKey={item.id} className="item">
                    <View className="item-name">
                      <Image mode="aspectFill" src={item.image}></Image>
                      <View>{item.name}</View>
                    </View>
                    <View className="item-gb">
                      <View className="item-gb-c" onClick={this.voteDown.bind(this, index)}>
                        <Image src={item.vote === 'up' ? assessC : assessCS}></Image>
                        <Text>踩</Text>
                      </View>
                      <View className="item-gb-z" onClick={this.voteUp.bind(this, index)}>
                        <Image src={item.vote === 'up' ? praise_2 : assessZ}></Image>赞
                      </View>
                    </View>
                  </View>
                )
              })}
            </View>
          </View>
        </View>
      </View>
    )
  }
}

export default Assess
