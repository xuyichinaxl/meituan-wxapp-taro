import Taro, { Component } from '@tarojs/taro'
import { View, Image, Text, ScrollView } from '@tarojs/components'
import storeConcat from '../../assets/img/store_concat.png'
import './cartPay.scss'

class CartPay extends Component {
  static defaultProps = {
    isHidden: false,
    phone: '',
    carts: {},
    shop: {}
  }
  constructor() {
    super(...arguments)
    this.state = {
      smallCartShow: false,
      totalNum: 0,
      items: [],
      shipping: {},
      sub_total: 0,
      total: 0,
      currency_symbol: '$',
      discount: 0,
      packing_fees: { total: 0 }
    }
  }

  componentWillReceiveProps(nextProps) {
    let totalNum = nextProps.carts.items.reduce((num, item) => num + item.qty, 0)
    if (totalNum !== this.state.totalNum) {
      this.setState({
        totalNum: totalNum,
        items: nextProps.carts.items,
        shipping: nextProps.carts.shipping,
        sub_total: nextProps.carts.sub_total,
        total: nextProps.carts.total,
        currency_symbol: nextProps.carts.currency_symbol,
        packing_fees: nextProps.carts.packing_fees,
        discount: nextProps.carts.discount
      })
    }
  }

  componentWillUnmount() {}

  componentDidShow() {}

  componentDidHide() {}

  switchSmallCartShow() {
    this.setState({
      smallCartShow: !this.state.smallCartShow
    })
  }

  packingHelp(packing_fees) {
    Taro.showToast({
      title:
        packing_fees.fees
          .map(f => `【${f.spu} ${f.sku}】每${f.packing_fee_per}份 ${this.state.currency_symbol}${f.packing_fee}`)
          .join('；') + '。',
      icon: 'none',
      duration: 2000
    })
  }

  catchEvent(e) {
    e.stopPropagation()
  }

  submitOrder() {
    Taro.navigateTo({
      url: '/pages/submitOrder/submitOrder'
    })
  }

  phoneContact() {
    console.log(this.props)
    this.props.onSetContactModal()
  }

  cutCart(id, qty) {
    Taro.$http({ url: '/shops/' + this.props.shop.id + '/cart/' + id, data: { qty: qty - 1 }, method: 'PUT' }).then(
      res => {
        this.props.onCartChange(res)
      }
    )
  }

  addCart(id, qty) {
    Taro.$http({ url: '/shops/' + this.props.shop.id + '/cart/' + id, data: { qty: qty + 1 }, method: 'PUT' }).then(
      res => {
        this.props.onCartChange(res)
      }
    )
  }

  clearCart() {
    Taro.$http({ url: `/shops/${this.props.shop.id}/cart/clear`, method: 'POST' }).then(res => {
      this.props.onCartChange(res)
    })
  }

  render() {
    const { smallCartShow, totalNum, items, packing_fees, currency_symbol, total } = this.state
    return (
      <View hidden={this.props.isHidden}>
        <View className="store-topay">
          <View className="tips" hidden={smallCartShow ? true : false}>
            再买<Text className="text">3元</Text>可享<Text className="text">75减10</Text>
          </View>
          <View className="topay">
            <View className="concat" onClick={this.phoneContact.bind(this)}>
              <Image className="image" src={storeConcat}></Image>
              <View className="view">联系商家</View>
            </View>
            <View className="cart" onClick={this.switchSmallCartShow}>
              <View className="icon"></View>
              {items.length > 0 && <View className="count">{totalNum}</View>}
            </View>
            <View className="payrig" onClick={this.switchSmallCartShow}>
              <View className="total">
                <Text className="text">{currency_symbol}</Text>
                {total}
                {discount > 0 && (
                  <Text className="original">
                    {currency_symbol}
                    {total + discount}
                  </Text>
                )}
              </View>
              <View className="dely">
                另需配送费
                {/* {currency_symbol}{shipping.fee || 0}  */}
              </View>
            </View>
            <View className="pay-btn" onClick={this.submitOrder}>
              去结算
            </View>
          </View>
        </View>
        <View
          className="small-cart"
          style={`visibility: ${smallCartShow ? 'visible' : 'hidden'}`}
          onTouchMove={this.catchEvent}
          onClick={this.switchSmallCartShow}
        >
          <View className="small-cart-modal" style={`opacity: ${smallCartShow ? '1' : '0'}`}></View>
          <View
            className="box"
            onClick={this.catchEvent}
            style={`transform: translateY(${smallCartShow ? '0' : '100%'})`}
          >
            <View className="tips">
              再买<Text className="text">3元</Text>可享<Text className="text">75减10</Text>
            </View>

            {items.length > 0 && (
              <View className="clear-cart">
                {packing_fees.total > 0 && (
                  <View className="packing">
                    打包费
                    {currency_symbol}
                    {packing_fees.total}
                    <Text onClick={packingHelp.bind(this, packing_fees)} className="at-icon at-icon-help"></Text>
                  </View>
                )}

                <Text className="at-icon at-icon-trash"></Text>
                <View className="clear-cart-wd" onClick={this.clearCart.bind(this)}>
                  清空购物车
                </View>
              </View>
            )}
            <ScrollView className="list" scrollY style={`height: 1000px`}>
              {items.map((item, index) => {
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
                    <Image mode="aspectFill" src={item.photo}></Image>
                    <View className="info">
                      <View className="info-tit">
                        <View className="info-name">{item.name}</View>
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
                      )}
                      {optionsList.length === 0 && item.discount_qty > 0 && item.discount_qty !== item.qty && (
                        <View className="info-sku">
                          <Text>含{item.discount_qty}份折扣商品</Text>
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
                      <View className="info-price">
                        ${item.sum.toFixed(2)}{' '}
                        {item.original_price && <Text>${(item.original_price * item.qty).toFixed(2)}</Text>}
                      </View>
                      <View className="addcart small-cart-addcart">
                        <View
                          className="cut at-icon at-icon-subtract"
                          onClick={this.cutCart.bind(this, item.id, item.qty)}
                        ></View>
                        <View className="num">{item.qty}</View>
                        <View
                          className="plus at-icon at-icon-add"
                          onClick={this.addCart.bind(this, item.id, item.qty)}
                        ></View>
                      </View>
                    </View>
                  </View>
                )
              })}
            </ScrollView>
          </View>
        </View>
      </View>
    )
  }
}

export default CartPay
