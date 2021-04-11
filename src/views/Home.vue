<template>
  <div>
    <Header></Header>
    <router-view></router-view>
  </div>
</template>

<script>

// @ is an alias to /src
import Header from '@/components/Header.vue'
import '@/assets/base.css'

export default {
  components: {
    Header
  }
}
</script>
