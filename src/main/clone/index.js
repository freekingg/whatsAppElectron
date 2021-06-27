import getResources from './get-resources'
import download from './download'

import { app } from 'electron'
const fs = require('fs')
const path = require('path')
const replace = require('replace-in-file')

const desktopdir = path.join(app.getPath('desktop'), `/freeking-site`)

const clone = async (link, event, win) => {
  console.log('link', link)
  const { host } = new URL(link)
  const { url, html, origin } = await getResources(link, win)
  const siteDir = path.join(desktopdir, host)
  mkdirsSync(siteDir)
  console.log('origin: ', origin)
  console.log('url: ', url)

  if (html) {
    const texts = html

    const src2 = path.join(siteDir, `index.html`)
    fs.writeFileSync(src2, texts)

    for (const item of origin) {
      const options = {
        files: src2,
        from: new RegExp(item, 'gi'),
        to: '.',
      }
      await replace(options)
    }
  }

  const pr = []

  for (const iterator of url) {
    const { pathname } = new URL(iterator)
    const dirname = path.dirname(pathname)
    const basename = path.basename(pathname)
    const extname = path.extname(pathname)
    let src = ''
    if (!extname) {
      src = await checkDir(pathname, siteDir)
    } else {
      src = await checkDir(dirname, siteDir)
    }
    const _src = path.join(src, dirname, basename)
    const s = await download({
      url: iterator,
      src: _src,
    })
    win.webContents.send('clone-log', `【${iterator}】正在下载...`)
    pr.push(s)
  }
  Promise.all(pr)
    .then(values => {
      console.log('all-ok')
      win.webContents.send('clone-all-finish', true)
    })
    .finally(() => {
      console.log('全部下载完成')
      win.webContents.send('clone-main-log', {
        title: '网站克隆完成',
        content: `网站克隆完成 ,存放目录为:【${siteDir}】`,
      })
      win.webContents.send('clone-all-finish', true)
    })
}

// 递归创建目录 同步方法
function mkdirsSync(dirname) {
  if (fs.existsSync(dirname)) {
    return true
  } else {
    if (mkdirsSync(path.dirname(dirname))) {
      fs.mkdirSync(dirname)
      return true
    }
  }
}

const checkDir = async (dirname, siteDir) => {
  return new Promise(resolve => {
    const src = path.join(siteDir, `${dirname}`)
    // console.log('src: ', src)
    const src2 = path.join(siteDir)
    mkdirsSync(src)
    resolve(src2)
  })
}

export default clone
