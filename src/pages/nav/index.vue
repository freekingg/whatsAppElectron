<template>
  <div id="wrapper1">
    <el-card class="card">
      <div class="part" v-for="(nav, index) in navs" :key="index">
        <h2 class="has_link ">
          <strong>{{ nav.title }}</strong>
        </h2>
        <div class="section">
          <div class="item" v-for="(item, index) in nav.list" :key="index">
            <a :href="item.link" target="_blank">
              <!-- <img src="https://image.uisdc.com/wp-content/uploads/2021/03/sdcnav-1-icon.png" alt="IconFont" /> -->
              <h3>{{ item.title }}</h3>
              <p>{{ item.info }}</p>
            </a>
          </div>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script>
import { ipcRenderer } from 'electron'
import list from './nav'

export default {
  data() {
    return {
      navs: list,
    }
  },
  created() {},
  methods: {
    // 查询
    submit() {
      this.$refs.searchForm.validate(valid => {
        if (valid) {
          this.searchUrlData = []
          this.loading = true
          this.hasError = false

          var oparray = []
          var res = this.searchForm.url
          res = res.replace(/^\n*/, '')
          res = res.replace(/\n{2,}/g, '\n')
          res = res.replace(/\n*$/, '')
          oparray = res.split('\n')

          const url = oparray
          this.urlCount = url.length
          console.log('url', url)

          ipcRenderer.send('site', url)
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
  },
}
</script>

<style lang="scss" scoped>
#wrapper1 {
  background-color: #f1f4f9 !important;
  height: 98vh;
  overflow: auto;
  >>> .card {
    margin: 16px;
    background-color: #f1f4f9 !important;
  }
  .el-card {
    background-color: #f1f4f9 !important;
  }
  .part {
    background: #fff;
    margin-bottom: 24px;
    border-radius: 10px;
  }
  .part h2 {
    padding: 13px 36px;
    border-bottom: 1px solid #f1f4f9;
    line-height: 16px;
  }
  .part h2 strong {
    color: #3c3c3c;
    font-size: 16px;
    position: relative;
  }
  .section {
    padding: 22px 15px;
    display: flex;
    flex-wrap: wrap;
  }
  .section .item {
    width: 20%;
  }
  .section .item a {
    display: block;
    width: 100%;
    padding: 6px 8%;
    box-sizing: border-box;
    transition: none;
    border-radius: 6px;
    text-decoration: none;
    transition: 0.3s;
    padding-left: 0;
  }
  .section .item h3 {
    margin-left: 32px;
    color: #3c3c3c;
    font-size: 14px;
    white-space: nowrap;
    height: 21px;
    line-height: 21px;
    margin-bottom: 4px;
    overflow: hidden;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
  }
  .section .item img {
    float: left;
    width: 26px;
    height: 26px;
    border-radius: 100%;
    display: none;
  }
  .section .item p {
    margin-left: 32px;
    color: #8f8f8f;
    font-size: 12px;
    height: 3em;
    line-height: 1.5em;
    overflow: hidden;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
  }
}
</style>
