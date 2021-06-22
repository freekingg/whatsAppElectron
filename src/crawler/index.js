import clusterMaster from './cluster_master'
import clusterWorker from './cluster_worker'

const cluster = require('cluster')

const crawler = async (url, win) => {
  let run
  if (cluster.isMaster) {
    run = clusterMaster
  } else {
    run = clusterWorker
  }
  try {
    await run(url, win)
  } catch (e) {
    // 追踪函数的调用轨迹
    console.trace(e)
  }
}

export default crawler
