import {
  combineReducers
} from 'redux'
import counter from './counter'
import globalData from './global'
import socket from './socket'

export default combineReducers({
  counter,
  socket,
  globalData
})