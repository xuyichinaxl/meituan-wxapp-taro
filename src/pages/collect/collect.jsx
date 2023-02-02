import Taro, { Component } from '@tarojs/taro'
import { View } from '@tarojs/components'
import Navbar from '../../components/navBar/navBar'
import Loading from '../../components/loading/loading'
import LoadMore from '../../components/loadMore/loadMore'
import StoreCard from '../../components/storeCard/storeCard'
import './collect.scss'

class Collect extends Component {
  config = {
    onReachBottomDistance: 50
  }

  constructor() {
    super(...arguments)
    this.isEval = false
    this.state = {
      pageIndex: 1,
      shops: [],
      noMore: false,
      loading: true
    }
  }

  componentWillMount() {
    this.loadBookmarks()
  }

  componentWillUnmount() {}

  componentDidShow() {}

  componentDidHide() {}

  loadBookmarks() {
    if (this.isEval) {
      return
    }
    this.isEval = true
    let { pageIndex, noMore } = this.state
    if (noMore) {
      return
    }
    Taro.$http({ url: '/bookmarks', data: { page_size: 20, page_index: this.state.pageIndex } }).then(res => {
      if (this.state.pageIndex * 20 >= res.total) {
        noMore = true
      } else {
        pageIndex++
      }
      this.setState(
        {
          shops: res.shops.concat(this.state.shops),
          noMore: noMore,
          pageIndex: pageIndex,
          loading: false
        },
        () => {
          this.isEval = false
        }
      )
    })
  }

  delShop(index) {
    let { shops } = this.state
    shops.splice(index, 1)
    this.setState({
      shops: shops
    })
    Taro.showToast({
      title: '删除成功',
      icon: 'none',
      duration: 2000
    })
  }

  onReachBottom() {
    this.loadBookmarks()
  }

  render() {
    const len = this.state.shops.length
    return (
      <View className="collect">
        <Navbar title="收藏"></Navbar>
        {this.state.loading && <Loading></Loading>}
        {this.state.shops.map((item, index) => {
          return (
            <View key={item.id} taroKey={item.id}>
              <StoreCard isCollect storeInfo={item} onDelShop={this.delShop.bind(this, index)}></StoreCard>
              {index !== len - 1 && <View className="line"></View>}
            </View>
          )
        })}
        {!this.state.loading && <LoadMore noMore={this.state.noMore}></LoadMore>}
      </View>
    )
  }
}

export default Collect
