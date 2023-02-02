import Taro, { Component } from '@tarojs/taro'
import { View, Text, Input } from '@tarojs/components'
import { AtModal } from 'taro-ui'
import Navbar from '../../components/navBar/navBar'
import './editAddress.scss'

class EditAddress extends Component {
  constructor() {
    super(...arguments)
    this.state = {
      pageType: 'new',
      referrer: this.$router.params.referrer,
      address: {
        line1: '',
        line2: '',
        tag: '家',
        receiver: '',
        salutation: 'mr',
        mobile: '',
        suburb: '',
        city: '',
        state: '',
        company: '',
        country: '',
        postcode: '',
        coordinate: {
          lat: 0,
          lng: 0
        }
      },
      submiting: false,
      searchValue: '',
      searchList: [],
      lock: false,
      errorModal: false,
      errorMsg: ''
    }
  }

  componentWillReceiveProps(nextProps) {
    console.log(this.props, nextProps)
  }

  componentWillMount() {
    let address = this.$router.params.type === 'modify' ? Taro.getStorageSync('modifyAddress') : this.state.address
    this.setState({
      pageType: this.$router.params.type,
      address: address
    })
  }

  componentWillUnmount() {}

  componentDidShow() {}

  componentDidHide() {}

  changeSex(type) {
    this.setState({
      address: {
        ...this.state.address,
        salutation: type
      }
    })
  }

  setTag(tag) {
    this.setState({
      address: {
        ...this.state.address,
        tag: tag
      }
    })
  }

  resetLine() {
    this.setState({
      address: {
        ...this.state.address,
        line2: ''
      },
      lock: false
    })
  }

  searchAddress(e) {
    if (this.state.lock) {
      return
    }
    Taro.$http({ url: '/search_address', data: { q: e } }).then(res => {
      this.setState({
        searchList: res
      })
    })
  }

  selectSearchAddress(address) {
    this.setState({
      address: {
        ...this.state.address,
        line2: address.street,
        suburb: address.suburb,
        city: address.city,
        state: address.state,
        country: address.country,
        postcode: address.postcode,
        coordinate: address.coordinate
      },
      searchList: [],
      searchValue: '',
      lock: true
    })
  }

  searchAddressValue(e) {
    this.setState({
      searchValue: e.detail.value
    })
  }

  closeErrorModal() {
    this.setState({
      errorModal: false
    })
  }

  submit() {
    let errorMsg = ''
    if (!this.state.address.line2) {
      errorMsg += '地址为必填\n\r'
    }
    if (!this.state.address.receiver.trim()) {
      errorMsg += '联系人为必填\n\r'
    }
    if (!this.state.address.mobile.trim()) {
      errorMsg += '手机号为必填'
    }
    if (errorMsg) {
      this.setState({
        errorModal: true,
        errorMsg: errorMsg
      })
      return
    }
    this.setState({
      submiting: true
    })
    let options = {
      method: this.state.pageType === 'new' ? 'POST' : 'PUT',
      url: this.state.pageType === 'new' ? '/addresses' : '/addresses/' + this.$router.params.id
    }
    Taro.$http({ ...options, data: this.state.address }).then(res => {
      if (this.state.referrer === 'order') {
        Taro.setStorageSync('setAddressData', res)
        Taro.navigateBack({
          delta: 2
        })
        return
      }
      Taro.setStorageSync('refreshAddress', 1)
      this.setState({
        submiting: false
      })
      Taro.showToast({
        title: (this.state.pageType === 'new' ? '添加' : '修改') + '成功',
        icon: 'none'
      })
    })
  }

  render() {
    const { address, submiting, searchList, errorModal, errorMsg, referrer } = this.state
    return (
      <View className="address">
        <Navbar
          title={(this.state.pageType === 'new' ? '新增' : '修改') + '收货地址'}
          backDelta={referrer === 'order' ? 2 : 1}
        ></Navbar>
        <AtModal
          isOpened={errorModal}
          title="出错啦"
          confirmText="确认"
          onConfirm={this.closeErrorModal.bind(this)}
          content={errorMsg}
        />
        <View className="edit-wrap">
          {address.line2 ? (
            <View className="field">
              <View className="label">地址</View>
              <View className="entry address-res">
                <View className="address-res-lt">
                  <View className="address-res-lt-main">
                    {address.line2 + ', ' + address.suburb + ', ' + address.state}
                  </View>
                  {address.line1 && <View className="address-res-lt-sub">{address.line1}</View>}
                </View>
                <View className="address-res-reset" onClick={this.resetLine.bind(this)}>
                  清空
                </View>
              </View>
            </View>
          ) : (
            <View className="field">
              <View className="label">地址</View>
              <View className="entry">
                <Input
                  type="text"
                  disabled={address.line2}
                  onChange={this.searchAddressValue.bind(this)}
                  onInput={this.searchAddress.bind(this)}
                  value={this.state.searchValue}
                  placeholder="搜索街道地址，如100 George St, The Rocks"
                ></Input>
              </View>
              {searchList.length > 0 && (
                <View className="search">
                  {searchList.map(item => {
                    return (
                      <View
                        key={item.street}
                        taroKey={item.street}
                        className="search-item"
                        onClick={this.selectSearchAddress.bind(this, item)}
                      >
                        {item.street + ', ' + item.suburb + ', ' + item.state}
                      </View>
                    )
                  })}
                </View>
              )}
            </View>
          )}

          <View className="field">
            <View className="label">门牌号</View>
            <View className="entry">
              <Input
                type="text"
                value={address.line1}
                onInput={e => this.setState({ address: { ...address, line1: e.target.value } })}
                placeholder="选填，如Unit 16、101室"
              ></Input>
            </View>
          </View>
          {/* <View className='field'>
            <View className='label'></View>
            <View className='entry address-res'>
              <View className='address-res-lt'>
                <View className='address-res-lt-main'>{address.line1}</View>
                <View className='address-res-lt-sub'>{address.line2}</View>
              </View>
              <View className='address-res-reset' onClick={this.resetLine.bind(this)}>清空</View>
            </View>
          </View> */}
          <View className="field">
            <View className="label">标签</View>
            <View className="entry">
              <Text className={address.tag === '家' ? 'tag sel' : 'tag'} onClick={this.setTag.bind(this, '家')}>
                家
              </Text>
              <Text className={address.tag === '公司' ? 'tag sel' : 'tag'} onClick={this.setTag.bind(this, '公司')}>
                公司
              </Text>
              <Text className={address.tag === '学校' ? 'tag sel' : 'tag'} onClick={this.setTag.bind(this, '学校')}>
                学校
              </Text>
              <Text className={address.tag === '其它' ? 'tag sel' : 'tag'} onClick={this.setTag.bind(this, '其它')}>
                其它
              </Text>
            </View>
          </View>
          <View className="field">
            <View className="label">联系人</View>
            <View className="entry">
              <Input
                type="text"
                className="input-pd"
                value={address.receiver}
                onInput={e => this.setState({ address: { ...address, receiver: e.target.value } })}
                placeholder="请填写收货人姓名"
              ></Input>
              <View className="sex">
                <View className="sex-item" onClick={this.changeSex.bind(this, 'mr')}>
                  <View className={'checkbox ' + (address.salutation == 'mr' ? 'sel' : '')}>
                    <View></View>
                  </View>
                  先生
                </View>
                <View className="sex-item" onClick={this.changeSex.bind(this, 'ms')}>
                  <View className={'checkbox ' + (address.salutation == 'ms' ? 'sel' : '')}>
                    <View></View>
                  </View>
                  女士
                </View>
              </View>
            </View>
          </View>
          <View className="field">
            <View className="label">手机号</View>
            <View className="entry">
              <Input
                type="text"
                value={address.mobile}
                onInput={e => this.setState({ address: { ...address, mobile: e.target.value } })}
                placeholder="请填写收货人手机号"
              ></Input>
            </View>
          </View>
          <View className={submiting ? 'confirm submiting' : 'confirm'} onClick={this.submit.bind(this)}>
            {submiting && <Text className="at-icon at-icon-loading-2"></Text>}
            <View>{this.state.pageType === 'new' ? '保存' : '修改'}地址</View>
          </View>
        </View>
      </View>
    )
  }
}

export default EditAddress
