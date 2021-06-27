<template>
  <div id="app">
    <el-row :gutter="10">
      <el-col :span="3">
        <el-menu router default-active="2" class="el-menu-vertical-demo">
          <el-menu-item index="/">
            <i class="el-icon-menu"></i>
            <span slot="title">首页</span>
          </el-menu-item>
          <el-menu-item index="clone">
            <i class="el-icon-menu"></i>
            <span slot="title">网站克隆</span>
          </el-menu-item>
          <el-menu-item index="site">
            <i class="el-icon-menu"></i>
            <span slot="title">收录查询</span>
          </el-menu-item>
        </el-menu>
      </el-col>
      <el-col :span="18">
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
