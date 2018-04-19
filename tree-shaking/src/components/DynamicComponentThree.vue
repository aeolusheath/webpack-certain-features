<template>
  <div>
    dynamic component three
  </div>
</template>
<script>
import { omit } from 'lodash'
export default {
  mounted () {
    console.log(omit({
      name: 'dynamic-component-three',
      extraField: ''
    }, 'extraField'))
  }
}
</script>
