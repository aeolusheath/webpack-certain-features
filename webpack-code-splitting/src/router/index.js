import Vue from 'vue'
import Router from 'vue-router'
import PlainComponent from '@/components/PlainComponent'
Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'Hello',
      component: PlainComponent
    },
    {
      path: '/dynamic-component',
      name: 'DynamicComponent',
      component: () => import(/* webpackChunkName: "DynamicComponent" */'../components/DynamicComponent')
    }
  ]
})
