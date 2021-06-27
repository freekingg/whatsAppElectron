const puppeteer = require('puppeteer')
const { URL } = require('url')
const path = require('path')

const clone = async (link, win) => {
  return new Promise(async resolve => {
    const browser = await puppeteer.launch({
      executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
      ignoreHTTPSErrors: true,
      headless: true,
    })
    const page = await browser.newPage()
    await page.setViewport({
      width: 1920,
      height: 1080,
    })

    const downLoadUrlList = []
    const originUrlList = []

    await page.on('request', response => {
      // 获取文件的后缀名
      const { pathname, origin, host } = new URL(response.url())
      const extname = path.extname(pathname)
      if (origin && host) {
        // originUrlList.push(`//${host}`)
        originUrlList.push(origin)
        // originUrlList.push(host)
      }
      const extnames = [
        '.js',
        '.css',
        '.jpg',
        '.jpeg',
        '.jpg',
        '.png',
        '.gif',
        '.ico',
        '.woff',
        '.html',
        '.htm',
        '.json',
        '.svg',
        '.mp4',
        '.webp',
        '.obj',
        '.php',
      ]
      if (extnames.includes(extname)) {
        downLoadUrlList.push(response.url())
        win.webContents.send('clone-log', `获取资源-${response.url()}`)
      }
    })

    try {
      await page.goto(link, {
        waitUntil: 'load',
      })
    } catch (error) {
      await browser.close()
      win.webContents.send('clone-log', `网址打开失败，请重试`)
      win.webContents.send('clone-all-finish', true)
    }

    const timer = await page.evaluate(() => {
      let totalHeight = 0
      const distance = 100
      const scrollHeight = document.body.scrollHeight
      const timer = setInterval(() => {
        window.scrollBy(0, distance)
        totalHeight += distance

        if (totalHeight >= scrollHeight) {
          clearInterval(timer)
        }
      }, 100)
      return scrollHeight / 100
    })

    await page.waitForTimeout((timer / 10) * 1000 + 3000)

    const html = await page.evaluate(() => {
      const html = document.querySelector('html')
      return html.innerHTML
    })

    const unique = Array.from(new Set(originUrlList))
    await browser.close()
    win.webContents.send('clone-log', `获取资源完成,共获取到 【${downLoadUrlList.length}】条待下载资源`)
    win.webContents.send('clone-main-log', {
      title: '获取资源完成',
      content: `共获取到 【${downLoadUrlList.length}】条待下载资源`,
    })
    resolve({ url: downLoadUrlList, html, origin: unique })
  })
}
export default clone
