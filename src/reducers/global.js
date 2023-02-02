import Taro from '@tarojs/taro'
import {
  STATUSBARHEIGHT,
  SYSTEMINFO,
  ADDRESSLIST,
  USERINFO,
  CARTS
} from '../constants/global'

const INITIAL_STATE = {
  statusBarHeight: 0,
  systemInfo: {},
  addressList: [],
  userInfo: Taro.getStorageSync('userInfo') || {
    profile: {},
    access_token: ''
  },
  carts: Taro.getStorageSync('carts') || {
    items: []
  }
}

export default function globalData(state = INITIAL_STATE, action) {
  switch (action.type) {
    case STATUSBARHEIGHT:
      return {
        ...state,
        statusBarHeight: action.payload
      }
      case SYSTEMINFO:
        return {
          ...state,
          systemInfo: action.payload
        }
        case ADDRESSLIST:
          return {
            ...state,
            addressList: action.payload
          }
          case USERINFO:
            return {
              ...state,
              userInfo: action.payload
            }
            case CARTS:
              Taro.setStorageSync('carts', action.payload)
              return {
                ...state,
                carts: action.payload
              }
              default:
                return state
  }
}