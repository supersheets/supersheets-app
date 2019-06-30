<template>
  <div id="app">   
    <Navbar/>
    <router-view/>
    <Footer/>
  </div>
</template>

<script>
import { mapState, mapGetters, mapMutations, mapActions } from 'vuex'

import Navbar from '@/components/Navbar.vue'
import Footer from '@/components/Footer.vue'

export default {
  name: 'app',
  components: {
    Navbar,
    Footer
  }
}
</script>

<style lang="scss">  
nav.breadcrumb {
  margin: 1rem 0 0 0
}
</style>
