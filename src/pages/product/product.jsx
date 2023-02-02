import Taro, { Component } from '@tarojs/taro'
import { connect } from '@tarojs/redux'
import { View, Image, Text, Swiper, SwiperItem, Button } from '@tarojs/components'
import { dateFormat } from '../../utils/util'
import { onSetCartsData } from '../../actions/global'
import Navbar from '../../components/navBar/navBar'
import CartPay from '../../components/cartPay/cartPay'
import SpecsModal from '../../components/specsModal/specsModal'
import StoreCard from '../../components/storeCard/storeCard'
import Loading from '../../components/loading/loading'
import Contact from '../../components/contact/contact'
import Share from '../../components/share/share'
import './product.scss'
import praise1 from '../../assets/img/praise_1.png'
import praise2 from '../../assets/img/praise_2.png'
import assessCS from '../../assets/img/assess_c.png'

@connect(({ globalData }) => ({
  globalData
}), dispatch => ({
  onSetCartsData (carts) {
    dispatch(onSetCartsData(carts))
  }
}))
class Product extends Component {
  constructor() {
    super(...arguments)
    this.adding = false
    this.cuting = false
    this.state = {
      id: this.$router.params.id,
      product: { fields: [], options: [], photos: [], price: 0, shop: { contact: { phone: '' } } },
      carts: {},
      cartCurrentSpu: {},
      specModal: false,
      isShareShow: false,
      navbarHeight: '',
      navbarBgColor: 'rgba(255, 255, 255, 0)',
      navbarColor: 'rgba(255, 255, 255, 1)',
      backBackground: 'rgba(0, 0, 0, 0.4)',
      feedbackList: [],
      referrer: this.$router.params.referrer,
      total: 0,
      vote: 0,
      voteRatio: '',
      loading: true,
      cartPayLoad: true,
      contactModal: false
    }
  }

  componentWillMount() {
    this.getFeedbackList()
  }

  componentDidMount() {
    let navbarHeight =
      this.props.globalData.systemInfo.statusBarHeight +
      (this.props.globalData.systemInfo.system.indexOf('Adr') > -1 ? 48 : 44)

    this.setState({
      navbarHeight: navbarHeight,
      swiperHeight: wx.getSystemInfoSync().windowWidth,
      scrollHold: (this.props.globalData.systemInfo.screenWidth / 750) * 500
    })

    this.getProductDetail()
  }

  componentWillUnmount() {}

  componentDidShow() {}

  componentDidHide() {}

  onPageScroll(e) {
    if (e.scrollTop < this.state.swiperHeight) {
      this.setState({
        navbarBgColor: `rgba(255, 255, 255, 0)`,
        navbarColor: 'rgba(255, 255, 255, 1)',
        backBackground: 'rgba(0, 0, 0, 0.4)'
      })
    }
    if (e.scrollTop >= this.state.swiperHeight && e.scrollTop <= this.state.scrollHold) {
      let ratio = (e.scrollTop - this.state.swiperHeight) / this.state.navbarHeight
      this.setState({
        navbarBgColor: `rgba(255, 255, 255, ${ratio})`,
        navbarColor: `rgba(${255 - 204 * ratio}, ${255 - 204 * ratio}, ${255 - 204 * ratio}, 1)`,
        backBackground: `rgba(${255 * ratio}, ${255 * ratio}, ${255 * ratio}, ${0.4 + 0.6 * ratio})`
      })
    } else if (e.scrollTop > this.state.scrollHold) {
      this.setState({
        navbarBgColor: `rgba(255, 255, 255, 1)`,
        navbarColor: 'rgba(51, 51, 51, 1)',
        backBackground: 'rgba(255, 255, 255, 1)'
      })
    }
  }

  addCart(type) {
    if (this.adding) return
    this.adding = true
    if (type.indexOf('simple') > -1) {
      let cartAddData = {
        spu: this.state.product.id,
        sku: this.state.product.skus[0].id,
        qty: type.indexOf('_min') > -1 ? this.state.product.skus[0].min_order : 1,
        options: []
      }
      Taro.$http({ url: `/shops/${this.state.product.shop.id}/cart`, method: 'POST', data: cartAddData }).then(res => {
        this.cartChange(res)
        this.adding = false
      })
    } else {
      this.adding = false
      this.setState({
        specModal: true
      })
    }
  }

  cutCart() {
    if (this.cuting) return
    this.cuting = true
    if (this.state.cartCurrentSpu.qty > 0) {
      Taro.$http({url: '/shops/' + this.state.product.shop.id + '/cart/' + this.state.cartCurrentSpu.id, data: {qty: this.state.cartCurrentSpu.qty - 1}, method: 'PUT'}).then(res => {
        this.cartChange(res)
        this.cuting = false
      })
    } else {
      this.cuting = false
    }
  }

  cartChange(cart) {
    console.log(cart)
    if (cart) {
      let cartCurrentSpu = cart.items.find(item => item.spu === this.state.id)
      this.props.onSetCartsData(cart)
      this.setState({
        carts: cart,
        cartCurrentSpu: cartCurrentSpu || {}
      })
    }
  }

  closeSpecModal() {
    this.setState({
      specModal: false
    })
  }

  onShareAppMessage() {
    return {
      path: '/pages/product/product?referrer=share&id=' + this.state.id
    }
  }

  submitOrder() {
    Taro.navigateTo({
      url: '/pages/submitOrder/submitOrder'
    })
  }

  previewImage(index) {
    const photos = this.state.product.photos.map(i => i.url)
    Taro.previewImage({
      current: photos[index],
      urls: photos
    })
  }

  getProductDetail() {
    let carts = this.props.globalData.carts
    let url = `/items/${this.state.id}?shop=true`
    if (!carts.items.length) {
      url += '&cart=true'
    }
    Taro.$http({ url }).then(res => {
      if (this.state.referrer === 'share') {
        let visitedList = Taro.getStorageSync('visitedList') || []
        visitedList.unshift({
          id: res.shop.id,
          name: res.shop.name,
          icon: res.shop.icon,
          time: Date.now()
        })
        Taro.setStorage({
          key: 'visitedList',
          data: visitedList
        })
      }

      const first = res.photos[0]

      if (first && first.height) {
        let height

        if (first.height / first.width > 4 / 3) {
          height = (this.state.swiperHeight * 4) / 3
        } else if (first.width / first.height > 4 / 3) {
          height = (this.state.swiperHeight * 3) / 4
        } else {
          height = (first.height * this.state.swiperHeight) / first.width
        }

        this.setState({
          swiperHeight: height
        })
      }
      // 初始化cart数据
      let cartData = carts.items.length ? carts : res.cart ? res.cart : {items: []}
      this.setState(
        {
          product: res,
          carts: cartData,
          cartCurrentSpu: cartData.items.find(item => item.spu === this.state.id) || {},
          loading: false
        },
        () => {
          this.setState({
            cartPayLoad: false
          })
        }
      )
    })
  }

  getFeedbackList() {
    Taro.$http({ url: `/items/${this.state.id}/feedbacks`, data: { page_size: 5 } }).then(res => {
      let vote = 0
      res.feedbacks.map(item => {
        if (item.vote === 'up') {
          vote++
        }
      })
      this.setState({
        feedbackList: res.feedbacks,
        total: res.total,
        vote: vote,
        voteRatio: vote * 10 + '%'
      })
    })
  }

  setContactModal() {
    this.setState({
      contactModal: !this.state.contactModal
    })
  }

  changeShareShow() {
    this.setState({
      isShareShow: !this.state.isShareShow
    })
  }

  render() {
    const {
      name,
      desc,
      stats,
      currency_symbol,
      fields,
      price,
      original_price,
      photos,
      options,
      skus,
      shop,
      featured,
      hot,
      promo,
      cartCurrentSpu
    } = this.state.product
    return (
      <View className="product">
        <Navbar
          title=""
          backHome={this.state.referrer === 'share'}
          needBack={this.state.referrer !== 'share'}
          backBackground={this.state.backBackground}
          bgColor={this.state.navbarBgColor}
          color={this.state.navbarColor}
        ></Navbar>
        <Share
          type="items"
          rqId={this.state.id}
          isShareShow={this.state.isShareShow}
          onChangeShareShow={this.changeShareShow.bind(this)}
        ></Share>
        {this.state.contactModal && (
          <Contact
            phone={shop.contact.phone}
            photo={shop.contact.wechat_qrcode}
            onSetContactModal={this.setContactModal.bind(this)}
          ></Contact>
        )}
        {this.state.loading ? (
          <Loading></Loading>
        ) : (
          <View>
            <CartPay
              shop={shop}
              isHidden={this.state.cartPayLoad}
              onCartChange={this.cartChange.bind(this)}
              onSetContactModal={this.setContactModal.bind(this)}
              carts={this.state.carts}
            ></CartPay>
            <View className="swiper-box" style={`height: ${this.state.swiperHeight - this.state.navbarHeight}px`}>
              <Swiper className="swiper" style={`height: ${this.state.swiperHeight}px`}>
                {photos.map((item, index) => {
                  return (
                    <SwiperItem key={item.url} taroKey={item.url}>
                      <View className="swiper-item">
                        <Image
                          onClick={this.previewImage.bind(this, index)}
                          mode={photos.images[0].id === item.id ? 'aspectFit' : 'aspectFit'}
                          src={item.url}
                        ></Image>
                      </View>
                    </SwiperItem>
                  )
                })}
              </Swiper>

              <Button className="share" onClick={this.changeShareShow.bind(this)}>
                分享
              </Button>
            </View>
            <View className="detail">
              <View className="title">
                <Text className="name">{name}</Text>
              </View>
              {/* <View className='label'>
                  <Text>1袋</Text>
                  <Text>不辣</Text>
                </View> */}
              <View className="sell">
                {stats.sold > 0 && <text>月售 {stats.sold}</text>}
                {featured && <Text className="tag featured">店长推荐</Text>}
                {hot && <Text className="tag">热销</Text>}
              </View>
              <View className="price">
                {currency_symbol}
                <Text>{price.toFixed(2)}</Text>
                {original_price > price && (
                  <Text className="origin">
                    {currency_symbol}
                    {original_price}
                  </Text>
                )}
              </View>
              {promo && (
                <View className="price-dis">
                  <View className="at-icon at-icon-tag"></View>
                  <View>{promo}</View>
                </View>
              )}
              <View className="addcart">
                {skus.length <= 1 && options.length === 0 ? skus[0].min_order <= 1 || cartCurrentSpu.qty ? (
                  <View className="addcart-view">
                    {
                      cartCurrentSpu.qty > 0 ? (<View className='show-num'>
                        <View className="cut at-icon at-icon-subtract" onClick={this.cutCart}></View>
                          <View className="num">{cartCurrentSpu.qty}</View>
                        </View>
                      ) : ''
                    }
                    <View className="plus at-icon at-icon-add" onClick={this.addCart.bind(this, 'simple')}></View>
                  </View>
                ) : (
                  <View className="specs" onClick={this.addCart.bind(this, 'simple_min')}>
                    {skus[0].min_order}个起购
                  </View>
                ) : (
                  <View className="specs" onClick={this.addCart.bind(this, 'complex')}>
                    选规格
                  </View>
                )}
              </View>
            </View>
            {this.state.referrer === 'share' && <StoreCard storeInfo={shop} isStore share></StoreCard>}
            <View className="param">
              <View className="tab">
                <View>详情</View>
              </View>
              <View className="param-item">
                <View className="title">掌柜描述：</View>
                <View className="content">{desc}</View>
              </View>
              {fields.map(item => {
                return (
                  <View key={item.name} taroKey={item.name} className="param-item">
                    <View className="title">{item.name}：</View>
                    <View className="content">{item.value}</View>
                  </View>
                )
              })}
            </View>
            <View className="assess">
              <View className="assess-head">
                <View className="name">
                  评价<Text>(好评度{this.state.voteRatio})</Text>
                </View>
                <View className="num">
                  {this.state.total}条评论<Text className="at-icon at-icon-chevron-right"></Text>
                </View>
              </View>
              <View className="assess-praise">
                <Image src={praise1}></Image>
                <Text>{this.state.vote}</Text>
              </View>
              <View className="assess-list">
                {this.state.feedbackList.map(item => {
                  return (
                    <View className="assess-list-item" key={item.id} taroKey={item.id}>
                      <Image className="avatar" src={item.user.avatar}></Image>
                      <View className="user">
                        <View className="name">
                          {item.user.nickname}
                          <Text className="time">{dateFormat(item.created_at, 'yyyy-MM-dd')}</Text>
                        </View>
                        {item.vote === 'up' ? (
                          <View className="record">
                            <Image src={praise2}></Image>
                            <Text>赞</Text>
                          </View>
                        ) : (
                          <View className="record">
                            <Image src={assessCS}></Image>
                            <Text>踩</Text>
                          </View>
                        )}
                        <View className="word">{item.comment}</View>
                      </View>
                    </View>
                  )
                })}
              </View>
            </View>
          </View>
        )}

        <SpecsModal
          specModal={this.state.specModal}
          spu={this.state.product}
          shopId={shop.id}
          symbol={currency_symbol}
          onCartChange={this.cartChange.bind(this)}
          onAddCart={this.addCart.bind(this)}
          onCloseSpecModal={this.closeSpecModal.bind(this)}
        ></SpecsModal>
      </View>
    )
  }
}

export default Product
