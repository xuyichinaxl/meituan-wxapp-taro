import {
  STATUSBARHEIGHT,
  SYSTEMINFO,
  ADDRESSLIST,
  USERINFO,
  CARTS
} from '../constants/global'
import {
  closeSocket,
  openSocket
} from '../utils/ws'

export const onSetStatusBarHeight = (payload) => {
  return {
    type: STATUSBARHEIGHT,
    payload: payload
  }
}

export const onSetSystemInfo = (payload) => {
  return {
    type: SYSTEMINFO,
    payload: payload
  }
}

export const onSetAddressList = (payload) => {
  return {
    type: ADDRESSLIST,
    payload: payload
  }
}

export const onSetUserInfo = (payload) => {
  if (payload.access_token) {
    openSocket(payload.access_token)
  } else {
    closeSocket()
  }
  return {
    type: USERINFO,
    payload: payload
  }
}

export const onSetCartsData = payload => {
  return {
    type: CARTS,
    payload: payload
  }
}