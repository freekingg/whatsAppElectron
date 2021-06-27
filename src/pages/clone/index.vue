<template>
  <el-card class="card">
    <el-form
      class="search-form"
      :inline="true"
      label-position="left"
      ref="searchForm"
      :model="searchForm"
      :rules="rules"
    >
      <el-form-item prop="url">
        <el-input v-model="searchForm.url" placeholder="请输入需要克隆网址" clearable></el-input>
      </el-form-item>
      <el-form-item>
        <el-button @click="submit" type="primary" :loading="loading">{{ loading ? '克隆中' : '克隆' }}</el-button>
      </el-form-item>
    </el-form>

    <el-alert class="log" :title="log" type="warning" :closable="false"> </el-alert>

    <el-timeline>
      <el-timeline-item placement="top" v-for="(item, index) in cards" :key="index">
        <el-card>
          <h4>{{ item.title }}</h4>
          <p>{{ item.content }}</p>
        </el-card>
      </el-timeline-item>
    </el-timeline>
  </el-card>
</template>

<script>
import { ipcRenderer } from 'electron'
export default {
  data() {
    const checkUrl = (rule, value, callback) => {
      if (!value) {
        return callback(new Error('内容不能为空'))
      }

      // eslint-disable-next-line no-useless-escape
      const reg = /^([hH][tT]{2}[pP]:\/\/|[hH][tT]{2}[pP][sS]:\/\/)(([A-Za-z0-9-~]+)\.)+([A-Za-z0-9-~\/])+$/
      if (!reg.test(value)) {
        return callback(new Error('网址格式不正确'))
      }
      callback()
    }

    return {
      loading: false,
      searchForm: {
        url: '',
      },
      proxy: false,
      ipsForm: {
        ips: '',
      },
      rules: {
        url: [{ validator: checkUrl, trigger: 'blur' }],
      },
      cards: [],
      tableData: [],
      log: '提示 -- 暂无日志',
    }
  },
  created() {
    // 监听检测结果
    ipcRenderer.on('clone-send-message-to-renderer', (event, data) => {})

    // 监听任务完成
    ipcRenderer.on('clone-all-finish', () => {
      this.loading = false
      this.$message('所有任务已完成')
      this.log = '所有任务已完成'

      if (this.hasError) {
        const errUrls = this.searchUrlData.filter(item => {
          return item.error
        })
        this.errorUrlData = errUrls
      }
    })

    // 监听错误
    ipcRenderer.on('clone-error', (event, data) => {
      this.$message.error(data)
    })

    // 监听日志
    ipcRenderer.on('clone-log', (event, data) => {
      this.log = data
    })
    ipcRenderer.on('clone-main-log', (event, data) => {
      this.cards.push(data)
    })
  },
  methods: {
    handleOpen(key, keyPath) {
      console.log(key, keyPath)
    },
    handleClose(key, keyPath) {
      console.log(key, keyPath)
    },

    // 查询
    submit() {
      this.$refs.searchForm.validate(valid => {
        if (valid) {
          this.cards = []
          this.loading = true
          ipcRenderer.send('clone', this.searchForm.url)
          return true
        }
        console.log('error submit!!')
        return false
      })
    },
  },
}
</script>

<style lang="scss" scoped>
.card {
  margin: 16px;
}

.el-timeline {
  padding-left: 0;
}

.log {
  margin-top: 10px;
  margin-bottom: 10px;
}
.el-form-item__content {
  width: 100%;
}
</style>
