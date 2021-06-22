import { app, ipcMain } from 'electron'
const cluster = require('cluster')
const numCPUs = require('os').cpus().length
console.log('cpu内核:', numCPUs)
console.log('getPath:', app.getPath('desktop'))

// 处理的任务列表
// const arr = [
//   'http://myoungxue.top',
//   'https://github.com/Wangszzju',
//   'http://www.hacke2.cn',
//   'https://github.com/enochjs',
//   'https://i.jakeyu.top',
//   'http://muyunyun.cn',
// ]

export default async (url, win) => {
  // 每个 CPU 分配 N 个任务
  const n = Math.floor(url.length / numCPUs)
  // 未分配的余数
  const remainder = url.length % numCPUs

  for (let i = 1; i <= numCPUs; i += 1) {
    const tasks = url.splice(0, n + (i > remainder ? 0 : 1))
    // 将任务编号传递到 Cluster 内启动
    cluster.fork({ tasks: JSON.stringify(tasks) })
  }
  cluster.on('exit', worker => {
    console.log(`worker #${worker.id} PID:${worker.process.pid} 已退出`)
  })
  cluster.on('error', err => {
    console.log(`worker #${worker.id} PID ERROR: `, err)
  })
}
