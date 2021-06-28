<template>
  <div id="app">
    <el-row>
      <el-col :span="3">
        <el-menu
          background-color="#545c64"
          text-color="#fff"
          active-text-color="#ffd04b"
          router
          default-active="nav"
          class="el-menu-vertical-demo"
        >
          <el-menu-item index="nav">
            <i class="el-icon-menu"></i>
            <span slot="title">首页</span>
          </el-menu-item>
          <el-menu-item index="site">
            <i class="el-icon-menu"></i>
            <span slot="title">收录查询</span>
          </el-menu-item>
          <el-menu-item index="clone">
            <i class="el-icon-menu"></i>
            <span slot="title">网站克隆</span>
          </el-menu-item>
          <el-menu-item index="nav">
            <i class="el-icon-menu"></i>
            <span slot="title">站长导航</span>
          </el-menu-item>
        </el-menu>
      </el-col>
      <el-col :span="21">
        <keep-alive>
          <router-view></router-view>
        </keep-alive>
      </el-col>
    </el-row>
  </div>
</template>

<script>
export default {
  name: 'freeking-site',
}
</script>
<style>
.el-menu {
  box-sizing: border-box;
  height: 98vh;
}
</style>
