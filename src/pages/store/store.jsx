import Taro, { Component } from '@tarojs/taro'
import { connect } from '@tarojs/redux'
import { View, Text, Image, ScrollView, Swiper, SwiperItem, Picker, Textarea } from '@tarojs/components'
import { dateFormat, dateDiffCompare } from '../../utils/util'
import { onSetCartsData } from '../../actions/global'
import Navbar from '../../components/navBar/navBar'
import CartPay from '../../components/cartPay/cartPay'
import Dynamic from '../../components/dynamic/dynamic'
import SpecsModal from '../../components/specsModal/specsModal'
import LoadMore from '../../components/loadMore/loadMore'
import Loading from '../../components/loading/loading'
import Contact from '../../components/contact/contact'
import Share from '../../components/share/share'
import './store.scss'
import greenCheck from '../../assets/img/green_check.png'
import location from '../../assets/img/location.png'
import phone from '../../assets/img/contact_shop.png'
import deliveryServer from '../../assets/img/delivery_server.png'
import deliveryTime from '../../assets/img/delivery_time.png'
import storeTips from '../../assets/img/store_tips.png'
import placeholder from '../../assets/img/placeholder.jpg'

@connect(
  ({ globalData }) => ({
    globalData
  }),
  dispatch => ({
    onSetCartsData(carts) {
      dispatch(onSetCartsData(carts))
    }
  })
)
class Store extends Component {
  constructor() {
    super(...arguments)
    this.isEval = false
    this.needPageScroll = true
    this.switchCateAnimationFinish = true
    this.delayState = null
    this.feedbackSummaryDelay = null
    this.contentScrollIdList = []
    this.shareOut = false
    this.cuting = false
    this.adding = false
    this.loadMoring = {
      all: false,
      good: false,
      bad: false,
      photo: false,
      reply: false
    }
    this.state = {
      id: this.$router.params.id || '123456',
      referrer: this.$router.params.referrer || 'normal',
      isCollect: false,
      isShareShow: false,
      isComplaint: false,
      complaintSelector: [],
      complaintSelectorChecked: '请选择',
      complaintDescription: '',
      categoryList: [],
      indexActiveName: '',
      indexScrollId: 0,
      contentScrollId: 0,
      storeInfo: {
        promos: [],
        contact: {}
      },
      carts: {},
      cartData: {},
      navbarBgColor: 'rgba(255, 255, 255, 0)',
      navbarColor: 'rgba(255, 255, 255, 1)',
      storeCardBoxOpen: false,
      storeCardBoxOpenHeight: '',
      bgTop: 0,
      navbarHeight: '',
      current: 0,
      tabTop: '', // 4个tab到顶部的距离
      specModal: false,
      currentSpu: { skus: [{}], options: [] },
      showBackTop: false,
      loadFeedback: true,
      pageLoading: true,
      contactModal: false,
      feedbackType: 'all',
      feedbackSummaryInit: false,
      feedbackSummary: {
        has_photos: 0,
        negative: 0,
        positive: 0,
        replied: 0
      },
      currentState: {
        1: {
          init: false,
          noMore: false,
          list: [],
          pageIndex: 1,
          pageSize: 20
        },
        2: {
          all: {
            init: false,
            list: [],
            noMore: false,
            pageIndex: 1,
            pageSize: 20
          },
          good: {
            init: false,
            list: [],
            noMore: false,
            pageIndex: 1,
            pageSize: 20
          },
          bad: {
            init: false,
            list: [],
            noMore: false,
            pageIndex: 1,
            pageSize: 20
          },
          photo: {
            init: false,
            list: [],
            noMore: false,
            pageIndex: 1,
            pageSize: 20
          },
          reply: {
            init: false,
            list: [],
            noMore: false,
            pageIndex: 1,
            pageSize: 20
          }
        }
      },
      rateConvert: {
        1: '很差',
        2: '一般',
        3: '满意',
        4: '很满意',
        5: '完美'
      }
    }
  }

  componentDidMount() {
    this.setState({
      navbarHeight:
        this.props.globalData.systemInfo.statusBarHeight +
        (this.props.globalData.systemInfo.system.indexOf('Adr') > -1 ? 48 : 44),
      bgTop:
        (145 / 750) * this.props.globalData.systemInfo.screenWidth +
        this.props.globalData.systemInfo.statusBarHeight +
        (this.props.globalData.systemInfo.system.indexOf('Adr') > -1 ? 48 : 44)
    })
    Taro.$http({ url: `/shops/${this.state.id}/bulk` }).then(res => {
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
      this.props.onSetCartsData(res.cart)
      this.setState({
        storeInfo: res.shop,
        categoryList: res.categories,
        carts: res.cart,
        cartData: this.cartDataFormat(res.categories, res.cart.items),
        indexActiveName: res.categories[0].name,
        pageLoading: false
      })
    })
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.pageLoading !== this.state.pageLoading) {
      this.caclDom()
    }
  }

  caclDom() {
    const query = Taro.createSelectorQuery()
    query
      .select('.store-card-box')
      .boundingClientRect()
      .exec(res => {
        this.setState({
          storeCardBoxOpenHeight: `calc(100vh - ${res[0].top}PX - ${this.props.globalData.systemInfo.statusBarHeight}PX)`,
          tabTop: (297 / 208) * res[0].height
        })
      })
  }

  componentDidShow() {
    if (this.shareOut) {
      this.shareOut = false
      this.changeShareShow()
    }
  }

  componentDidHide() {}

  cartDataFormat(categoryList, items) {
    let cartData = {}
    categoryList = categoryList || this.state.categoryList
    items = items || this.state.carts.items
    categoryList.map((cate, cateIndex) => {
      cartData[cateIndex] = {}
      cate.spus.map((spu, spuIndex) => {
        let cartItemList = items.filter(item => spu.id == item.spu)
        if (cartItemList.length > 0) {
          let qty = cartItemList.reduce((num, item) => num + item.qty, 0)
          cartData[cateIndex][spuIndex] = qty
        }
      })
    })
    return cartData
  }

  getMomentsList(delay) {
    let { pageIndex, noMore, pageSize, list } = this.state.currentState[1]
    if (noMore) {
      return
    }
    Taro.$http({ url: `/shops/${this.state.id}/moments`, data: { page_index: pageIndex, page_size: pageSize } }).then(
      res => {
        if (pageIndex * pageSize >= res.total) {
          noMore = true
        } else {
          pageIndex++
        }
        let currentState = {
          ...this.state.currentState,
          1: {
            list: res.moments.concat(list),
            noMore: noMore,
            pageIndex: pageIndex,
            init: true,
            pageSize: pageSize
          }
        }
        if (delay === 'delay') {
          if (this.switchCateAnimationFinish) {
            this.setState({
              currentState: currentState
            })
            this.delayState = null
          } else {
            this.delayState = currentState
          }
        } else {
          this.setState({
            currentState: currentState
          })
        }
      }
    )
  }

  setFeedbackType(type) {
    this.setState({
      feedbackType: type
    })
    if (!this.state.currentState[2][type].init) {
      this.getFeedbackList(type)
    }
  }

  getFeedbackList(type, delay) {
    let { pageIndex, noMore, pageSize, list } = this.state.currentState[2][type]
    if (this.loadMoring[type]) {
      return
    }
    this.loadMoring[type] = true
    if (noMore) {
      return
    }
    Taro.$http({
      url: `/shops/${this.state.id}/feedbacks`,
      data: { type: type, page_index: pageIndex, page_size: pageSize }
    }).then(res => {
      if (pageIndex * pageSize >= res.total) {
        noMore = true
      } else {
        pageIndex++
      }

      let currentState = {
        ...this.state.currentState,
        2: {
          ...this.state.currentState[2],
          [type]: {
            list: res.feedbacks.concat(list),
            noMore: noMore,
            pageIndex: pageIndex,
            init: true,
            pageSize: pageSize
          }
        }
      }
      this.loadMoring[type] = false
      if (delay === 'delay') {
        if (this.switchCateAnimationFinish) {
          this.setState({
            currentState: currentState
          })
          this.delayState = null
        } else {
          this.delayState = currentState
        }
      } else {
        this.setState({
          currentState: currentState
        })
      }
    })
  }

  getFeedbackSummary() {
    Taro.$http({ url: `/shops/${this.state.id}/feedback_summary` }).then(res => {
      if (this.switchCateAnimationFinish) {
        this.setState({
          feedbackSummary: res,
          feedbackSummaryInit: true
        })
      } else {
        this.feedbackSummaryDelay = res
      }
    })
  }

  setContentScrollId(index) {
    if (this.contentScrollIdList.length === 0) {
      this.initContentScrollIdList().then(() => {
        this.setContentScrollIdFn(index)
      })
    } else {
      this.setContentScrollIdFn(index)
    }
  }

  setContentScrollIdFn(index) {
    this.setState({
      indexScrollId: index,
      contentScrollId: index,
      indexActiveName: this.contentScrollIdList[index].name
    })
  }

  closeSpecModal() {
    this.setState({
      specModal: false
    })
  }

  addCart(spu, type, e) {
    if (this.adding) return
    this.adding = true
    e.stopPropagation()
    if (type.indexOf('simple') > -1) {
      let cartAddData = {
        spu: String(spu.id),
        sku: String(spu.skus[0].id),
        qty: type.indexOf('_min') > -1 ? spu.skus[0].min_order : 1,
        options: []
      }
      Taro.$http({ url: `/shops/${this.state.id}/cart`, method: 'POST', data: cartAddData }).then(res => {
        this.cartChange(res)
        this.adding = false
      })
    } else {
      this.setState(
        {
          specModal: true,
          currentSpu: spu
        },
        () => {
          this.adding = false
        }
      )
    }
  }

  cutCart(spu, e) {
    if (this.cuting) return
    this.cuting = true
    e.stopPropagation()
    let cartCurrentSpu = this.state.carts.items.find(item => item.spu === spu.id)
    if (cartCurrentSpu && cartCurrentSpu.id) {
      Taro.$http({
        url: '/shops/' + this.state.id + '/cart/' + cartCurrentSpu.id,
        data: { qty: cartCurrentSpu.qty - 1 },
        method: 'PUT'
      }).then(res => {
        this.cartChange(res)
        this.cuting = false
      })
    } else {
      this.cuting = false
    }
  }

  contentScroll(e) {
    if (this.isEval) {
      return
    }
    this.isEval = true
    setTimeout(() => {
      if (this.contentScrollIdList.length === 0) {
        this.initContentScrollIdList().then(() => {
          this.contentScrollChange(e)
        })
      } else {
        this.contentScrollChange(e)
      }
    }, 200)
    this.setPageScrollTop(e)
  }

  contentScrollChange(e) {
    let len = this.contentScrollIdList.length
    this.isEval = false
    for (let i = 0; i < len; i++) {
      let nextI = i + 1 === len ? i : i + 1
      if (
        this.contentScrollIdList[i].top < e.detail.scrollTop &&
        this.contentScrollIdList[nextI].top > e.detail.scrollTop
      ) {
        this.setState({
          indexScrollId: i,
          indexActiveName: this.contentScrollIdList[i].name
        })
      }
    }
  }

  initContentScrollIdList() {
    return new Promise(resolve => {
      const query = Taro.createSelectorQuery()
      query
        .selectAll('.title')
        .boundingClientRect()
        .exec(res => {
          let contentScrollIdList = []
          let offsetTop = res[0][0].top
          res[0].map((item, index) => {
            contentScrollIdList.push({
              // tag: item.id.replace('content', ''),
              top: item.top - offsetTop,
              name: this.state.categoryList[index].name
            })
          })
          this.contentScrollIdList = contentScrollIdList
          resolve()
        })
    })
  }

  setPageScrollTop(e) {
    if (e.detail.scrollTop >= 20 && this.needPageScroll) {
      this.needPageScroll = false
      Taro.pageScrollTo({
        scrollTop: this.state.tabTop + 20 // 加20偏移值
      })
    } else {
      this.needPageScroll = true
    }
  }

  onPageScroll(e) {
    if (e.scrollTop <= 40) {
      this.setState({
        navbarBgColor: `rgba(255, 255, 255, ${e.scrollTop / 40})`,
        navbarColor: `rgba(${255 - (204 * e.scrollTop) / 40}, ${255 - (204 * e.scrollTop) / 40}, ${255 -
          (204 * e.scrollTop) / 40}, 1)`
      })
    } else {
      if (this.state.navbarBgColor !== 'rgba(255, 255, 255, 1)') {
        this.setState({
          navbarBgColor: `rgba(255, 255, 255, 1)`,
          navbarColor: `rgba(51, 51, 51, 1)`
        })
      }
    }
    if (this.state.showBackTop !== e.scrollTop + 20 > this.state.tabTop) {
      this.setState({
        showBackTop: e.scrollTop + 20 > this.state.tabTop // 加20偏移值
      })
    }
  }

  openStoreCard() {
    this.setState({
      storeCardBoxOpen: true
    })
  }

  closeStoreCard(e) {
    e.stopPropagation()
    this.setState({
      storeCardBoxOpen: false
    })
  }

  switchCateFinish(e) {
    console.log(e)
    this.switchCateAnimationFinish = true
    if (this.delayState) {
      this.setState(
        {
          currentState: this.delayState
        },
        () => {
          this.delayState = null
        }
      )
    }
    if (this.feedbackSummaryDelay) {
      this.setState(
        {
          feedbackSummary: this.feedbackSummaryDelay,
          feedbackSummaryInit: true
        },
        () => {
          this.feedbackSummaryDelay = null
        }
      )
    }
  }

  switchCate(e) {
    console.timeEnd('time')
    this.switchCateAnimationFinish = false
    if (e.detail.source === 'touch') {
      this.setState({
        current: e.detail.current
      })
    }
    if (e.detail.current === 1 && !this.state.currentState[1].init) {
      this.getMomentsList('delay')
    }
    if (e.detail.current === 2 && !this.state.feedbackSummaryInit) {
      this.getFeedbackList('all', 'delay')
      this.getFeedbackSummary()
    }
  }

  setCurrent(i) {
    this.setState({
      current: i
    })
    console.time('time')
  }

  backTop() {
    Taro.pageScrollTo({
      scrollTop: 0
    })
  }

  toProduct(id) {
    Taro.navigateTo({
      url: '/pages/product/product?referrer=store&id=' + id
    })
  }

  toPhotoList(id) {
    Taro.navigateTo({
      url: '/pages/photoList/photoList?id=' + id
    })
  }

  collectStore() {
    Taro.$http({ method: 'POST', url: `/shops/${this.state.id}/bookmark` }).then(res => {
      Taro.showToast({
        title: '收藏成功',
        icon: 'none'
      })
      this.setState({
        isCollect: true
      })
    })
  }

  commentPhotosPreview(items, item) {
    Taro.previewImage({
      current: item,
      urls: items
    })
  }

  goHome() {
    Taro.switchTab({
      url: '/pages/home/home'
    })
  }

  onShareAppMessage() {
    this.shareOut = true
    return {
      path: '/pages/store/store?referrer=share&id=' + this.state.id
    }
  }

  cartChange(cart) {
    if (cart) {
      this.props.onSetCartsData(cart)
      this.setState({
        carts: cart,
        cartData: this.cartDataFormat(null, cart.items)
      })
    }
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

  changeComplaint() {
    if (this.state.complaintSelector.length === 0) {
      Taro.$http({ url: '/report_categories' }).then(res => {
        this.setState({
          isComplaint: !this.state.isComplaint,
          complaintSelector: res
        })
      })
    } else {
      this.setState({
        isComplaint: !this.state.isComplaint,
        complaintSelectorChecked: '请选择',
        complaintDescription: ''
      })
    }
  }

  changeComplaintSelectorChecked(e) {
    this.setState({
      complaintSelectorChecked: this.state.complaintSelector[e.detail.value]
    })
  }

  setComplaintDescription(e) {
    this.setState({
      complaintDescription: e.detail.value
    })
  }

  postComplaint() {
    if (this.state.complaintSelectorChecked === '请选择') {
      Taro.showToast({
        title: '投诉类型不能为空',
        icon: 'none'
      })
      return
    }
    if (!this.state.complaintDescription.trim()) {
      Taro.showToast({
        title: '投诉内容不能为空',
        icon: 'none'
      })
      return
    }
    Taro.$http({
      method: 'POST',
      url: `/shops/${this.state.id}/report`,
      data: {
        category: this.state.complaintSelectorChecked,
        description: this.state.complaintDescription,
        shop: this.state.id
      }
    }).then(() => {
      this.changeComplaint()
      Taro.showToast({
        title: '提交成功',
        icon: 'none'
      })
    })
  }

  stopPro (e) {
    if (this.state.storeCardBoxOpen) {
      e.stopPropagation()
    }
  }

  render() {
    const { carts, currentState, storeInfo, cartData } = this.state
    const currency_symbol = storeInfo.currency_symbol
    const feedbackList = currentState[2][this.state.feedbackType].list
    const feedbackListNoMore = currentState[2][this.state.feedbackType].noMore
    const indexList = this.state.categoryList.map((item, index) => {
      let num = 0
      for (let cartDataItem in cartData[index]) {
        num += cartData[index][cartDataItem]
      }
      return (
        <View
          className={'li' + ' ' + (this.state.indexScrollId === index ? 'active' : '')}
          onClick={this.setContentScrollId.bind(this, index)}
          key={item.name}
          taroKey={item.name}
        >
          {item.icon && <Image src={item.icon}></Image>}
          <Text>{item.name}</Text>
          {num > 0 && <View>{num}</View>}
        </View>
      )
    })

    const contentList = this.state.categoryList.map((item, index) => {
      return (
        <View key={item.name} taroKey={item.name}>
          <View className="title" id={'content' + index}>
            {item.name}
          </View>
          <View>
            {item.spus.map((spu, spuIndex) => {
              return (
                <View className="spu" key={spu.id} taroKey={spu.id}>
                  <Image
                    className="spu-img"
                    mode="aspectFill"
                    lazyLoad
                    src={spu.photo || placeholder}
                    onClick={this.toProduct.bind(this, spu.id)}
                  ></Image>
                  <View className="spu-msg">
                    <View className="spu-msg-main">
                      <View className="name" onClick={this.toProduct.bind(this, spu.id)}>
                        {spu.name}
                      </View>
                      <View className="sell">
                        {spu.stats.sold > 0 && <text>月售 {spu.stats.sold}</text>}
                        {spu.featured && <Text className="tag featured">店长推荐</Text>}
                        {spu.hot && <Text className="tag">热销</Text>}
                      </View>
                      <View className="des">{spu.desc}</View>
                    </View>
                    <View className="price">
                      <Text className="currency">{currency_symbol}</Text>
                      {spu.price}
                      {spu.original_price > spu.price && (
                        <Text className="origin">
                          {currency_symbol}
                          {spu.original_price}
                        </Text>
                      )}
                      <View className="addcart">
                        {spu.skus.length === 1 && spu.options.length === 0 ? spu.skus[0].min_order <= 1 || cartData[index][spuIndex] ? (
                          <View className="addcart-type">
                            {cartData[index][spuIndex] > 0 && (
                              <View
                                className="cut at-icon at-icon-subtract"
                                onClick={this.cutCart.bind(this, spu)}
                              ></View>
                            )}
                            {cartData[index][spuIndex] > 0 && <View className="num">{cartData[index][spuIndex]}</View>}
                            <View
                              className="plus at-icon at-icon-add"
                              onClick={this.addCart.bind(this, spu, 'simple')}
                            ></View>
                          </View>
                        ) : (
                          <View className="specs" onClick={this.addCart.bind(this, spu, 'simple_min')}>
                              {spu.skus[0].min_order}个起购
                          </View>
                        ) :(
                          <View className="addcart-type">
                            <View className="specs" onClick={this.addCart.bind(this, spu, 'complex')}>
                              选规格
                            </View>
                            {cartData[index][spuIndex] > 0 && (
                              <View className="red-icon-num">{cartData[index][spuIndex]}</View>
                            )}
                          </View>
                        )}
                      </View>
                    </View>
                    {spu.promo && (
                      <View className="price-dis">
                        <View className="at-icon at-icon-tag"></View>
                        <View>{spu.promo}</View>
                      </View>
                    )}
                  </View>
                </View>
              )
            })}
          </View>
        </View>
      )
    })
    return (
      <View className="store">
        <Navbar
          title=""
          needBack={this.state.referrer !== 'share'}
          color={this.state.navbarColor}
          bgColor={this.state.navbarBgColor}
        ></Navbar>
        <Share
          type="shops"
          rqId={this.state.id}
          isShareShow={this.state.isShareShow}
          onChangeShareShow={this.changeShareShow.bind(this)}
        ></Share>
        {this.state.isComplaint && (
          <View className="complaint" style={`visibility: ${this.state.isComplaint ? 'visible' : 'hidden'}`}>
            <View
              className="complaint-modal"
              style={`opacity: ${this.state.isComplaint ? '1' : '0'}`}
              onClick={this.changeComplaint.bind(this)}
            ></View>
            <View className="complaint-modal-body">
              <View className="field">
                <View className="label">投诉类型：</View>
                {this.state.complaintSelector.length > 0 && (
                  <Picker
                    className="picker"
                    mode="selector"
                    value={this.state.complaintSelectorChecked}
                    range={this.state.complaintSelector}
                    onChange={this.changeComplaintSelectorChecked.bind(this)}
                  >
                    <View className="picker-sel">{this.state.complaintSelectorChecked}</View>
                  </Picker>
                )}
              </View>
              <View className="field">
                <View className="label">说明：</View>
                <Textarea
                  className="textarea"
                  placeholder="投诉内容"
                  onInput={this.setComplaintDescription.bind(this)}
                ></Textarea>
              </View>
              <View className="operate">
                <View className="close" onClick={this.changeComplaint.bind(this)}>
                  取消
                </View>
                <View className="ok" onClick={this.postComplaint.bind(this)}>
                  提交
                </View>
              </View>
            </View>
          </View>
        )}

        {this.state.contactModal && (
          <Contact
            phone={storeInfo.contact.phone}
            photo={storeInfo.contact.wechat_qrcode}
            onSetContactModal={this.setContactModal.bind(this)}
          ></Contact>
        )}
        {this.state.pageLoading ? (
          <Loading></Loading>
        ) : (
          <View>
            {this.state.storeCardBoxOpen && <View className="modal" onTouchMove={this.stopPro.bind(this)}></View>}
            <View className="store-operate">
              <View className="operate-box">
                {this.state.referrer === 'share' && (
                  <View className="at-icon at-icon-home" onClick={this.goHome}></View>
                )}
                {this.state.isCollect ? (
                  <View className="at-icon at-icon-star-2"></View>
                ) : (
                  <View className="at-icon at-icon-star" onClick={this.collectStore.bind(this)}></View>
                )}
                <View className="at-icon at-icon-share" onClick={this.changeShareShow.bind(this)}></View>
                <View className="at-icon at-icon-alert-circle" onClick={this.changeComplaint.bind(this)}></View>
              </View>
              <Image
                className="store-operate-bg"
                lazyLoad
                mode="aspectFill"
                style={'height:' + this.state.bgTop + 'px'}
                src={storeInfo.cover}
              ></Image>
            </View>
            <View className="store-card" onClick={this.openStoreCard}>
              <View
                className={`store-card-box ${this.state.storeCardBoxOpen ? 'active' : ''}`}
                style={'height:' + (this.state.storeCardBoxOpen ? this.state.storeCardBoxOpenHeight : '208rpx')}
                onTouchMove={this.stopPro.bind(this)}
              >
                <View className="name">
                  <View>{storeInfo.name}</View>
                  <Image lazyLoad src={storeInfo.icon}></Image>
                </View>
                <View className="tag">
                  {storeInfo.services.map(item => {
                    return (
                      <View key={item} taroKey={item} className="tag-pre">
                        <Image src={greenCheck}></Image>
                        <Text>{item}</Text>
                      </View>
                    )
                  })}
                  {/* <View className='line'></View> */}
                </View>
                {!this.state.storeCardBoxOpen && (
                  <View>
                    <View className="coupon">
                      {storeInfo.promos.map(item => {
                        return item.type === 'mj' ? (
                          <Text key={item.off} taroKey={item.off}>
                            {item.spending}
                            <Text>减</Text>
                            {item.off}
                          </Text>
                        ) : (
                          <Text key="new" taroKey="new">
                            首单满{item.spending}减{item.off}
                          </Text>
                        )
                      })}
                    </View>
                    <View className="placard">
                      公告：{storeInfo.announcement || '-'}
                      <View className="at-icon at-icon-chevron-down"></View>
                    </View>
                  </View>
                )}
                {this.state.storeCardBoxOpen && (
                  <View className="hide-content">
                    <View className="line"></View>
                    <View className="coupon">
                      {storeInfo.promos.map(item => {
                        return item.type === 'mj' ? (
                          <Text key={item.off} taroKey={item.off}>
                            {item.spending}
                            <Text>减</Text>
                            {item.off}
                          </Text>
                        ) : (
                          <Text key="new" taroKey="new">
                            首单满{item.spending}减{item.off}
                          </Text>
                        )
                      })}
                    </View>
                    {/* <View className='dis'>
                        <View className='dis-item'>
                          <View className='dis-lg'>首</View>
                          <View className='dis-word'>新用户立减7元（本优惠与新人首单红包不可同享），首次支付最高再减3元，首次支付最高再减3元</View>
                        </View>
                        <View className='dis-item'>
                          <View className='dis-lg'>首</View>
                          <View className='dis-word'>新用户立减7元（本优惠与新人首单红包不可同享），首次支付最高再减3元，首次支付最高再减3元</View>
                        </View>
                      </View> */}
                    <View className="bulletin">公告</View>
                    <View className="bulletin-word">{storeInfo.announcement || '暂无'}</View>
                  </View>
                )}
                {this.state.storeCardBoxOpen && (
                  <View className="close" onClick={this.closeStoreCard}>
                    <View className="at-icon at-icon-chevron-up"> </View>
                  </View>
                )}
              </View>
            </View>
            <View className="store-tab">
              <View className="store-tab-item">
                <View className={this.state.current === 0 ? 'active' : ''} onClick={this.setCurrent.bind(this, 0)}>
                  商品
                </View>
              </View>
              <View className="store-tab-item">
                <View className={this.state.current === 1 ? 'active' : ''} onClick={this.setCurrent.bind(this, 1)}>
                  动态
                </View>
              </View>
              <View className="store-tab-item">
                <View className={this.state.current === 2 ? 'active' : ''} onClick={this.setCurrent.bind(this, 2)}>
                  评价
                </View>
                <Text>{storeInfo.feedbacks}</Text>
              </View>
              <View className="store-tab-item">
                <View className={this.state.current === 3 ? 'active' : ''} onClick={this.setCurrent.bind(this, 3)}>
                  商家
                </View>
              </View>
              <View
                className="top at-icon at-icon-arrow-up"
                style={`visibility: ${this.state.showBackTop ? 'visible' : 'hidden'}; opacity: ${
                  this.state.showBackTop ? '1' : '0'
                }`}
                onClick={this.backTop}
              ></View>
            </View>

            <Swiper
              className="swiper"
              style={`height: calc(100vh - 78rpx - ${this.state.navbarHeight}PX)`}
              onChange={this.switchCate}
              current={this.state.current}
              onAnimationFinish={this.switchCateFinish.bind(this)}
            >
              <SwiperItem className="swiper-item">
                <View className="sw-scroll-flex">
                  <ScrollView className="store-index" scrollY scrollWithAnimation>
                    {indexList}
                    <View className="store-index-pdd"></View>
                  </ScrollView>
                  <View className="store-content">
                    <View className="fixed-title">{this.state.indexActiveName}</View>
                    <ScrollView
                      className="store-content-scroll"
                      scrollY
                      scrollWithAnimation
                      scrollIntoView={'content' + this.state.contentScrollId}
                      onScroll={this.contentScroll}
                    >
                      {contentList}
                      <View className="store-content-pdd"></View>
                    </ScrollView>
                  </View>
                </View>
              </SwiperItem>
              <SwiperItem className="swiper-item">
                <ScrollView
                  scrollY
                  className="sw-scroll"
                  onScroll={this.setPageScrollTop}
                  onScrollToLower={this.getMomentsList.bind(this)}
                  lowerThreshold="50"
                >
                  {currentState[1].list.map(item => {
                    return (
                      <View key={item.id} taroKey={item.id} className="dynamic-card">
                        <Dynamic momentData={item}></Dynamic>
                      </View>
                    )
                  })}
                  <LoadMore noMore={currentState[1].noMore}></LoadMore>
                </ScrollView>
              </SwiperItem>
              <SwiperItem className="swiper-item">
                <ScrollView scrollX className="review-tab">
                  <View
                    className={this.state.feedbackType === 'all' ? 'review-tab-item active' : 'review-tab-item'}
                    onClick={this.setFeedbackType.bind(this, 'all')}
                  >
                    全部
                  </View>
                  <View
                    className={this.state.feedbackType === 'good' ? 'review-tab-item active' : 'review-tab-item'}
                    onClick={this.setFeedbackType.bind(this, 'good')}
                  >
                    好评 {this.state.feedbackSummary.positive}
                  </View>
                  <View
                    className={this.state.feedbackType === 'bad' ? 'review-tab-item active' : 'review-tab-item bad'}
                    onClick={this.setFeedbackType.bind(this, 'bad')}
                  >
                    差评 {this.state.feedbackSummary.negative}
                  </View>
                  <View
                    className={this.state.feedbackType === 'photo' ? 'review-tab-item active' : 'review-tab-item'}
                    onClick={this.setFeedbackType.bind(this, 'photo')}
                  >
                    <View className="flex-tab">
                      <Text className="at-icon at-icon-image"></Text>
                      <Text>有图 {this.state.feedbackSummary.has_photos}</Text>
                    </View>
                  </View>
                  <View
                    className={this.state.feedbackType === 'reply' ? 'review-tab-item active' : 'review-tab-item'}
                    onClick={this.setFeedbackType.bind(this, 'reply')}
                  >
                    商家回复 {this.state.feedbackSummary.replied}
                  </View>
                </ScrollView>
                <ScrollView
                  scrollY
                  className="store-review"
                  onScroll={this.setPageScrollTop}
                  onScrollToLower={this.getFeedbackList.bind(this, this.state.feedbackType)}
                  lowerThreshold="50"
                >
                  <View className="review-tab-blank"></View>
                  <View className="review-list">
                    {feedbackList.map((item, index) => {
                      let rating = Math.ceil(item.rating)
                      return (
                        <View className="review-list-item" key={item.id} taroKey={item.id}>
                          <View className="item-hd">
                            <Image src={item.user.avatar}></Image>
                            <View className="person">
                              <View className="person-tp">
                                <View className="name">
                                  <View className="name-word">{item.user.nickname}</View>
                                  {item.user.returned && <View className="name-type">回头客</View>}
                                </View>
                                <View className="time">{dateFormat(item.created_at, 'yyyy-MM-dd')}</View>
                              </View>
                              <View className="score">
                                {[1, 2, 3, 4, 5].map(scoreItem => {
                                  return (
                                    <Text
                                      key={scoreItem}
                                      taroKey={scoreItem}
                                      className={
                                        scoreItem <= rating ? 'at-icon at-icon-star-2 active' : 'at-icon at-icon-star-2'
                                      }
                                    ></Text>
                                  )
                                })}
                                <Text className="score-type">{this.state.rateConvert[rating]}</Text>
                              </View>
                            </View>
                          </View>
                          <View className="review-article">{item.comment}</View>
                          <ScrollView scrollX className="review-imglist">
                            {item.photos.map(photoItem => {
                              return (
                                <Image
                                  key={photoItem}
                                  taroKey={photoItem}
                                  lazyLoad
                                  mode="aspectFill"
                                  src={photoItem}
                                  onClick={this.commentPhotosPreview.bind(this, item.photos, photoItem)}
                                ></Image>
                              )
                            })}
                          </ScrollView>
                          {item.reply && (
                            <View className="reply">
                              <View className="reply-man">
                                商家回复({dateDiffCompare(item.created_at, item.replied_at)})
                              </View>
                              <View className="reply-content">{item.reply}</View>
                            </View>
                          )}
                          {item.recommends.length > 0 && (
                            <View className="recommend">
                              TA的推荐
                              <Text className="recommend-pro">
                                {item.recommends.map((recommendItem, recommendIndex) => {
                                  return (
                                    <Text key={recommendItem.id} taroKey={recommendItem.id}>
                                      {recommendItem.name + (recommendIndex === item.recommends.length - 1 ? '' : '、')}
                                    </Text>
                                  )
                                })}
                              </Text>
                              <Text className="at-icon at-icon-chevron-right"></Text>
                            </View>
                          )}
                        </View>
                      )
                    })}
                  </View>
                  {(this.state.loadFeedback || feedbackListNoMore) && (
                    <View className="loadmore">
                      <LoadMore noMore={feedbackListNoMore}></LoadMore>
                    </View>
                  )}
                </ScrollView>
              </SwiperItem>
              <SwiperItem className="swiper-item">
                <ScrollView scrollY onScroll={this.setPageScrollTop} className="store-info">
                  <View className="store-address">
                    <View className="address">
                      <Image className="location-icon" src={location}></Image>
                      <View className="address-name">{storeInfo.address}</View>
                      <View className="contact" onClick={this.setContactModal.bind(this)}>
                        <View></View>
                        <Image src={phone}></Image>
                      </View>
                    </View>
                    <View className="photos block">
                      <ScrollView className="photos-wrap" scrollX onClick={this.toPhotoList.bind(this, this.state.id)}>
                        {storeInfo.gallery.map(item => {
                          return <Image key={item} taroKey={item} lazyLoad mode="aspectFill" src={item}></Image>
                        })}
                      </ScrollView>
                    </View>
                    {/* <View className='secure block'>
                      <Image className='icon' src={secure}></Image>
                      <View className='word'>查看食品安全档案</View>
                      <View className='detail at-icon at-icon-chevron-right'></View>
                    </View> */}
                  </View>
                  <View className="store-tips">
                    <View className="tips block" onClick={storeInfo.announcement && this.openStoreCard}>
                      <Image className="icon" src={storeTips}></Image>
                      <View className="word">{storeInfo.announcement || '暂无'}</View>
                      {storeInfo.announcement && <View className="detail at-icon at-icon-chevron-right"></View>}
                    </View>
                    <View className="discount">
                      <View className="discount-item">
                        <View className="dis-logo">减</View>
                        <View className="dis-word">
                          {storeInfo.promos.map(item => {
                            if (item.type === 'mj') {
                              return (
                                <Text key={item.off} taroKey={item.off}>
                                  满{item.spending}减{item.off}
                                </Text>
                              )
                            }
                            if (item.type === 'new') {
                              return (
                                <Text key="new" taroKey="new">
                                  首单满{item.spending}减{item.off}
                                </Text>
                              )
                            }
                          })}
                        </View>
                      </View>
                      {/* {storeInfo.promos.filter(item => item.type === 'dc').length > 0 && (
                        <View className="discount-item">
                          <View className="dis-logo">折</View>
                          <View className="dis-word">
                            折扣商品{storeInfo.promos.filter(item => item.type === 'dc')[0].discount}折起
                          </View>
                        </View>
                      )} */}
                    </View>
                  </View>
                  <View className="store-delivery">
                    <View className="server block">
                      <Image className="icon" src={deliveryServer}></Image>
                      <View className="word">
                        配送服务：<Text>{storeInfo.delivery_info}</Text>
                      </View>
                    </View>
                    <View className="time block">
                      <Image className="icon" src={deliveryTime}></Image>
                      <View className="word">
                        配送时间：<Text>{storeInfo.delivery_time}</Text>
                      </View>
                    </View>
                  </View>
                </ScrollView>
              </SwiperItem>
            </Swiper>
            <CartPay
              isHidden={this.state.current != 0}
              carts={carts}
              shop={storeInfo}
              onCartChange={this.cartChange.bind(this)}
              onSetContactModal={this.setContactModal.bind(this)}
            ></CartPay>
            <SpecsModal
              specModal={this.state.specModal}
              symbol={currency_symbol}
              onCartChange={this.cartChange.bind(this)}
              spu={this.state.currentSpu}
              shopId={this.state.id}
              onAddCart={this.addCart.bind(this, {})}
              onCloseSpecModal={this.closeSpecModal.bind(this)}
            ></SpecsModal>
          </View>
        )}
      </View>
    )
  }
}

export default Store
