<template>
  <div>
    {{text}}
    <AsyncComponent></AsyncComponent>
  </div>
</template>
<script>
  import { omit } from 'lodash'
  export default {
    components: {
      'AsyncComponent': () => import(/* webpackChunkName: "asyncccccccccccccccccc" */'./AsyncComponent')
    },
    data () {
      return {
        text: 'this is a component be dynamic imported in the router(watch the router/index.js)'
      }
    },
    mounted () {
      console.log(omit({
        name: 'dynamic-component-one',
        extraField: ''
      }, 'extraField'))
    }
  }
</script>