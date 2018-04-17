import Vue from 'vue'
import Router from 'vue-router'
import PlainComponent from '@/components/PlainComponent'
import Index from '@/components/Index'
Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'index',
      component: Index
      // component: require('../components/Index').default
    },
    {
      path: '/plain-component',
      name: 'PlainComponent',
      component: PlainComponent
    },
    {
      path: '/dynamic-component',
      name: 'DynamicComponent',
      component: () => import(/* webpackChunkName: "DynamicComponent" */'../components/DynamicComponent')
    },
    {
      path: '/dynamic-component-two',
      name: 'DynamicComponentTwo',
      component: () => import(/* webpackChunkName: "DynamicComponentTwo" */'../components/DynamicComponentTwo')
    },
    {
      path: '/dynamic-component-three',
      name: 'DynamicComponentThree',
      component: () => import(/* webpackChunkName: "DynamicComponentThree" */'../components/DynamicComponentThree')
    }
  ]
})
