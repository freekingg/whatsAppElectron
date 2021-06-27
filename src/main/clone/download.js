const axios = require('axios')
const fs = require('fs')
const path = require('path')

export default task => {
  // console.log('task', task)

  let src = task.src
  if (isBase64(task.url)) {
    transferToImg(task.url, src)
    return
  }

  const { pathname } = new URL(task.url)
  // console.log(new URL(task.url))
  const extname = path.extname(pathname)
  // console.log('extname: ', extname)
  if (!extname) {
    // src = `${task.src}/index.html`
    src = path.join(task.src, 'index.html')
  }

  // 请求资源url并分类写入
  return new Promise(async (resolve, reject) => {
    try {
      const response = await axios({ url: task.url, responseType: 'arraybuffer', timeout: 10000 })
      fs.writeFileSync(src, response.data, 'binary')
      resolve(true)
    } catch (error) {
      console.log('error', error)
      resolve(false)
    }
  })
}

function isBase64(str) {
  // eslint-disable-next-line no-useless-escape
  var reg = /^\s*data:([a-z]+\/[a-z0-9-+.]+(;[a-z-]+=[a-z0-9-]+)?)?(;base64)?,([a-z0-9!$&',()*+;=\-._~:@\/?%\s]*?)\s*$/i
  if (reg.test(str)) {
    return true
  } else {
    return false
  }
}

/**
 *
 * base64->图片
 */
function transferToImg(imgData, dir) {
  // 过滤data:URL
  const base64Data = imgData.replace(/^data:image\/\w+;base64,/, '')
  const dataBuffer = Buffer.from(base64Data, 'base64')

  const allowExtname = ['png', 'jpg', 'jpeg', 'webp', 'bmp'] // 支持的图片格式

  // 获取扩展名
  let extname = ''
  const filterResult = allowExtname.filter(item => {
    return imgData.includes(item)
  })
  extname = '.' + filterResult[0]

  // 写入图片
  fs.writeFileSync(`${dir}/${new Date().getTime()}${extname}`, dataBuffer)
}
