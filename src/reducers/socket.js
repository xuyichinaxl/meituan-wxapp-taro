import Taro from '@tarojs/taro'
import {
  SOCKETSTATUS,
  SOCKETSHOPLIST,
  SOCKETAFTERTIME,
  SOCKETREAD
} from '../constants/socket'

const INITIAL_STATE = {
  socketStatus: false,
  socketAfterTime: Taro.getStorageSync('socketAfterTime') || '',
  socketShopList: new Map(Taro.getStorageSync('socketMessage') || '')
}

export default function globalData(state = INITIAL_STATE, action) {
  switch (action.type) {
    case SOCKETSTATUS:
      return {
        ...state,
        socketStatus: action.payload
      }
      case SOCKETSHOPLIST:
        Taro.setStorageSync('socketMessage', Array.from(action.payload))
        return {
          ...state,
          socketShopList: action.payload
        }
        case SOCKETAFTERTIME:
          Taro.setStorageSync('socketAfterTime', action.payload)
          return {
            ...state,
            socketAfterTime: action.payload
          }
          default:
            return state
  }
}