import Taro from '@tarojs/taro'
import {
  SOCKETSTATUS,
  SOCKETSHOPLIST,
  SOCKETAFTERTIME
} from '../constants/socket'
import {
  getShopInfo
} from '../utils/ws'

export const onSetSocketStatus = (payload) => {
  return {
    type: SOCKETSTATUS,
    payload: payload
  }
}

export const onSetSocketTime = (payload) => {
  return {
    type: SOCKETAFTERTIME,
    payload: payload
  }
}

export const onSetSocketShopList = (payload) => {
  setUnreadMessageTip(payload)
  return {
    type: SOCKETSHOPLIST,
    payload: payload
  }
}

export const onClearSocketMessage = () => {
  return (dispatch, getState) => {
    const {
      socketShopList
    } = getState().socket
    socketShopList.clear()
    dispatch(onSetSocketShopList(socketShopList))
  }
}

export const onSetSocketRead = (payload) => {
  return (dispatch, getState) => {
    const {
      socketShopList
    } = getState().socket
    let socketData = socketShopList.get(payload)
    socketData.readList = socketData.readList.concat(socketData.msgList)
    socketData.msgList = []
    dispatch(onSetSocketShopList(socketShopList))
  }
}

export const onSetSocketClear = (payload) => {
  return (dispatch, getState) => {
    const {
      socketShopList
    } = getState().socket
    socketShopList.delete(payload)
    // socketData.readList = []
    // socketData.msgList = []
    dispatch(onSetSocketShopList(socketShopList))
  }
}

export const onSetSocketInfo = (payload) => {
  return (dispatch, getState) => {
    const {
      socketAfterTime
    } = getState().socket
    dispatch(onSetSocketShopList(payload))
    dispatch(onSetSocketTime(calcAfterTime([...payload.values()], socketAfterTime)))
  }
}

export const onMessages = (payload) => {
  return (dispatch, getState) => {
    const {
      socketShopList
    } = getState().socket
    dispatch(onSetSocketInfo(processMessages(payload, socketShopList)))
  }
}

export const onMessage = (payload) => {
  return (dispatch, getState) => {
    const {
      socketShopList
    } = getState().socket
    dispatch(onSetSocketInfo(processMessage(payload, socketShopList)))
  }
}

export const onShopInfo = (payload) => {
  return (dispatch, getState) => {
    const {
      socketShopList
    } = getState().socket
    let message = socketShopList.get(payload.id)
    message.shop = payload
    message.shop.updateTime = Date.now()
    socketShopList.set(payload.id, message)
    dispatch(onSetSocketShopList(socketShopList))
  }
}

export const onUpdateSocketShop = () => {
  return (dispatch, getState) => {
    const {
      socketShopList
    } = getState().socket
    setUnreadMessageTip(socketShopList)
    for (let value of socketShopList.values()) {
      if (value.type === 'shop') {
        let now = Date.now()
        if (now - (value.shop.updateTime || 0) > 3600000) {
          let shopId = value.shop.id
          if (!shopId) {
            let list = value.msgList.length > 0 ? value.msgList : value.readList.length > 0 ? value.readList : []
            if (list.length > 0) {
              shopId = list[0].from
            }
          }
          getShopInfo(shopId)
        }
      }
    }
  }
}

const processMessages = (messageList, socketShopList) => {
  messageList.map(item => {
    let type = item.from_type
    let mapKey = type === 'shop' ? item.from : type
    let message = socketShopList.get(mapKey)
    item.timestamp = new Date(item.timestamp).getTime()
    if (message) {
      message.msgList.push(item)
    } else {
      socketShopList.set(mapKey, {
        shop: {},
        type: type,
        msgList: [item],
        readList: []
      })
      if (type === 'shop') {
        getShopInfo(item.from)
      }
    }
  })
  for (let value of socketShopList.values()) {
    value.msgList.sort((a, b) => {
      a.timestampDiff = Math.abs(a.timestamp - b.timestamp)
      return a.timestamp - b.timestamp
    })
  }
  return socketShopList
}

const processMessage = (message, socketShopList) => {
  message.timestamp = new Date(message.timestamp).getTime()
  let type = message.from_type
  let mapKey = type === 'shop' ? message.from : type
  let s = socketShopList.get(mapKey)
  if (s) {
    if (s.msgList.length === 0) {
      if (s.readList.length > 0) {
        message.timestampDiff = message.timestamp - s.readList[s.readList.length - 1].timestamp
      } else {
        message.timestampDiff = 9999999999
      }
      s.msgList.push(message)
    } else {
      for (let i = s.msgList.length - 1; i >= 0; i--) {
        if (message.timestamp > s.msgList[i].timestamp) {
          message.timestampDiff = message.timestamp - s.msgList[i].timestamp
          s.msgList.splice(i + 1, 0, message)
          break
        }
      }
    }
  } else {
    socketShopList.set(mapKey, {
      shop: {},
      type: message.from_type,
      msgList: [message],
      readList: []
    })
    if (type === 'shop') {
      getShopInfo(message.from)
    }
  }
  return socketShopList
}

const calcAfterTime = (list, after) => {
  list.map(item => {
    if (item.msgList.length > 0) {
      after = Math.max(after, item.msgList[item.msgList.length - 1].timestamp)
    }
  })
  return after
}

const setUnreadMessageTip = payload => {
  const allowSetRoute = [
    'pages/home/home',
    'pages/cart/cart',
    'pages/message/message',
    'pages/me/me',
  ]
  let pages = getCurrentPages()
  let currPage = pages[pages.length - 1]
  if (allowSetRoute.indexOf(currPage.route) > -1) {
    let unread = 0
    for (let value of payload.values()) {
      unread += value.msgList.length
    }
    if (unread > 0) {
      Taro.setTabBarBadge({
        index: 2,
        text: unread > 99 ? '...' : '' + unread
      })
    } else {
      Taro.removeTabBarBadge({
        index: 2
      })
    }
  }
}