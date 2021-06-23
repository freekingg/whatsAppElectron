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
        <el-input
          v-model="searchForm.url"
          :autosize="{ minRows: 2, maxRows: 5 }"
          type="textarea"
          placeholder="请输入查询网址,多网址换行，一行一个"
          clearable
        ></el-input>
      </el-form-item>
      <el-form-item>
        <el-button @click="submit" type="primary" :loading="loading">{{ loading ? '查询中' : '查询' }}</el-button>
        <el-checkbox class="proxy" @change="changeChange" v-model="proxy">使用代理</el-checkbox>
      </el-form-item>
    </el-form>

    <el-form
      v-if="proxy"
      class="search-form proxy-form"
      :inline="true"
      label-position="left"
      ref="ipsForm"
      :model="ipsForm"
      :rules="rules"
    >
      <el-form-item prop="ips">
        <el-popover placement="top-start" title="请按以下json格式添加" trigger="hover">
          <pre>
[
  {
      "ip": "58.218.201.122",
      "port": 3481
  },{
      "ip": "58.218.201.122",
      "port": 3481
  }
]
</pre
          >
          <el-input
            slot="reference"
            v-model="ipsForm.ips"
            :autosize="{ minRows: 2, maxRows: 5 }"
            type="textarea"
            clearable
          ></el-input>
        </el-popover>
      </el-form-item>
      <el-form-item>
        <el-button @click="submitIps" type="primary" :loading="loading">添加代理ip</el-button>
      </el-form-item>
    </el-form>

    <el-alert class="log" :title="log" type="warning" :closable="false"> </el-alert>

    <el-button class="exportExcel" @click="exportExcel" :disabled="loading" v-if="!loading">导出</el-button>
    <br />
    <el-table id="out-table" :data="searchUrlData" border style="width: 100%">
      <el-table-column type="index" width="80"> </el-table-column>
      <el-table-column prop="url" label="域名" width="180">
        <template slot-scope="scope">
          <span>{{ scope.row.url }}</span>
          <el-tag v-if="scope.row.error" type="danger">检测出错</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="include" label="是否收录" width="180"> </el-table-column>
      <el-table-column prop="title" label="收录标题"> </el-table-column>
      <el-table-column prop="imagePath" label="缩略图">
        <template slot-scope="scope">
          <el-image
            v-if="scope.row.imagePath"
            style="width: 100px; height: 100px"
            :src="scope.row.imagePath"
            :preview-src-list="[scope.row.imagePath]"
          >
          </el-image>
        </template>
      </el-table-column>
    </el-table>
  </el-card>
</template>

<script>
import { ipcRenderer } from 'electron'
import FileSaver from 'file-saver'
import XLSX from 'xlsx'
export default {
  data() {
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
        url: [{ required: true, message: '请输入内容', trigger: 'blur' }],
        ips: [{ required: true, message: '请输入内容', trigger: 'blur' }],
      },
      searchUrlData: [],
      log: '提示 -- 确认电脑已经安装chrome浏览器：C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    }
  },
  created() {
    // 监听检测结果
    ipcRenderer.on('send-message-to-renderer', (event, data) => {
      const item = JSON.parse(JSON.stringify(data))
      console.log('item: ', item)
      if (item.title.length) {
        item.title = item.title[0].title
        item.include = '是'
      } else {
        item.include = '否'
      }
      this.searchUrlData.push(item)
      if (this.searchUrlData.length === this.urlCount) {
        this.loading = false
      }
    })

    // 监听任务完成
    ipcRenderer.on('all-finish', (event, data) => {
      this.loading = false
      this.$message('所有任务已完成')
      this.log = '所有任务已完成'
    })

    // 监听错误
    ipcRenderer.on('error', (event, data) => {
      this.$message.error(data)
    })

    // 监听日志
    ipcRenderer.on('log', (event, data) => {
      this.log = data
    })
  },
  methods: {
    // 查询
    submit() {
      this.$refs.searchForm.validate(valid => {
        if (valid) {
          this.searchUrlData = []
          this.loading = true

          var oparray = []
          var res = this.searchForm.url
          res = res.replace(/^\n*/, '')
          res = res.replace(/\n{2,}/g, '\n')
          res = res.replace(/\n*$/, '')
          oparray = res.split('\n')

          const url = oparray
          this.urlCount = url.length
          console.log('url', url)

          ipcRenderer.send('crawler', url)
          return true
        }
        console.log('error submit!!')
        return false
      })
    },
    // 代理开关
    changeChange(e) {
      if (!e) {
        this.ipsForm.ips = ''
        ipcRenderer.send('addIps', [])
      }
    },
    // 代理ip提交
    submitIps() {
      this.$refs.ipsForm.validate(valid => {
        if (valid) {
          console.log('this.ipsForm.ips', this.ipsForm.ips)
          try {
            const ips = JSON.parse(this.ipsForm.ips)
            ipcRenderer.send('addIps', ips)
            this.$message('添加成功')
          } catch (error) {
            console.log(error)
            this.$message.error('代理ip格式不正确')
          }
          // console.log('ips', ips)
          //

          return true
        }
        console.log('error submit!!')
        return false
      })
    },
    // 导出表格
    exportExcel() {
      if (!this.searchUrlData.length) return
      // 定义导出Excel表格事件
      /* 从表生成工作簿对象 */
      var wb = XLSX.utils.table_to_book(document.querySelector('#out-table'))
      /* 获取二进制字符串作为输出 */
      var wbout = XLSX.write(wb, {
        bookType: 'xlsx',
        bookSST: true,
        type: 'array',
      })
      try {
        FileSaver.saveAs(
          // Blob 对象表示一个不可变、原始数据的类文件对象。
          // Blob 表示的不一定是JavaScript原生格式的数据。
          // File 接口基于Blob，继承了 blob 的功能并将其扩展使其支持用户系统上的文件。
          // 返回一个新创建的 Blob 对象，其内容由参数中给定的数组串联组成。
          new Blob([wbout], { type: 'application/octet-stream' }),
          // 设置导出文件名称
          'sheetjs.xlsx',
        )
      } catch (e) {
        if (typeof console !== 'undefined') console.log(e, wbout)
      }
      return wbout
    },
  },
}
</script>

<style>
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}
#wrapper {
  min-height: 100vh;
  padding: 20px;
  width: 100vw;
}
.card {
  margin: 16px;
}
#logo {
  height: auto;
  margin-bottom: 20px;
  width: 420px;
}
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}
#wrapper {
  min-height: 100vh;
  padding: 20px;
  width: 100vw;
}
.card {
  margin: 16px;
}
#logo {
  height: auto;
  margin-bottom: 20px;
  width: 420px;
}
.exportExcel {
  margin-bottom: 6px;
}
.el-form-item {
  width: 300px;
}
.log {
  margin-bottom: 20px;
}
.el-form-item__content {
  width: 100%;
}
.proxy {
  margin-left: 10px;
}
</style>
