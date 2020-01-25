<template>
  <div id="user-template">   
    <Navbar/>
    <router-view/>
    <Notifications/>
    <Footer/>
  </div>
</template>

<script>
import Navbar from '@/components/Navbar.vue'
import Footer from '@/components/Footer.vue'
import Notifications from '@/components/Notifications.vue'

export default {
  name: 'user-template',
  components: {
    Navbar,
    Footer,
    Notifications
  }
}
</script>