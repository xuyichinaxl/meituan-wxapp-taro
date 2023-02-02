import Taro, { Component } from '@tarojs/taro'
import { connect } from '@tarojs/redux'
import { View, Swiper, SwiperItem, Image, Input, Text, Button, CoverView } from '@tarojs/components'
import Navbar from '../../components/navBar/navBar'
import Loading from '../../components/loading/loading'
import LoadMore from '../../components/loadMore/loadMore'
import Share from '../../components/share/share'
import { dateFormat, dateDiff } from '../../utils/util'
// import phiz from '../../assets/img/dynamic_detail_phiz.png'
import heartEmpty from '../../assets/img/heart_empty.png'
import heart from '../../assets/img/heart.png'
import commentImg from '../../assets/img/comment.png'
import './dynamicDetail.scss'

@connect(({ globalData }) => ({
  globalData
}))
class DynamicDetail extends Component {
  config = {
    onReachBottomDistance: 50
  }

  constructor() {
    super(...arguments)
    this.blurForOpenEmoji = false
    this.firstCommentTop = 0
    this.isEval = false
    this.state = {
      commentClearStatus: false,
      isShareShow: false,
      id: this.$router.params.id,
      momentData: {},
      commentList: [],
      commentFocus: false,
      hearted: false,
      loading: true,
      noMore: false,
      pageIndex: 1,
      commentPlaceholder: '说点什么...',
      comment: '',
      reply: {},
      cursor: 0,
      emojiY: 0,
      swiperHeight: wx.getSystemInfoSync().windowWidth,
      coverViewLen: 0,
      emojiList: [
        '😄',
        '😊',
        '😋',
        '😍',
        '😜',
        '😘',
        '😆',
        '😎',
        '😉',
        '🥳',
        '😈',
        '😂',
        '😭',
        '😕',
        '😞',
        '😫',
        '😴',
        '😳',
        '😡',
        '😱',
        '🤮',
        '😷',
        '👍',
        '👎',
        '🙏',
        '👏',
        '👌',
        '💪',
        '🔥',
        '💔',
        '🌹',
        '💋'
      ]
    }
  }

  componentWillMount() {
    this.getMomentDetail()
  }

  componentDidMount() {}

  componentDidUpdate(prevProps, prevState) {
    if (prevState.loading !== this.state.loading) {
      this.calcDom()
    }
  }

  componentWillUnmount() {}

  componentDidShow() {}

  componentDidHide() {}

  onShareAppMessage() {
    return {}
  }

  onReachBottom() {
    this.getComments()
  }

  getMomentDetail() {
    Taro.$http({ url: `/moments/${this.state.id}` })
      .then(res => {
        this.setState({
          momentData: res
        })

        const first = res.images[0]

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
      })
      .then(() => {
        this.getComments()
      })
      .finally(() => {
        this.setState({
          loading: false
        })
      })
  }

  calcDom() {
    const query = Taro.createSelectorQuery()
    query
      .select('.dynamic-comment')
      .boundingClientRect()
      .exec(res => {
        this.firstCommentTop = res[0].top
      })
    query
      .select('.input-dis')
      .boundingClientRect()
      .exec(res => {
        this.setState({
          coverViewLen: res[1].width
        })
      })
  }

  getComments() {
    if (this.isEval) return
    this.isEval = true
    let { pageIndex, noMore } = this.state
    if (noMore) {
      return
    }
    Taro.$http({ url: `/moments/${this.state.id}/comments`, data: { page_index: pageIndex, page_size: 20 } }).then(
      res => {
        if (pageIndex * 20 >= res.total) {
          noMore = true
        } else {
          pageIndex++
        }
        this.setState({
          commentList: this.state.commentList.concat(res.comments),
          noMore: noMore,
          pageIndex: pageIndex
        })
        this.isEval = false
      }
    )
  }

  setReply(comment) {
    // 缺少账号信息，需要判断reply是否为当前用户
    if (
      comment.created_by.id &&
      comment.created_by.id !== this.props.globalData.userInfo.profile.id &&
      !this.state.content
    ) {
      this.setState({
        commentFocus: true,
        commentPlaceholder: '回复' + comment.created_by.nickname + ':',
        reply: comment.created_by
      })
    }
  }

  toggleHeart() {
    let method = this.state.hearted ? 'DELETE' : 'POST'
    Taro.$http({ url: `/moments/${this.state.id}/like`, method }).then(() => {
      this.setState({
        hearted: !this.state.hearted,
        momentData: {
          ...this.state.momentData,
          likes: this.state.momentData.likes + (method === 'DELETE' ? -1 : 1)
        }
      })
    })
  }

  commentBlur() {
    this.setState({
      commentFocus: false
      // commentPlaceholder: '说点什么...'
    })
  }

  setInputFocus() {
    this.setState(
      {
        cursor: this.state.content.length
      },
      () => {
        this.setState(
          {
            emojiY: 0
          },
          () => {
            this.setState({
              commentFocus: true
            })
          }
        )
      }
    )
  }

  catchEmojiClick() {
    this.setState({
      emojiY: 0
    })
  }

  commentInput(e) {
    // 一次change只setstate一次
    if (e.detail.value && !this.state.commentClearStatus) {
      this.setState({
        commentClearStatus: true
      })
    }
    if (!e.detail.value && this.state.commentClearStatus) {
      this.setState({
        commentClearStatus: false
      })
    }
  }

  commentInputChange(e) {
    this.setState({
      comment: e.detail.value
    })
  }

  submitComment(e) {
    if (!e.detail.value.trim()) {
      Taro.showToast({
        title: '评论不能为空',
        icon: 'none'
      })
      return
    }
    Taro.$http({
      method: 'POST',
      url: `/moments/${this.state.id}/comments`,
      data: { content: e.detail.value, reply_to: null }
    }).then(res => {
      let list = this.state.commentList
      list.unshift({
        id: res.id,
        content: res.content,
        created_at: res.created_at,
        reply_to: res.reply_to,
        created_by: {
          nickname: this.props.globalData.userInfo.profile.nickname,
          avatar: this.props.globalData.userInfo.profile.avatar
        }
      })
      this.setState(
        {
          momentData: {
            ...this.state.momentData,
            comments: this.state.momentData.comments + 1,
            commentList: list
          },
          comment: ''
        },
        () => {
          this.clearInput()
          Taro.pageScrollTo({
            scrollTop: this.firstCommentTop - this.props.globalData.systemInfo.windowHeight / 2
          })
        }
      )

      Taro.showToast({
        title: '回复成功',
        icon: 'none'
      })
    })
  }

  openEmoji() {
    this.blurForOpenEmoji = true
    this.setState({
      emojiY: this.state.emojiY === 0 ? -320 : 0
    })
  }

  inputEmoji(emoji) {
    this.setState({
      content: this.state.content + emoji
    })
  }

  clearInput() {
    // 下一次宏任务调用清空
    setTimeout(() => {
      this.setState({
        comment: '',
        commentClearStatus: false
      })
    }, 0)
    // if (this.state.reply) {
    //   this.setState({
    //     reply: {},
    //     commentPlaceholder: '说点什么...'
    //   })
    // }
  }

  changeShareShow() {
    this.setState({
      isShareShow: !this.state.isShareShow
    })
  }

  commentFocusFn() {
    this.setState({
      commentFocus: true
    })
  }

  viewbigImage(index) {
    let images = this.state.momentData.images.map(item => item.url)
    Taro.previewImage({
      urls: images,
      current: images[index]
    })
  }

  render() {
    const {
      momentData,
      commentList,
      commentPlaceholder,
      commentFocus,
      cursor,
      emojiY,
      comment,
      commentClearStatus,
      coverViewLen
    } = this.state
    return (
      <View className="dynamic-detail" onClick={this.catchEmojiClick.bind(this)}>
        <Navbar title="动态"></Navbar>
        <Share
          type="moments"
          rqId={this.state.id}
          isShareShow={this.state.isShareShow}
          onChangeShareShow={this.changeShareShow.bind(this)}
        ></Share>
        {this.state.loading ? (
          <Loading></Loading>
        ) : (
          <View>
            <View
              className="say"
              style={'transform: translateY(' + emojiY + 'rpx)'}
              onClick={e => {
                e.stopPropagation()
              }}
            >
              <View className="say-input">
                <View className="input">
                  <Input
                    type="text"
                    className="input-dis"
                    adjustPosition
                    confirmType="send"
                    cursor={cursor}
                    cursorSpacing="18rpx"
                    focus={commentFocus}
                    placeholder={commentPlaceholder}
                    value={comment}
                    onFocus={this.commentFocusFn.bind(this)}
                    onConfirm={this.submitComment.bind(this)}
                    onInput={this.commentInput.bind(this)}
                    onChange={this.commentInputChange.bind(this)}
                    onBlur={this.commentBlur.bind(this)}
                  ></Input>
                  {/* <Input type='text' className='input-dis' adjustPosition confirmType='send' cursor={cursor} cursorSpacing='18rpx' disabled={!commentFocus} focus={commentFocus} placeholder={commentPlaceholder} value={comment} onConfirm={this.submitComment.bind(this)} onInput={this.commentInput.bind(this)} onBlur={this.commentBlur.bind(this)}></Input>
                    {
                      !commentFocus && (
                        <CoverView className='input-cover' style={`width: ${!commentFocus && emojiY === 0 ? (coverViewLen + 'px') : 'calc(100vw - 171rpx)'}`} onClick={this.setInputFocus.bind(this)}>
                          <CoverView className='input-cover-wrap'>
                            <CoverView className={comment ? 'input-cover-wrap-word' : 'input-cover-wrap-word placeholder'}>{comment || commentPlaceholder}</CoverView>
                          </CoverView>
                        </CoverView>
                      )
                    } */}
                  {commentClearStatus && (
                    <View className="input-clear at-icon at-icon-close" onClick={this.clearInput.bind(this)}></View>
                  )}
                </View>
                {/* <Image className='phiz' src={phiz} onClick={this.openEmoji.bind(this)}></Image> */}
                {!commentFocus && emojiY === 0 && (
                  <View>
                    <Image className="heart" src={this.state.hearted ? heart : heartEmpty}></Image> {momentData.likes}
                    <Image className="comment" src={commentImg}></Image> {momentData.comments}
                  </View>
                )}
              </View>
              <View className="emoji">
                {this.state.emojiList.map(item => {
                  return (
                    <View taroKey={item} key={item} onClick={this.inputEmoji.bind(this, item)}>
                      {item}
                    </View>
                  )
                })}
              </View>
              <View className={emojiY === 0 ? 'safearea w' : 'safearea c'}></View>
            </View>

            <Swiper
              className="swiper"
              onChange={this.switchCate}
              indicator-dots={momentData.images.length > 1}
              indicator-active-color="#f7cc62"
              style={'height: ' + this.state.swiperHeight + 'px'}
            >
              {momentData.images.map((item, index) => {
                return (
                  <SwiperItem className="swiper-item" key={item.id} taroKey={item}>
                    <Image
                      onClick={this.viewbigImage.bind(this, index)}
                      className="swiper-img"
                      lazyLoad
                      mode={momentData.images[0].id === item.id ? 'aspectFit' : 'aspectFit'}
                      src={item.url}
                    ></Image>
                  </SwiperItem>
                )
              })}
            </Swiper>

            <View className="main">
              <View className="dynamic-title">
                <View className="view">{momentData.title}</View>
              </View>
              <View className="dynamic-text">{momentData.content}</View>
              <View className="dynamic-time">{dateDiff(momentData.created_at, 'yyyy/MM/hh')}</View>
              <View className="dynamic-action">
                <Button onClick={this.changeShareShow.bind(this)} className="action">
                  分享
                </Button>
                <View className={this.state.hearted ? 'action active' : 'action'} onClick={this.toggleHeart.bind(this)}>
                  喜欢
                </View>
              </View>
            </View>
            <View className="dynamic-line"></View>
            <View className="dynamic-comment">
              <View className="dynamic-comment-list">
                {commentList.map(item => {
                  return (
                    <View className="dynamic-comment-list-item" key={item.id} taroKey={item.id}>
                      <Image src={item.created_by.avatar}></Image>
                      {/* <View className="rg" onClick={this.setReply.bind(this, item)}> */}
                      <View className="rg">
                        <View className="name">
                          {item.created_by.nickname}
                          <Text>{dateFormat(item.created_at, 'MM-dd hh:mm')}</Text>
                        </View>
                        <View className="msg">
                          {item.reply_to && (
                            <Text>
                              回复<Text className="reply">{item.reply_to.nickname}</Text>：
                            </Text>
                          )}
                          {item.content}
                        </View>
                      </View>
                    </View>
                  )
                })}
                {commentList && commentList.length > 1 && <LoadMore noMore={this.state.noMore}></LoadMore>}
                {!commentList || (commentList.length === 0 && <View className="no-comments"> 还没有评论哦～</View>)}
              </View>
            </View>
          </View>
        )}
      </View>
    )
  }
}

export default DynamicDetail
