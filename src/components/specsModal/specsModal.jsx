import Taro, { Component } from '@tarojs/taro'
import { connect } from '@tarojs/redux'
import { View, Text, ScrollView } from '@tarojs/components'
import './specsModal.scss'

@connect(({ globalData }) => ({
  globalData
}))
class SpecsModal extends Component {
  static defaultProps = {
    specModal: false,
    symbol: '$',
    spu: {
      skus: []
    },
    shopId: ''
  }

  constructor() {
    super(...arguments)
    this.state = {
      skuSelect: 0,
      options: [],
      skus: [],
      price: 0
    }
  }

  componentDidMount() {}

  componentWillReceiveProps(nextProps) {
    if (nextProps.spu.id !== this.props.spu.id) {
      let options = nextProps.spu.options
      options.map(option => {
        option.totalNum = 0
        option.items.map((item, index) => {
          if (!option.optional && index === 0 && !option.qty) {
            item.qty = 1
            option.totalNum++
            item.default = true
          } else {
            item.qty = 0
            item.default = false
          }
        })
      })
      this.setState({
        options: options,
        skus: nextProps.spu.skus,
        price: this.calcPrice(nextProps.spu.skus[0], nextProps.spu.options)
      })
    }
  }

  componentWillUnmount() {}

  componentDidShow() {}

  componentDidHide() {}

  addCart(e) {
    // this.props.onAddCart(e)
    let { options, skus, skuSelect } = this.state
    let cartAddData = {
      spu: this.props.spu.id,
      sku: skus[skuSelect].id,
      qty: 1
    }
    let cartAddOptions = []
    for (let i = 0; i < options.length; i++) {
      if (
        options[i].min > 0 &&
        options[i].totalNum < options[i].min &&
        ((options[i].optional && options[i].totalNum > 0) || !options[i].optional)
      ) {
        Taro.showToast({
          title: `【${options[i].name}】` + '最少选择' + options[i].min + '个',
          icon: 'none'
        })
        return
      }
      let items = []
      for (let j = 0; j < options[i].items.length; j++) {
        if (options[i].items[j].qty > 0) {
          items.push({
            id: options[i].items[j].id,
            qty: options[i].items[j].qty
          })
        }
      }
      cartAddOptions.push({
        id: options[i].id,
        name: options[i].name,
        items
      })
    }
    cartAddData.options = cartAddOptions
    Taro.$http({ url: `/shops/${this.props.shopId}/cart`, method: 'POST', data: cartAddData }).then(res => {
      this.props.onCartChange(res)
      this.props.onCloseSpecModal()
    })
  }

  closeSpecModal() {
    this.props.onCloseSpecModal()
  }

  changeSku(index) {
    if (this.state.skus[this.state.skuSelect].name !== this.state.skus[index].name) {
      this.setState({
        skuSelect: index,
        price: this.calcPrice(this.state.skus[index], null)
      })
    }
  }

  changeOptions(index, subIndex) {
    let options = this.state.options
    let option = options[index]
    let subItem = option.items[subIndex]
    let selectNums = option.totalNum
    let selectStatus = subItem.default
    let { optional, multi } = option
    if (!optional && selectStatus && selectNums === 1) {
      return
    } else {
      if (multi) {
        if (option.max > selectNums || subItem.default) {
          if (subItem.default) {
            option.totalNum--
            subItem.qty--
          } else {
            option.totalNum++
            subItem.qty++
          }
          subItem.default = !subItem.default
        } else {
          Taro.showToast({
            title: `【${option.name}】最多选择` + option.max + '个',
            icon: 'none'
          })
          return
        }
      } else {
        if (subItem.default) {
          subItem.default = false
          option.totalNum = 0
          subItem.qty = 0
        } else {
          option.totalNum = 1
          option.items.map((optionItem, optionIndex) => {
            if (optionIndex === subIndex) {
              optionItem.default = true
              optionItem.qty = 1
            } else {
              optionItem.default = false
              optionItem.qty = 0
            }
          })
        }
      }
      this.setState({
        options: options,
        price: this.calcPrice(null, options)
      })
    }
  }

  calcPrice(sku, options) {
    options = options || this.state.options
    sku = sku || this.state.skus[this.state.skuSelect]
    let optionPrice = 0
    let skuPrice = sku.price + sku.packing_fee
    for (let i = 0; i < options.length; i++) {
      for (let j = 0; j < options[i].items.length; j++) {
        if (options[i].items[j].default) {
          optionPrice += options[i].items[j].price * (options[i].items[j].qty || 1)
        }
      }
    }
    return skuPrice + optionPrice
  }

  optionItemCut(index, subIndex) {
    let options = this.state.options
    let option = options[index]
    let item = option.items[subIndex]
    item.qty--
    if (item.qty <= 0) {
      item.default = false
    }
    option.totalNum--
    this.setState({
      options: options,
      price: this.calcPrice(null, options)
    })
  }

  optionItemAdd(index, subIndex) {
    let options = this.state.options
    let option = options[index]
    let item = option.items[subIndex]
    if (option.totalNum + 1 > option.max) {
      Taro.showToast({
        title: `【${option.name}】最多选择${option.max}个`,
        icon: 'none'
      })
      return
    }
    item.qty = item.qty + 1
    item.default = true
    option.totalNum++
    this.setState({
      options: options,
      price: this.calcPrice(null, options)
    })
  }

  render() {
    const { spu, symbol } = this.props
    const { skuSelect, options, price, skus } = this.state
    let tipList = []
    options.map(option => {
      option.items.map(item => {
        if (item.default) {
          tipList.push({
            name: item.name,
            qty: item.qty ? item.qty : 1
          })
        }
      })
    })
    return (
      <View
        className="spec-box"
        style={`visibility: ${this.props.specModal ? 'visible' : 'hidden'}; opacity: ${
          this.props.specModal ? '1' : '0'
        }`}
      >
        <View className="spec-bg">
          <View className="spec-modal">
            <ScrollView scrollY className="spec-modal-sel">
              <View className="spec-modal-sel-wrap">
                <View className="name">{spu.name}</View>

                {skus.length > 0 && (
                  <View className="sel-item">
                    <View className="sel-item-label">规格</View>
                    <View className="sel-item-text">
                      {skus.map((item, index) => {
                        return (
                          <Text
                            key={'sku' + item.id}
                            taroKey={'sku' + item.id}
                            className={skus[skuSelect].name === item.name ? 'text active' : 'text'}
                            onClick={this.changeSku.bind(this, index)}
                          >
                            {item.name}
                            {item.price > 0 && <Text className="text-price">${item.price}</Text>}
                          </Text>
                        )
                      })}
                    </View>
                  </View>
                )}
                {options.map((item, index) => {
                  return (
                    <View key={'option' + item.name} taroKey={'option' + item.name} className="sel-item">
                      <View className="sel-item-label">
                        {item.name}
                        {(item.min > 1 || item.max > 1 || item.optional) && (
                          <Text className="tip-bx">
                            {item.min > 1 && (
                              <Text className="tip">
                                最少{item.min}份{item.max > 1 || item.optional ? '，' : ''}
                              </Text>
                            )}
                            {item.max > 1 && (
                              <Text className="tip">
                                最多{item.max}份{item.optional ? '，' : ''}
                              </Text>
                            )}
                            {item.optional && <Text className="tip">非必选</Text>}
                          </Text>
                        )}
                      </View>
                      <View className="sel-item-desc">{item.desc}</View>
                      <View className="sel-item-text">
                        {item.items.map((subItem, subIndex) => {
                          return item.qty ? (
                            <View key={subItem.id} taroKey={subItem.id} className="qty-item">
                              <Text className="qty-item-name">
                                {subItem.name}
                                <Text className="qty-item-name-price">
                                  {symbol}
                                  {subItem.price}
                                </Text>
                              </Text>
                              {(item.multi || (!item.multi && (subItem.qty > 0 || item.totalNum === 0))) && (
                                <View className="qty-item-operate">
                                  {subItem.qty > 0 && (
                                    <View className="qty-item-operate-l">
                                      <View
                                        className="cut at-icon at-icon-subtract"
                                        onClick={this.optionItemCut.bind(this, index, subIndex)}
                                      ></View>
                                      <View className="num">{subItem.qty}</View>
                                    </View>
                                  )}
                                  <View
                                    className="plus at-icon at-icon-add"
                                    onClick={this.optionItemAdd.bind(this, index, subIndex)}
                                  ></View>
                                </View>
                              )}
                            </View>
                          ) : (
                            <Text
                              key={subItem.id}
                              taroKey={subItem.id}
                              className={subItem.default ? 'text active' : 'text'}
                              onClick={this.changeOptions.bind(this, index, subIndex)}
                            >
                              {subItem.name}
                              {subItem.price > 0 && <Text className="text-price">${subItem.price}</Text>}
                            </Text>
                          )
                        })}
                      </View>
                    </View>
                  )
                })}
              </View>
            </ScrollView>
            <View className="status">
              <View className="status-sel">
                已选规格：
                <Text className="text">{skus[skuSelect].name}</Text>
                {tipList.map(item => {
                  return (
                    <Text key={item.name} taroKey={item.name} className="text">
                      {item.name}
                      {item.qty > 1 && <Text className="qty">x{item.qty}</Text>}
                    </Text>
                  )
                })}
              </View>
              <View className="status-add">
                <View className="currency">
                  <Text className="text">{symbol}</Text>
                  {price}
                </View>
                <View className="btn" onClick={this.addCart}>
                  <Text className="at-icon at-icon-add"></Text>加入购物车
                </View>
                {/* <View className='addcart small-cart-addcart'>
                  <View className='cut at-icon at-icon-subtract' onClick={this.cutCart.bind(this)}></View>
                  <View className='num'>1</View>
                  <View className='plus at-icon at-icon-add' onClick={this.addCart.bind(this)}></View>
                </View> */}
              </View>
            </View>
          </View>
          <View className="spec-close">
            <View onClick={this.closeSpecModal} className="at-icon at-icon-close"></View>
          </View>
        </View>
      </View>
    )
  }
}

export default SpecsModal
