import Taro, { Component } from '@tarojs/taro'
import { View, Image, Text } from '@tarojs/components'
import Navbar from '../../components/navBar/navBar'
import Loading from '../../components/loading/loading'
import './cart.scss'

class Index extends Component {
  constructor() {
    super(...arguments)
    this.state = {
      cartList: [],
      loading: true
    }
  }

  componentDidMount() {}

  componentWillUnmount() {}

  componentDidShow() {
    this.getCartData()
  }

  componentDidHide() {}

  getCartData() {
    Taro.$http({ url: '/carts' })
      .then(res => {
        res.map(cartItem => {
          cartItem.allChecked = true
          cartItem.items.map(item => {
            item.checked = !item.disabled
          })
        })
        this.setState({
          cartList: res
        })
      })
      .finally(() => {
        this.setState({
          loading: false
        })
      })
  }

  toSubmitOrder() {
    Taro.navigateTo({
      url: '/pages/submitOrder/submitOrder'
    })
  }

  changeChecked(cartIndex, itemIndex) {
    let cartList = this.state.cartList
    let cartItem = cartList[cartIndex]
    let allChecked = true
    cartItem.items.map((item, index) => {
      if (index === itemIndex) {
        item.checked = !item.checked
      }
      if (!item.checked && !item.message) {
        allChecked = false
      }
    })
    cartItem.allChecked = allChecked
    this.setState({
      cartList: cartList
    })
  }

  changeAllChecked(cartIndex) {
    let cartList = this.state.cartList
    let cartItem = cartList[cartIndex]
    cartItem.allChecked = !cartItem.allChecked
    let bool = cartItem.allChecked
    cartItem.items.map(item => {
      if (!item.message) {
        item.checked = bool
      }
    })
    this.setState({
      cartList: cartList
    })
  }

  toStore(id) {
    Taro.navigateTo({
      url: '/pages/store/store?id=' + id
    })
  }

  packingHelp(cartItem) {
    Taro.showToast({
      title:
        cartItem.packing_fees.fees
          .map(f => `【${f.spu} ${f.sku}】每${f.packing_fee_per}份 ${cartItem.currency_symbol}${f.packing_fee}`)
          .join('；') + '。',
      icon: 'none',
      duration: 2000
    })
  }

  rrHelp(cartItem) {
    Taro.showToast({
      title: '折扣商品不参加满减活动',
      icon: 'none',
      duration: 2000
    })
  }

  render() {
    const { rrHelp, packingHelp, loading } = this.state
    return (
      <View className="cart">
        <Navbar title="购物车" needBack={false}></Navbar>
        {loading ? (
          <Loading></Loading>
        ) : (
          <View className="cart-list">
            {this.state.cartList.map((cartItem, cartIndex) => {
              return (
                <View key={cartItem.id} taroKey={cartItem.id} className="cart-item">
                  <View>
                    <View className="head">
                      {/* <Image></Image> */}
                      <View className="head-tp">
                        <View className="head-name">
                          {cartItem.shop.name}
                          <Text></Text>
                          <View onClick={this.toStore.bind(this, cartItem.shop.id)} className="head-name-edit">
                            更改商品
                          </View>
                        </View>
                        <View className="head-coupon">
                          {cartItem.shop.promos.map(item => {
                            return item.type === 'mj' ? (
                              <Text className="minus" key={item.off} taroKey={item.off}>
                                {item.spending}减{item.off}
                              </Text>
                            ) : (
                              <Text className="dis" key={item.discount} taroKey={item.discount}>
                                <Text className="view">{item.discount}折美食券</Text>
                              </Text>
                            )
                          })}
                        </View>
                      </View>
                    </View>
                    {cartItem.items.map((item, index) => {
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
                          {item.message ? (
                            <View className="item-check disabled"></View>
                          ) : (
                            <View
                              className={
                                'head-check item-check at-icon at-icon-check' + (item.checked ? ' active' : '')
                              }
                            ></View>
                          )}
                          <Image mode="aspectFill" src={item.photo}></Image>
                          <View className="info">
                            <View className="info-tit">
                              <View className="info-name">{item.name}</View>
                              <View className="info-price">
                                {item.original_price && <Text>${item.original_price * item.qty}</Text>}${item.sum}
                              </View>
                            </View>
                            {sku.name && optionsList.length > 0 && (
                              <View className="info-sku">
                                <Text>规格: {sku.name}</Text>
                                {item.discount_qty > 0 && item.discount_qty !== item.qty && (
                                  <Text> (含{item.discount_qty}份折扣商品)</Text>
                                )}
                                {/* {sku.price && <Text className="info-sku-price">${sku.price.toFixed(2)}</Text>}
                                {sku.original_price && (
                                  <Text className="info-sku-oprice">${sku.original_price.toFixed(2)}</Text>
                                )} */}
                              </View>
                            )}{' '}
                            {optionsList.length === 0 && item.discount_qty > 0 && item.discount_qty !== item.qty && (
                              <View className="info-sku">
                                <Text>含{item.discount_qty}份折扣商品</Text>
                              </View>
                            )}
                            {optionsList.length > 0 && (
                              <View className="info-options">
                                {optionsList.map(optionsItem => {
                                  return (
                                    <View
                                      taroKey={optionsItem.name}
                                      key={optionsItem.name}
                                      className="info-options-item"
                                    >
                                      <Text className="name">{optionsItem.name}</Text>
                                      {optionsItem.price && (
                                        <Text className="price">${optionsItem.price.toFixed(2)}</Text>
                                      )}
                                      {optionsItem.qty > 1 && <Text className="qty">x{optionsItem.qty}</Text>}
                                    </View>
                                  )
                                })}
                              </View>
                            )}
                            <View className="message">{item.message}</View>
                            <View className="info-num">
                              <Text>x</Text>
                              {item.qty}
                            </View>
                          </View>
                        </View>
                      )
                    })}

                    <View className="art">
                      <View className="art-msg">
                        <View className="art-msg-dis">
                          {cartItem.packing_fees.total > 0 && (
                            <View className="art-msg-dis-item">
                              <View className="dis-item-name">
                                打包费
                                <Text
                                  onClick={packingHelp.bind(this, cartItem)}
                                  className="at-icon at-icon-help"
                                ></Text>
                              </View>
                              <View>
                                {cartItem.currency_symbol}
                                {cartItem.packing_fees.total}
                              </View>
                            </View>
                          )}
                          {cartItem.rr && cartItem.rr.reach > 0 && (
                            <View className="art-msg-dis-item minus-pad">
                              <View className="dis-item-name">
                                满减优惠 <Text className="reach">{`满${cartItem.rr.reach}`}</Text>
                                {!cartItem.rr.inc_discount_item && (
                                  <Text onClick={rrHelp.bind(this)} className="at-icon at-icon-help"></Text>
                                )}
                              </View>
                              <View className="minus">
                                -{cartItem.currency_symbol}
                                {cartItem.rr.reduce}
                              </View>
                            </View>
                          )}
                          <View className="art-msg-dis-item">
                            <View className="dis-item-name">配送费结算时计算</View>
                          </View>
                          <View className="art-settle">
                            <View className="art-settle-res">
                              已优惠
                              <Text>
                                {' '}
                                {cartItem.currency_symbol}
                                {cartItem.discount}
                              </Text>
                            </View>
                            <View className="settle-operate">
                              <View className="price">
                                {cartItem.currency_symbol}
                                {cartItem.total}
                              </View>
                              {cartItem.shop.min_order > cartItem.sub_total ? (
                                <View className="cant">
                                  差{cartItem.currency_symbol}
                                  {cartItem.shop.min_order - cartItem.sub_total}起购
                                </View>
                              ) : (
                                <View className="pay" onClick={this.toSubmitOrder}>
                                  去结算
                                </View>
                              )}
                            </View>
                          </View>
                        </View>
                      </View>
                    </View>
                  </View>
                </View>
              )
            })}

            {this.state.cartList && this.state.cartList.length === 0 && (
              <View class="empty-cart">您的购物车为空哦～</View>
            )}
          </View>
        )}
      </View>
    )
  }
}

export default Index
