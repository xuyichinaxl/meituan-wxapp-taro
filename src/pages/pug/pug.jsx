import Taro, { Component } from '@tarojs/taro'
import { View } from '@tarojs/components'
import Navbar from '../../components/navBar/navBar'
import Loading from '../../components/loading/loading'
import LoadMore from '../../components/loadMore/loadMore'
import StoreCard from '../../components/storeCard/storeCard'
import { dateFormat } from '../../utils/util'
import './pug.scss'

class Index extends Component {

  config = {
    onReachBottomDistance: 50
  }

  constructor () {
    super(...arguments)
    this.isEval = false
    this.state = {
      pageIndex: 1,
      noMore: false,
      loading: true,
      blockScrollTop: [],
      indexTime: '',
      pugList: []
    }
  }

  componentDidMount () {
    this.getPugList()
  }

  componentWillUnmount () { }

  onPageScroll (e) {
    let len = this.state.blockScrollTop.length
    for (let i = 0; i < len; i++) {
      let nextI = i + 1 === len ? i : i + 1
      if (this.state.blockScrollTop[i].time !== this.state.indexTime && ((this.state.blockScrollTop[i].top < e.scrollTop && this.state.blockScrollTop[nextI].top > e.scrollTop) || (this.state.blockScrollTop[nextI].top < e.scrollTop && nextI === i))) {
        this.setState({
          indexTime: this.state.blockScrollTop[i].time,
        })
        console.log(1111)
      }
    }
  }

  componentDidShow () { }

  componentDidHide () { }

  updateScrollData () {
    const query = Taro.createSelectorQuery()
    query.selectAll('.block').boundingClientRect().exec(res => {
      let blockScrollTop = []
      let offset = res[0][0].top
      res[0].map((item, index) => {
        blockScrollTop.push({
          top: item.top - offset,
          time: this.state.pugList[index].time
        })
      })
      this.setState({
        indexTime: blockScrollTop[0].time,
        blockScrollTop: blockScrollTop
      })
    })
  }

  getPugList () {
    if (this.isEval) {
      return
    }
    this.isEval = true
    let { pageIndex, noMore, pugList } = this.state
    if (noMore) {
      return
    }
    Taro.$http({url: '/history', data: {page_size: 20, page_index: this.state.pageIndex}}).then(res => {
      if (this.state.pageIndex * 20 >= res.total) {
        noMore = true
      } else {
        pageIndex++
      }
      let today = new Date()
      let year = today.getFullYear()
      let month = today.getMonth()
      let day = today.getDate()
      let todayTimestamp = Date.parse(year + '/' + (month + 1) + '/' + day)
      let yestodayTimestamp = todayTimestamp - 86400000
      let time = ''
      res.shops.map(item => {
        let timestamp = Date.parse(item.added_at)
        if (timestamp >= todayTimestamp) {
          time = '今天'
        } else if (timestamp < todayTimestamp && timestamp >= yestodayTimestamp) {
          time = '昨天'
        } else {
          time = dateFormat(item.added_at, 'yyyy-MM-dd')
        }
        let project = pugList.find(pugItem => pugItem.time === time)
        if (project) {
          project.data.push(item)
        } else {
          pugList.push({
            time: time,
            data: []
          })
          pugList[pugList.length -1].data.push(item)
        }
      })
      this.setState({
        pugList: pugList,
        noMore: noMore,
        pageIndex: pageIndex,
        loading: false
      }, () => {
        this.updateScrollData()
        this.isEval = false
      })
    })
  }

  onReachBottom () {
    this.getPugList()
  }

  render () {
    return (
      <View className='collect'>
        <Navbar title='足迹' borderColor='#cacacc'></Navbar>
        <View className='block-title fix'>{this.state.indexTime}</View>
        {
          this.state.loading ? <Loading></Loading> : (
            <View>
              {
                this.state.pugList.map((item) => {
                  return (
                    <View className='block' key={item.time} taroKey={item.time}>
                      <View className='block-title'>{item.time}</View>
                      {
                        item.data.map(subItem => {
                          return <View key={subItem.added_at} taroKey={subItem.added_at}><StoreCard isPug storeInfo={subItem}></StoreCard></View>
                        })
                      }
                    </View>
                  )
                })
              }
              <LoadMore noMore={this.state.noMore}></LoadMore>
            </View>
          )
        }
      </View>
    )
  }
}

export default Index
