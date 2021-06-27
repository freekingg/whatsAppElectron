import Vue from 'vue'
import Router from 'vue-router'

import index from '@/pages/index'
import clone from '@/pages/clone'
import site from '@/pages/site'
Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'index',
      component: index,
    },
    {
      path: '/clone',
      name: 'clone',
      component: clone,
    },
    {
      path: '/site',
      name: 'site',
      component: site,
    },
    {
      path: '*',
      redirect: '/',
    },
  ],
})
