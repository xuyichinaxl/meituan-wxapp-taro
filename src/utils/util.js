export function dateFormat(date, fmt) { //author: meizz
  date = new Date(date)
  let o = {
    'M+': date.getMonth() + 1, //月份
    'd+': date.getDate(), //日
    'h+': date.getHours(), //小时
    'm+': date.getMinutes(), //分
    's+': date.getSeconds(), //秒
    'q+': Math.floor((date.getMonth() + 3) / 3), //季度
    'S': date.getMilliseconds() //毫秒
  }
  if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (date.getFullYear() + '').substr(4 - RegExp.$1.length))
  for (var k in o)
    if (new RegExp('(' + k + ')').test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (('00' + o[k]).substr(('' + o[k]).length)))
  return fmt
}

export function getUTCDate(date) {
  date = new Date(date)
  let month = date.getUTCMonth() + 1
  month = month < 10 ? '0' + month : month
  return date.getUTCFullYear() + '-' + month + '-' + date.getUTCDate() + 'T' + date.getUTCHours() + ':' + date.getUTCMinutes() + ':' + date.getUTCSeconds() + '.' + date.getUTCMilliseconds() + 'Z'
}

export function dateDiff(dateTime, fmt) {
  let result
  let minute = 1000 * 60
  let hour = minute * 60
  let day = hour * 24
  let month = day * 30

  let tempTime = Date.parse(dateFormat(dateTime, fmt))
  let now = new Date().getTime()
  let diffValue = now - tempTime
  let monthTemp = diffValue / month
  let weekTemp = diffValue / (7 * day)
  let dayTemp = diffValue / day
  let hourTemp = diffValue / hour
  let minTemp = diffValue / minute
  if (monthTemp >= 1) {
    return dateTime
  } else if (weekTemp >= 1) {
    result = '' + parseInt(weekTemp) + '星期前'
  } else if (dayTemp >= 1) {
    result = '' + parseInt(dayTemp) + '天前'
  } else if (hourTemp >= 1) {
    result = '' + parseInt(hourTemp) + '小时前'
  } else if (minTemp >= 1) {
    result = '' + parseInt(minTemp) + '分钟前'
  } else {
    result = '刚刚发表'
  }
  return result
}

export function dateDiffCompare(firstTime, lastTime) {
  let result
  let minute = 1000 * 60
  let hour = minute * 60
  let day = hour * 24
  let month = day * 30
  let year = month * 12

  firstTime = Date.parse(firstTime)
  lastTime = Date.parse(lastTime)

  let diffValue = Math.abs(lastTime - firstTime)

  let yearTemp = diffValue / year
  let monthTemp = diffValue / month
  let weekTemp = diffValue / (7 * day)
  let dayTemp = diffValue / day
  let hourTemp = diffValue / hour
  let minTemp = diffValue / minute
  if (yearTemp >= 1) {
    result = '' + parseInt(yearTemp) + '年后'
  } else if (monthTemp >= 1) {
    result = '' + parseInt(monthTemp) + '月后'
  } else if (weekTemp >= 1) {
    result = '' + parseInt(weekTemp) + '星期后'
  } else if (dayTemp >= 1) {
    result = '' + parseInt(dayTemp) + '天后'
  } else if (hourTemp >= 1) {
    result = '' + parseInt(hourTemp) + '小时后'
  } else {
    result = '' + parseInt(minTemp) + '分钟后'
  }
  return result
}

export function addSpace(str) {
  if (str) {
    str = str.split('')
    if (str.length <= 4) {
      return str.join('')
    }
    for (let i = 4; i < str.length; i = i + 4) {
      str.splice(i, 0, ' ')
      i++
    }
    return str.join('')
  }
}