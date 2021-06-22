import puppeteer from 'puppeteer'
import { app } from 'electron'
const path = require('path')
const { Cluster } = require('puppeteer-cluster')

const launchOptions = {
  headless: true,
  executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  waitUntil: 'networkidle2',
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
    // '--proxy-server=http://127.0.0.1:8080'      // 配置代理
  ],
}

const clusterLanuchOptions = {
  concurrency: Cluster.CONCURRENCY_PAGE, // 单Chrome多tab模式
  maxConcurrency: 20, // 并发的workers数
  retryLimit: 2, // 重试次数
  skipDuplicateUrls: true, // 不爬重复的url
  monitor: true, // 显示性能消耗
  puppeteerOptions: launchOptions,
}

const crawler = async url => {
  // eslint-disable-next-line no-async-promise-executor
  return new Promise(async (resolve, reject) => {
    const browser = await puppeteer.launch(launchOptions)
    const page = await browser.newPage()
    await page.goto('https://baidu.com')

    const inputArea = await page.$('#kw')
    await inputArea.type(`site:${url}`)
    await page.click('#su')
    let body = {}
    // const imagePath = path.join(__static, `/static/screenshot/${url}.png`)
    // console.log('imagePath: ', imagePath)

    const imagePath = path.join(app.getPath('desktop'), `/screenshot/${url}.png`)
    console.log('imagePath: ', imagePath)

    try {
      await page.waitForSelector('#container', { timeout: 15000 })
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
        console.log('有收录结果', body)
      } else {
        body.title = []
        console.log('没有收录结果', body)
      }
      body.imagePath = imagePath
    } catch (error) {
      console.log('error', error)
      body.title = []
    }
    body.url = url
    await browser.close()
    resolve(body)
  })
}

// module.exports = { crawler }
// exports.crawler = crawler

export default crawler
