import Taro from '@tarojs/taro'
import store from '../store'
import {
  onSetUserInfo
} from '../actions/global'

// const store = configStore()
const baseURL = 'https://orca-api-ap.yundian.xyz'

// add finally support 
Promise.prototype.finally = function (callback) {
  var Promise = this.constructor;
  return this.then(
    function (value) {
      Promise.resolve(callback()).then(
        function () {
          return value;
        }
      );
    },
    function (reason) {
      Promise.resolve(callback()).then(
        function () {
          throw reason;
        }
      );
    }
  );
}

const request = function (options) {
  let data = options.data || {}
  let userInfo = Taro.getStorageSync('userInfo')
  let access_token = userInfo ? userInfo.access_token : ''
  return new Promise((resolve, reject) => {
    Taro.request({
      method: options.method || 'GET',
      url: (options.baseURL || baseURL) + options.url,
      data: data,
      header: {
        Authorization: access_token ? `Bearer ${access_token}` : undefined
      },
      success: (res) => {
        if (res.statusCode === 400) {
          if (Array.isArray(res.data.message)) {
            try {
              const message = res.data.message.map(m => {
                let cons = []
                for (let [key, value] of Object.entries(m.constraints)) {
                  cons.push(value)
                }


                Taro.showToast({
                  title: cons.join(','), // TODO:
                  icon: 'none',
                  duration: 3000
                })
              }).join(';') + '.'
            } catch (err) {
              console.log(err)
            }
          } else if (typeof res.data.message === 'string') {
            Taro.showToast({
              title: res.data.message, // TODO:
              icon: 'none',
              duration: 3000
            })
          }

          reject(res.data)
        } else if (res.statusCode === 401 || res.statusCode === 403) {
          Taro.removeStorageSync('userInfo')

          store.dispatch(onSetUserInfo({
            profile: {},
            access_token: ''
          }))
          if (!options.noModal) {
            Taro.showModal({
              title: '尚未登录',
              content: '请登录后再执行该操作',
              confirmText: '登录',
              success: res => {
                if (res.confirm) {
                  Taro.navigateTo({
                    url: '/pages/login/login'
                  })
                }
              }
            })
          }

        } else if (res.statusCode === 500) {
          Taro.showToast({
            title: '服务器出错啦，请稍后重试！',
            icon: 'none',
            duration: 3000
          })
          reject(res.data)
        }

        if (res.statusCode > 399) reject(res.data)
        else resolve(res.data)
      },
      fail: reject
    })

  })
}

export default request