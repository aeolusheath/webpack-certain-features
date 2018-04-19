<template>
  <div>
    dynamic component two
  </div>
</template>
<script>
import { omit } from 'lodash'
export default {
  mounted () {
    console.log(omit({
      name: 'dynamic-component-two',
      extraField: ''
    }, 'extraField'))
  }
}
</script>
