import { app, ipcMain } from 'electron'
const cluster = require('cluster')
const puppeteer = require('puppeteer')
const path = require('path')

// 禁止直接启动
if (cluster.isMaster) {
  console.log('--禁止直接启动--', cluster.worker.id)
  process.exit(0)
}

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

export default async (urls, win) => {
  const env = process.env.tasks
  let tasks = []
  if (/^\[.*\]$/.test(env)) {
    tasks = JSON.parse(env)
  }
  if (tasks.length === 0) {
    console.log('非法启动, 释放进程资源', tasks)
    process.exit(0)
  }
  console.log(`worker #${cluster.worker.id} PID:${process.pid} Start`)
  await tasks.reduce((sequence, url, idx) => {
    return sequence.then(() => {
      return doAnalyze(url, idx, win)
    })
  }, Promise.resolve())

  console.log(cluster.worker.id + ' 顺利完成')
  process.exit(0)
}

async function doAnalyze(url, i, win) {
  console.log('url', url)
  console.log('i', i)
  console.log('win', win)
  // try {
  //   const browser = await puppeteer.launch(launchOptions)
  //   const page = await browser.newPage()
  //   await page.goto('https://baidu.com')

  //   const inputArea = await page.$('#kw')
  //   await inputArea.type(`site:${url}`)
  //   await page.click('#su')
  //   let body = {}

  //   const imagePath = path.join(app.getPath('desktop'), `/screenshot/${url}.png`)
  //   console.log('imagePath: ', imagePath)

  //   try {
  //     await page.waitForSelector('#container', { timeout: 15000 })
  //     // content_none 判断是否有结果
  //     const contentNone = await page.$('.content_none')
  //     await page.screenshot({ path: imagePath })

  //     if (!contentNone) {
  //       body = await page.evaluate(() => {
  //         const titles = [...document.querySelectorAll('.new-pmd .t a')]
  //         return {
  //           title: titles.map(a => ({
  //             title: a.innerText,
  //           })),
  //         }
  //       })
  //       console.log('有收录结果', body)
  //     } else {
  //       body.title = []
  //       console.log('没有收录结果', body)
  //     }
  //     body.imagePath = imagePath
  //   } catch (error) {
  //     console.log('error', error)
  //     body.title = []
  //   }
  //   body.url = url
  //   await browser.close()
  // } catch (error) {
  //   console.log(cluster.worker.id, url, i)
  //   console.log(error)
  // }
}
