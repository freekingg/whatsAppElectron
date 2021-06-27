import { time } from 'console'
import { app, ipcMain } from 'electron'
import path from 'path'
import { Cluster } from 'puppeteer-cluster'

import checkIp from './checkIp'
const useProxy = require('puppeteer-page-proxy')

let ips = []
let status = ''

ipcMain.on('addIps', async (event, data) => {
  if (Object.prototype.toString.call(data) === '[object Array]') {
    ips = data
  }
})

const launchOptions = {
  headless: true,
  executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  ignoreHTTPSErrors: true, // 忽略证书错误
  args: [
    '--disable-gpu',
    '--disable-dev-shm-usage',
    '--disable-web-security',
    '--disable-xss-auditor', // 关闭 XSS Auditor
    '--no-zygote',
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--allow-running-insecure-content', // 允许不安全内容
    '--disable-webgl',
    '--disable-popup-blocking',
    '--disable-infobars',
    // `--proxy-server=${newProxyUrl}`, // 配置代理
    // `--proxy-server=180.109.144.18:4254`, // 配置代理
  ],
}

const clusterLanuchOptions = {
  concurrency: Cluster.CONCURRENCY_CONTEXT,
  maxConcurrency: 6, // 并发的workers数
  retryLimit: 2, // 重试次数
  skipDuplicateUrls: true, // 不爬重复的url
  monitor: false, // 显示性能消耗
  puppeteerOptions: launchOptions,
}

const getIp = async (ips, win) => {
  // eslint-disable-next-line no-async-promise-executor
  return new Promise(async resolve => {
    if (ips.length === 0) {
      resolve('noProxy')
      return
    }
    // 随机数下标
    const randomNo = Math.floor(Math.random() * ips.length)
    const current = ips[randomNo]

    const enabled = await checkIp(current)
    if (!enabled) {
      ips.splice(randomNo, 1)
      if (!ips.length || status) {
        win.webContents.send('site-log', `没有任何可以使用的代理ip`)
        resolve('noProxy')
        return
      }
      getIp(ips, win)
      win.webContents.send('site-log', `代理ip: ${current.ip} 不可用 - 继续检测其它代理ip`)
    } else {
      console.log('检测到当前可用ip', current)
      resolve(current)
    }
  })
}

const crawler = async (urls, event, win) => {
  const cluster = await Cluster.launch(clusterLanuchOptions)

  await cluster.task(async ({ page, data: url }) => {
    // await page.setUserAgent(
    //   'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.97 Safari/537.36',
    // )

    const proxy = await getIp(ips, win)
    if (proxy !== 'noProxy') {
      await useProxy(page, `http://${proxy.ip}:${proxy.port}`)
      useProxy.lookup(page).then(data => {
        console.log('当前使用ip', data)
        win.webContents.send('site-log', `当前使用ip-${data.ip}`)
      })
    }

    // 随机数下标
    const times = [1000, 2000, 3000, 4000]
    const randomNo = Math.floor(Math.random() * times.length)
    const currentTime = times[randomNo]
    await page.waitForTimeout(currentTime)

    try {
      await page.goto('https://baidu.com', { timeout: 15000 })
    } catch (error) {
      console.log('打开网页出错', url, error)
      win.webContents.send('site-error', `打开网页出错-${url},请检测网络或者重试`)
      win.webContents.send('site-log', `打开网页出错-${url},请检测网络或者重试`)

      event.reply('site-send-message-to-renderer', {
        title: '',
        url,
        error: true,
      })
    }
    const inputArea = await page.$('#kw')
    await inputArea.type(`site:${url}`, 5000)
    await page.click('#su')

    win.webContents.send('site-log', `检测地址-${url}`)

    let body = {}
    const imagePath = path.join(app.getPath('desktop'), `/screenshot/${url}.png`)
    try {
      await page.waitForSelector('#container', { timeout: 10000 })
      // content_none 判断是否有结果
      const contentNone = await page.$('.content_none')
      await page.screenshot({ path: imagePath })

      if (!contentNone) {
        body = await page.evaluate(() => {
          const titles = [...document.querySelectorAll('.new-pmd .t a')]
          return {
            title: titles.map(a => ({
              title: a.innerText,
            })),
          }
        })
        // 有收录结果
      } else {
        body.title = []
        // 没有收录结果
      }
      body.imagePath = imagePath
      body.url = url
      body.error = false
      event.reply('site-send-message-to-renderer', body)
    } catch (error) {
      console.log('error', error)
      win.webContents.send('site-log', `打开网页出错-${url}`)
      body.title = []
      body.url = url
      body.error = true
      event.reply('site-send-message-to-renderer', body)
    }
  })

  // 队列执行任务
  for (const iterator of urls) {
    cluster.queue(iterator)
  }

  await cluster.idle()
  await cluster.close().then(res => {
    console.log('全部完成,关闭')
    status = 'all-finish'
    win.webContents.send('site-all-finish', true)
  })
}

export default crawler
