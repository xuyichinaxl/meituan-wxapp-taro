import Taro, { Component } from '@tarojs/taro'
import { connect } from '@tarojs/redux'
import { AtActivityIndicator, AtCountdown } from 'taro-ui'
import { View, Button, Text, Swiper, SwiperItem, Image, ScrollView, Textarea } from '@tarojs/components'
import { addSpace, dateFormat, dateDiffCompare } from '../../utils/util'
import Loading from '../../components/loading/loading'
import Contact from '../../components/contact/contact'
import Navbar from '../../components/navBar/navBar'
import Refresh from '../../components/refresh/refresh'
import contact from '../../assets/img/contact_shop.png'
import feedback from '../../assets/img/feedback1.png'
import buy from '../../assets/img/order_detail_buy.png'
import refund from '../../assets/img/order_detail_refund.png'
import './orderDetail.scss'

@connect(({ globalData }) => ({
  globalData
}))
class OrderDetail extends Component {
  constructor() {
    super(...arguments)
    this.state = {
      current: 0,
      id: this.$router.params.id,
      referrer: this.$router.params.referrer,
      loading: true,
      isOpened: false,
      contactModal: false,
      bankScreenshotLoading: false,
      bankScreenshotImg: '',
      paymentImage: '',
      paymentImageLoading: false,
      orderInfo: {
        feedback: {
          created_at: new Date(),
          replied_at: new Date(),
          photos: []
        },
        discount: {}
      },
      remark: '',
      refresh: false,
      orderStatus: {
        awaiting_payment: '待支付',
        completed: '已完成'
      },
      swiperHeightList: [],
      paymentMethodList: [],
      deliveryType: {
        delivery: '派送',
        pickup: '自取'
      },
      paymentMethod: {
        cash: '现金支付',
        wechat: '微信支付',
        alipay: '微信支付',
        bank_transfer: '银行转帐'
      },
      rateConvert: {
        1: '很差',
        2: '一般',
        3: '满意',
        4: '很满意',
        5: '完美'
      },
      discountConvert: {
        cash: '现金优惠：',
        other: '其它折扣：',
        new_user: '新客户首单优惠：',
        rr: '满减活动：'
      }
    }
  }

  componentWillMount() {
    this.getOrderDetail()
  }

  componentDidMount() {
    this.setState({
      navbarHeight:
        this.props.globalData.systemInfo.statusBarHeight +
        (this.props.globalData.systemInfo.system.indexOf('Adr') > -1 ? 48 : 44)
    })
  }

  componentWillUnmount() {}

  componentDidShow() {
    let refreshStatus = Taro.getStorageSync('assessSubmit')
    if (refreshStatus) {
      Taro.setStorageSync('assessSubmit', 0)
      Taro.showToast({
        title: '提交成功',
        icon: 'none'
      })
      this.getOrderDetail()
    }
  }

  componentDidHide() {}

  switchCate(e) {
    if (e.detail.source === 'touch') {
      this.setState({
        current: e.detail.current
      })
    }
  }

  setCurrent(i) {
    this.setState({
      current: i
    })
  }

  toAssess() {
    Taro.setStorageSync('assessData', {
      items: this.state.orderInfo.items,
      shop: this.state.orderInfo.shop
    })
    Taro.navigateTo({
      url: '/pages/assess/assess?id=' + this.state.orderInfo.id
    })
  }

  getOrderDetail() {
    let order = new Promise(resolve => {
      Taro.$http({ url: `/orders/${this.state.id}` }).then(res => {
        resolve({
          orderInfo: res,
          refresh: false,
          bankScreenshotLoading: false,
          isOpened: false
        })
      })
    })
    let payment = new Promise(resolve => {
      Taro.$http({ url: `/orders/${this.state.id}/payment_methods` }).then(res => {
        resolve({
          paymentMethodList: res
        })
      })
    })
    Promise.all([order, payment])
      .then(res => {
        console.log(res)
        console.log(...res)
        console.log(Object.assign(...res))
        this.setState(Object.assign(...res))
      })
      .finally(
        this.setState(
          {
            loading: false
          },
          () => {
            this.calcSwiper()
          }
        )
      )
  }

  refresherRefresh() {
    this.setState(
      {
        refresh: true
      },
      () => {
        this.getOrderDetail()
      }
    )
  }

  copyStr(str) {
    Taro.setClipboardData({
      data: str,
      success: () => {
        Taro.showToast({
          title: '复制成功',
          icon: 'none'
        })
      }
    })
  }

  commentPhotosPreview(items, item) {
    Taro.previewImage({
      current: item,
      urls: items
    })
  }

  postScreenshot() {
    this.setState({
      isOpened: true
    })
  }

  bankScreenshot() {
    Taro.chooseImage().then(res => {
      console.log(res.tempFiles)
      if (res.tempFilePaths.length > 1) {
        Taro.showToast({
          title: '只能选择1张图片',
          icon: 'none'
        })
        return
      }
      // if (res.tempFiles.some(item => item.size > 5242880)) {
      //   Taro.showToast({
      //     title: '图片不能大于5M',
      //     icon: 'none'
      //   })
      //   return
      // }
      // if (res.tempFiles.some(item => item.size < 51200)) {
      //   Taro.showToast({
      //     title: '图片不能小于50KB',
      //     icon: 'none'
      //   })
      //   return
      // }
      this.setState({
        bankScreenshotImg: res.tempFilePaths[0]
      })
    })
  }

  closeModal() {
    this.setState({
      isOpened: false,
      paymentImage: ''
    })
  }

  setRemark(e) {
    this.setState({
      remark: e.detail.value
    })
  }

  uploadBankScreenshot() {
    if (!this.state.bankScreenshotImg) {
      Taro.showToast({
        title: '请选择付款截图',
        icon: 'none'
      })
      return
    }
    this.setState({
      bankScreenshotLoading: true
    })
    Taro.uploadFile({
      url: 'https://orca-file-ap.yundian.xyz/upload/remittance',
      filePath: this.state.bankScreenshotImg,
      name: 'file',
      header: {
        Authorization:
          'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IlJheSIsImlhdCI6MTUxNjIzOTAyMn0.cqHnyqfq34zAeFEcdPkU58TQJU6uJ10awKe196RJEZg'
      },
      success: res => {
        this.submitRemittance(JSON.parse(res.data))
      }
    })
  }

  submitRemittance(photo) {
    Taro.$http({
      url: `/orders/${this.state.id}/payment_methods`,
      method: 'POST',
      data: {
        method: 'bank_transfer',
        photo: photo,
        comment: this.state.remark
      }
    }).then(() => {
      Taro.showToast({
        title: '提交成功',
        icon: 'none'
      })
      this.getOrderDetail()
    })
  }

  shunt(item) {
    if (item.link_type === 'image') {
      this.setState({
        paymentImage: item.link
      })
    }
  }

  saveImg() {
    this.setState({
      paymentImageLoading: true
    })
    Taro.downloadFile({
      url: this.state.paymentImage,
      success: res => {
        console.log(res.tempFilePath)
        Taro.saveImageToPhotosAlbum({
          filePath: res.tempFilePath,
          success: () => {
            Taro.showToast({
              title: '保存成功',
              icon: 'none'
            })
            this.setState({
              paymentImageLoading: false,
              paymentImage: ''
            })
          },
          fail: () => {
            Taro.showToast({
              title: '保存失败',
              icon: 'none'
            })
            this.setState({
              paymentImageLoading: false
            })
          }
        })
      }
    })
  }

  cashPayment() {
    Taro.showModal({
      title: '提示',
      content: '确认使用现金支付吗？',
      success: res => {
        if (res.confirm) {
          Taro.$http({
            url: `/orders/${this.state.id}/payment_methods`,
            method: 'POST',
            data: {
              method: 'cash'
            }
          }).then(() => {
            this.getOrderDetail()
          })
        }
      }
    })
  }

  calcSwiper() {
    if (this.state.paymentMethodList.length > 0 && this.state.orderInfo.id) {
      const query = Taro.createSelectorQuery()
      query
        .selectAll('.wx')
        .boundingClientRect()
        .exec(res => {
          let swiperHeightList = []
          res[0].map(item => {
            console.log(item)
            swiperHeightList.push(item.height)
          })
          this.setState({
            swiperHeightList: swiperHeightList
          })
        })
    }
  }

  cancelOrder() {
    Taro.showModal({
      title: '提示',
      content: '确认取消本订单？',
      success: res => {
        if (res.confirm) {
          Taro.$http({ method: 'POST', url: `/orders/${this.state.id}/cancel` }).then(() => {
            this.getOrderDetail()
          })
        }
      }
    })
  }

  toStore() {
    Taro.navigateTo({
      url: '/pages/store/store?id=' + this.state.orderInfo.id
    })
  }

  setContactModal() {
    this.setState({
      contactModal: !this.state.contactModal
    })
  }

  onTimeUp() {}

  render() {
    const {
      isOpened,
      orderInfo,
      refresh,
      navbarHeight,
      orderStatus,
      paymentMethod,
      rateConvert,
      discountConvert,
      remark,
      bankScreenshotImg,
      bankScreenshotLoading,
      paymentMethodList,
      paymentImage,
      paymentImageLoading,
      loading,
      referrer
    } = this.state
    const discountList = Object.entries(orderInfo.discount) || []
    const feedbackInfo = orderInfo.feedback
    const expireAt = (new Date(orderInfo.expire_at || 0).getTime() - Date.now()) / 1000
    return (
      <View className="order-detail">
        <Navbar title="" bgColor="#f4f4f4" referrer={referrer}></Navbar>
        {this.state.contactModal && (
          <Contact
            phone={orderInfo.shop.contact.phone}
            photo={orderInfo.shop.contact.wechat_qrcode}
            onSetContactModal={this.setContactModal.bind(this)}
          ></Contact>
        )}
        {isOpened && (
          <View className="bank-modal">
            <View className="bank-modal-body">
              {!bankScreenshotImg ? (
                <View className="bank-screenshot" onClick={this.bankScreenshot.bind(this)}>
                  <View className="at-icon at-icon-camera"></View>
                  <View>选择图片</View>
                </View>
              ) : (
                <View className="bank-screenshot-img">
                  <Image mode="aspectFill" src={bankScreenshotImg}></Image>
                </View>
              )}
              <View className="optional">
                <View>备注</View>
                <View className="textarea-wrap">
                  <Textarea
                    className="textarea"
                    placeholder="选填"
                    disabled={bankScreenshotLoading}
                    value={remark}
                    onBlur={this.setRemark.bind(this)}
                    placeholderClass="textarea-placeholder"
                  ></Textarea>
                </View>
              </View>
              {bankScreenshotLoading && (
                <View className="loading">
                  <AtActivityIndicator size={48} mode="center" color="#f3b53c"></AtActivityIndicator>
                </View>
              )}
              <View className="operate">
                <View className="close" onClick={this.closeModal.bind(this)}>
                  取消
                </View>
                <View className="ok" onClick={this.uploadBankScreenshot.bind(this)}>
                  确定
                </View>
              </View>
            </View>
          </View>
        )}
        {paymentImage && (
          <View className="bank-modal">
            <View className="bank-modal-body">
              <View className="bank-screenshot-img pay-img">
                <Image mode="aspectFill" src={paymentImage}></Image>
              </View>
              {paymentImageLoading && (
                <View className="loading">
                  <AtActivityIndicator size={48} mode="center" color="#f3b53c"></AtActivityIndicator>
                </View>
              )}
              <View className="operate">
                <View className="close" onClick={this.closeModal.bind(this)}>
                  取消
                </View>
                <View className="ok" onClick={this.saveImg.bind(this)}>
                  保存图片
                </View>
              </View>
            </View>
          </View>
        )}

        {!loading ? (
          // <View className='scroll-box'>
          <ScrollView
            className="box"
            style={`height:calc(100vh - ${navbarHeight}px)`}
            scrollY
            refresherEnabled
            refresherThreshold={50}
            onRefresherRefresh={this.refresherRefresh.bind(this)}
            refresherDefaultStyle="none"
            refresherTriggered={refresh}
          >
            <View className="box-blank"></View>
            <Refresh refresh={refresh}></Refresh>
            <View className="block info">
              <View className="title">
                订单信息<Text>{orderStatus[orderInfo.order_status]}</Text>
              </View>
              <View className="info-item">
                <View className="info-item-label">订单号码</View>
                <View className="info-item-content">
                  {addSpace(orderInfo.id)}
                  <Text onClick={this.copyStr.bind(this, orderInfo.id)}>复制</Text>
                </View>
              </View>
              <View className="info-item">
                <View className="info-item-label">下单时间</View>
                <View className="info-item-content">{dateFormat(orderInfo.created_at, 'yyyy-MM-dd hh:mm:ss')}</View>
              </View>
              {orderInfo.payment_method && (
                <View className="info-item">
                  <View className="info-item-label">支付方式</View>
                  <View className="info-item-content">{paymentMethod[orderInfo.payment_method]}</View>
                </View>
              )}
            </View>

            <View className="block menu">
              {/* <View className='menu-item refund'>
                    <Image src={refund}></Image>
                    <View>申请退款</View>
                  </View> */}
              <View className="menu-item contact" onClick={this.setContactModal.bind(this)}>
                <Image src={contact}></Image>
                <View>联系商家</View>
              </View>
              {orderInfo.allow_feedback && (
                <View className="menu-item message" onClick={this.toAssess}>
                  <Image src={feedback}></Image>
                  <View>评价</View>
                </View>
              )}
              <View className="menu-item buy" onClick={this.toStore}>
                <Image src={buy}></Image>
                <View>再来一单</View>
              </View>
            </View>
            {feedbackInfo && (
              <View className="review block">
                <View className="item-hd">
                  <View className="person">
                    <View className="person-tp">
                      <View className="name">
                        <View className="name-word">评价</View>
                        {/* {item.user.returned && <View className='name-type'>回头客</View>} */}
                      </View>
                      <View className="time">{dateFormat(feedbackInfo.created_at, 'yyyy-MM-dd')}</View>
                    </View>
                    <View className="score">
                      {[1, 2, 3, 4, 5].map(scoreItem => {
                        return (
                          <Text
                            key={scoreItem}
                            taroKey={scoreItem}
                            className={
                              scoreItem <= feedbackInfo.rating
                                ? 'at-icon at-icon-star-2 active'
                                : 'at-icon at-icon-star-2'
                            }
                          ></Text>
                        )
                      })}
                      <Text className="score-type">{rateConvert[feedbackInfo.rating]}</Text>
                    </View>
                  </View>
                </View>
                <View className="review-article">{feedbackInfo.comment}</View>
                <ScrollView scrollX className="review-imglist">
                  {feedbackInfo.photos.map(photoItem => {
                    return (
                      <Image
                        key={photoItem}
                        taroKey={photoItem}
                        mode="aspectFill"
                        src={photoItem}
                        onClick={this.commentPhotosPreview.bind(this, feedbackInfo.photos, photoItem)}
                      ></Image>
                    )
                  })}
                </ScrollView>
                {feedbackInfo && feedbackInfo.reply && (
                  <View className="reply">
                    <View className="reply-man">
                      商家回复({dateDiffCompare(feedbackInfo.created_at, feedbackInfo.replied_at)})
                    </View>
                    <View className="reply-content">{feedbackInfo.reply}</View>
                  </View>
                )}
                {feedbackInfo.recommends.length > 0 && (
                  <View className="recommend">
                    推荐
                    <Text className="recommend-pro">
                      {feedbackInfo.recommends.map((recommendItem, recommendIndex) => {
                        return (
                          <Text key={recommendItem.id} taroKey={recommendItem.id}>
                            {recommendItem.name + (recommendIndex === feedbackInfo.recommends.length - 1 ? '' : '、')}
                          </Text>
                        )
                      })}
                    </Text>
                  </View>
                )}
              </View>
            )}
            <View className="block pay">
              <View className="title">支付</View>
              <View className="tab">
                {paymentMethodList.map((item, index) => {
                  return (
                    <View
                      key={item.type}
                      taroKey={item.type}
                      className={this.state.current === index ? 'active' : ''}
                      onClick={this.setCurrent.bind(this, index)}
                    >
                      {item.name}
                    </View>
                  )
                })}
              </View>
              <Swiper
                className="swiper"
                style={`height: ${this.state.swiperHeightList[this.state.current]}px`}
                onChange={this.switchCate}
                current={this.state.current}
              >
                {paymentMethodList.map(item => {
                  let button = null
                  if (item.type === 'bank_transfer') {
                    button = (
                      <Button type="primary" onClick={this.postScreenshot.bind(this)}>
                        提交转账截图
                      </Button>
                    )
                  } else if (item.type === 'cash') {
                    button = (
                      <Button type="primary" onClick={this.cashPayment.bind(this)}>
                        使用现金支付
                      </Button>
                    )
                  } else if (item.type === 'alipay') {
                    button = (
                      <Button type="primary" onClick={this.shunt.bind(this, item)}>
                        {item.link_text}
                      </Button>
                    )
                  } else {
                    button = (
                      <Button type="primary" onClick={this.copyStr.bind(this, item.link)}>
                        复制支付链接
                      </Button>
                    )
                  }
                  return (
                    <SwiperItem key={item.type} taroKey={item.type} className="swiper-item">
                      <View className="wx">
                        <View>{item.desc}</View>
                        {item.link_type === 'url' && <View className="copy-link">{item.link}</View>}
                        <View className="button-wrap">{button}</View>
                      </View>
                    </SwiperItem>
                  )
                })}
              </Swiper>
            </View>
            {orderInfo.order_status === 'awaiting_payment' && (
              <View className="block cancel">
                {expireAt > 0 ? (
                  <View>
                    <View className="cancel-tip">
                      <Text>如果订单有误，您可以取消订单。</Text>
                      <AtCountdown
                        format={{ day: '天', hours: '小时', minutes: '分', seconds: '秒' }}
                        seconds={expireAt}
                        isShowDay={expireAt > 60 * 60 * 24}
                        isShowHour={expireAt > 60 * 60}
                        onTimeUp={this.onTimeUp.bind(this)}
                      />
                      <Text>后未支付订单会被自动取消。</Text>
                    </View>
                  </View>
                ) : (
                  <View className="cancel-tip">如果订单有误，您可以取消订单。</View>
                )}
                <View className="cancel-btn" onClick={this.cancelOrder.bind(this)}>
                  取消订单
                </View>
              </View>
            )}
            <View className="block store">
              <View className="title">
                <View className="name">{orderInfo.shop.name}</View>
              </View>
              <View className="product-list">
                {orderInfo.items.map(item => {
                  let optionsList = []
                  if (item.options && item.options.length > 0) {
                    item.options.map(optionsItem => {
                      optionsList = optionsList.concat(optionsItem.items)
                    })
                  }
                  const sku = item.sku || {
                    price: 0,
                    original_price: 0
                  }
                  return (
                    <View className="item" key={item.name} taroKey={item.name}>
                      <Image mode="aspectFill" src={item.image}></Image>
                      <View className="info">
                        <View className="info-tit">
                          <View className="info-name">{item.name}</View>
                          <View className="info-num">
                            <Text>x</Text>
                            {item.qty}
                          </View>
                        </View>
                        <View className="info-price">
                          ${item.price.toFixed(2)}{' '}
                          {item.original_price && <Text>${item.original_price.toFixed(2)}</Text>}
                        </View>
                        {sku.name && (
                          <View className="info-sku">
                            <Text>{sku.name}</Text>
                            {sku.price && <Text className="info-sku-price">${sku.price.toFixed(2)}</Text>}
                            {sku.original_price && (
                              <Text className="info-sku-oprice">${sku.original_price.toFixed(2)}</Text>
                            )}
                          </View>
                        )}
                        {optionsList.length > 0 && (
                          <View className="info-options">
                            {optionsList.map(optionsItem => {
                              return (
                                <View taroKey={optionsItem.name} key={optionsItem.name} className="info-options-item">
                                  <Text className="name">{optionsItem.name}</Text>
                                  {optionsItem.price && <Text className="price">${optionsItem.price.toFixed(2)}</Text>}
                                  {optionsItem.qty > 1 && <Text className="qty">x{optionsItem.qty}</Text>}
                                </View>
                              )
                            })}
                          </View>
                        )}
                      </View>
                    </View>
                  )
                })}
              </View>
              {/* <View className='delivery'>
                    <View className='name'>配送费</View>
                    <View className='price'><Text>¥ </Text>4</View>
                  </View> */}
              {orderInfo && (
                <View className="total-box">
                  <View className="total">
                    <Text>商品总额：</Text>
                    <View className="total-price">
                      <Text className="total-cur">$</Text>
                      <Text className="total-money">{orderInfo.sub_total.toFixed(2)}</Text>
                    </View>
                  </View>
                  <View className="total">
                    <Text>运费：</Text>
                    <View className="total-price">
                      <Text className="total-cur">$</Text>
                      <Text className="total-money">{orderInfo.delivery_fee.toFixed(2)}</Text>
                    </View>
                  </View>
                  {discountList.map(discountItem => {
                    const mapKey = discountItem[0]
                    return (
                      <View className="total dis" key={mapKey} taroKey={mapKey}>
                        <Text>{discountConvert[discountItem[0]]}</Text>
                        <View className="total-price">
                          <Text className="total-cur">$</Text>
                          <Text className="total-money">-{discountItem[1].toFixed(2)}</Text>
                        </View>
                      </View>
                    )
                  })}
                  <View className="total">
                    <Text>合计：</Text>
                    <View className="total-price">
                      <Text className="total-cur">$</Text>
                      <Text className="total-money">{orderInfo.total.toFixed(2)}</Text>
                    </View>
                  </View>
                </View>
              )}
            </View>

            <View className="block info">
              <View className="title">配送信息</View>
              <View className="info-item">
                <View className="info-item-label">配送服务</View>
                <View className="info-item-content">{deliveryType[orderInfo.delivery.type]}</View>
              </View>
              <View className="info-item">
                <View className="info-item-label">期望时间</View>
                <View className="info-item-content">{orderInfo.delivery.time}</View>
              </View>
              <View className="info-item">
                <View className="info-item-label">配送地址</View>
                <View className="info-item-content br">
                  <View>{orderInfo.delivery.address}</View>
                </View>
              </View>
              <View className="info-item">
                <View className="info-item-label">联系人</View>
                <View className="info-item-content br">
                  <View>
                    {orderInfo.delivery.contact} {orderInfo.delivery.mobile}
                  </View>
                </View>
              </View>
              {orderInfo.delivery.code && (
                <View className="info-item">
                  <View className="info-item-label">取货码</View>
                  <View className="info-item-content">{orderInfo.delivery.code}</View>
                </View>
              )}
            </View>
          </ScrollView>
        ) : (
          // </View>
          <Loading></Loading>
        )}
      </View>
    )
  }
}

export default OrderDetail
