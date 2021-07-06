import scrape from 'website-scraper'
import { app } from 'electron'
import PuppeteerPlugin from 'website-scraper-puppeteer'
const fs = require('fs')
const path = require('path')
const replace = require('replace-in-file')

class Clone {
  // constructor() {}
  async create(url, event, win) {
    return new Promise((resolve, reject) => {
      // 取第一个域名为文件夹名字
      const { host } = new URL(url)
      const name = host

      // 创建网站文件夹
      const desktopdir = path.join(app.getPath('desktop'), `/freeking-site`)
      const siteDir = path.join(desktopdir, name)

      if (fs.existsSync(siteDir)) {
        delFile(siteDir)
        console.log('存在目标文件夹，先删除')
      }

      win.webContents.send('clone-log', `【${host}】开始下载...`)

      const options = {
        urls: url,
        directory: siteDir,
        ignoreErrors: true,
        request: {
          headers: {
            'User-Agent':
              'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          },
        },
        urlFilter: function(url) {
          win.webContents.send('clone-log', `【${url}】正在下载...`)

          const ignore = ['cnzz', 'ce.cn']
          const r = ignore.filter(item => url.indexOf(item) !== -1)
          if (!r.length) {
            return url
          }
        },
        plugins: [
          new PuppeteerPlugin({
            launchOptions: {
              headless: true,
              executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
              defaultViewport: {
                width: 1920,
                height: 1080,
              },
              timeout: 60000,
            },
            scrollToBottom: { timeout: 10000, viewportN: 10 },
          }),
        ],
      }

      scrape(options)
        .then(result => {
          const src = path.join(siteDir, 'index.html')
          console.log('克隆完成', src)

          win.webContents.send('clone-main-log', {
            title: '网站克隆完成',
            content: `网站克隆完成 ,存放目录为:【${siteDir}】`,
          })
          win.webContents.send('clone-all-finish', true)

          const options = {
            files: src,
            from: [
              /<a([\s]+|[\s]+[^<>]+[\s]+)href=(\"([^<>"\']*)\"|\'([^<>"\']*)\')[^<>]*>/gi,
              /<script([\s]+|[\s]+[^<>]+[\s]+)src=(\"([^<>"\']*)\"|\'([^<>"\']*)\')[^<>]*>/gi,
              /hm.src/gi,
              /cnzz.com/gi,
              /window.open/gi,
            ],
            to: m1 => {
              if (!m1) return

              if (m1.indexOf('href') !== -1) {
                const reg = /href="[^"]*"/gi
                const str = m1.replace(reg, 'href="."')
                return str
              }

              if (m1.indexOf('src') !== -1) {
                const ignoreJs = ['cnzz', '51.la', 'baidu']

                const r = ignoreJs.filter(item => m1.indexOf(item) !== -1)
                if (r.length) {
                  const reg = /src="[^"]*"/gi
                  const str = m1.replace(reg, 'src="."')
                  return str
                }
              }

              if (m1.indexOf('hm.src') !== -1) {
                return 'hm'
              }

              if (m1.indexOf('cnzz.com') !== -1) {
                return ''
              }

              if (m1.indexOf('window.open') !== -1) {
                return ''
              }

              return m1
            },
          }

          replace(options)
            .then(results => {
              console.log('内容替换完成:', results)
              resolve(true)
            })
            .catch(error => {
              console.error('内容替换失败:', error)
              // eslint-disable-next-line prefer-promise-reject-errors
              reject(false)
            })
        })
        .catch(e => {
          console.log('网络克隆失败', e)
          // eslint-disable-next-line prefer-promise-reject-errors
          reject(false)
        })
    })
  }
}

/**
 *
 * @param {*} url
 */
function delFile(url) {
  let files = []
  /**
   * 判断给定的路径是否存在
   */
  if (fs.existsSync(url)) {
    /**
     * 返回文件和子目录的数组
     */
    files = fs.readdirSync(url)
    files.forEach(function(file, index) {
      const curPath = path.join(url, file)
      console.log(curPath)
      /**
       * fs.statSync同步读取文件夹文件，如果是文件夹，在重复触发函数
       */
      if (fs.statSync(curPath).isDirectory()) {
        // recurse
        delFile(curPath)
      } else {
        fs.unlinkSync(curPath)
      }
    })
    /**
     * 清除文件夹
     */
    fs.rmdirSync(url)
  } else {
    console.log('给定的路径不存在，请给出正确的路径')
  }
}

export default new Clone()
