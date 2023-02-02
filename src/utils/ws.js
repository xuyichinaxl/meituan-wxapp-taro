// client.js
import Taro from '@tarojs/taro'
import io from 'weapp.socket.io'
import store from '../store'
import {
  onSetSocketStatus,
  onMessages,
  onMessage,
  onShopInfo
} from '../actions/socket'

// customer
const url = 'https://orca-ws.yundian.xyz';

let socket;

export const openSocket = (token) => {
  if (token) {
    let after = Taro.getStorageSync('socketAfterTime') || ''
    socket = io.connect(url, {
      path: '/socket.io/1',
      query: `token=${token}&after=${after}&interval=300`
    });

    socket.on('connect', (s) => {
      store.dispatch(onSetSocketStatus(true))
      console.log('------ connected ------');
      // socket.emit('get-shop-info', '000000000000000000000000');
      // socket.emit('get-user-info', '000000000000000000000000');
      // socket.emit('get-messages', {
      //   after: '2020-05-20T05:18:07.443Z',
      //   count: 10
      // });
    });

    socket.on('disconnect', (s) => {
      store.dispatch(onSetSocketStatus(false))
      console.log('disconnected');
    });

    socket.on('message', (s) => {
      store.dispatch(onMessage(s))
    });

    socket.on('ping', () => {
      console.log('ping received');
    });

    socket.on('messages', (s) => {
      store.dispatch(onMessages(s))
    });

    socket.on('user-info', (s) => {
      console.log('user-info:' + JSON.stringify(s, null, 2));
    });

    socket.on('shop-info', (s) => {
      store.dispatch(onShopInfo(s))
    });

    socket.on('exception', (s) => {
      console.log('exception:' + JSON.stringify(s, null, 2));
    });
  }

}

export const closeSocket = () => {
  socket && socket.close()
}

export const getShopInfo = (from) => {
  socket && socket.emit('get-shop-info', from)
}

export const updateMessageStatus = (params) => {
  socket && socket.emit('update-message-status', params)
}