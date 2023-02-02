import Taro, { Component } from '@tarojs/taro'
import { View, Text } from '@tarojs/components'
import { connect } from '@tarojs/redux'
import Navbar from '../../components/navBar/navBar'
import Loading from '../../components/loading/loading'
import { onSetAddressList } from '../../actions/global'
import './addressList.scss'

@connect(
  ({ globalData }) => ({
    globalData
  }),
  dispatch => ({
    onSetAddressList(systemInfo) {
      dispatch(onSetAddressList(systemInfo))
    }
  })
)
class AddressList extends Component {
  constructor() {
    super(...arguments)
    this.state = {
      id: this.$router.params.id,
      referrer: this.$router.params.referrer,
      addressList: this.props.globalData.addressList,
      loading: this.props.globalData.addressList.length === 0,
      salutation: {
        mr: '先生',
        ms: '女士'
      }
    }
  }

  componentWillMount() {}

  componentWillUnmount() {}

  componentDidShow() {
    if (this.state.referrer === 'order') {
      this.getOrderAddressList()
    } else {
      this.getAddressList()
    }
  }

  componentDidHide() {}

  getOrderAddressList() {
    Taro.$http({ url: `/shops/${this.state.id}/cart/addresses` }).then(res => {
      this.setState({
        addressList: res,
        loading: false
      })
    })
  }

  getAddressList() {
    let refreshAddress = Taro.getStorageSync('refreshAddress')
    if (this.state.addressList.length === 0 || refreshAddress) {
      Taro.$http({ url: '/addresses' }).then(res => {
        this.setState({
          addressList: res,
          loading: false
        })
        this.props.onSetAddressList(res)
        Taro.setStorageSync('refreshAddress', 0)
      })
    }
  }

  setAddress(item) {
    if (this.state.referrer === 'order') {
      Taro.setStorageSync('setAddressData', item)
      Taro.navigateBack()
    }
  }

  editAddress(type, address, e) {
    e.stopPropagation()
    if (type === 'modify') {
      Taro.setStorageSync('modifyAddress', {
        line1: address.line1,
        line2: address.line2,
        tag: address.tag,
        receiver: address.receiver,
        salutation: address.salutation,
        mobile: address.mobile,
        suburb: address.suburb,
        city: address.city,
        state: address.state,
        company: address.company,
        country: address.country,
        postcode: address.postcode,
        coordinate: address.coordinate
      })
    }
    Taro.navigateTo({
      url: '/pages/editAddress/editAddress?type=' + type + '&id=' + address.id + '&referrer=' + this.state.referrer
    })
  }

  render() {
    return (
      <View className="address">
        <Navbar title="地址簿"></Navbar>
        <View className="add">
          <Text onClick={this.editAddress.bind(this, 'new', {})}>新增地址</Text>
        </View>
        {this.state.loading && <Loading></Loading>}
        <View className="address-list">
          {this.state.addressList.map(item => {
            return (
              <View
                className={item.disabled ? 'item disabled' : 'item'}
                taroKey={item.id}
                key={item.id}
                onClick={this.setAddress.bind(this, item)}
              >
                <View className="item-lt">
                  <View className="item-lt-hd">
                    <View className="label">{item.tag}</View>
                    <View className="word">
                      {(item.line1 ? item.line1 + ', ' : '') + item.line2 + ', ' + item.suburb}
                    </View>
                  </View>
                  <View className="user">
                    {item.receiver}
                    <Text className="sex">{this.state.salutation[item.salutation]}</Text>
                    <Text className="phone">{item.mobile}</Text>
                  </View>
                </View>
                <View className="at-icon at-icon-edit" onClick={this.editAddress.bind(this, 'modify', item)}></View>
              </View>
            )
          })}
        </View>
      </View>
    )
  }
}

export default AddressList
