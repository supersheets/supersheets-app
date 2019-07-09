<template>
<div class="notifications">
  <div :class="note.classObject" v-for="note of notifications" :key="note.uuid">
    <button class="delete" v-on:click="close(note.uuid)"></button>
    {{ note.message }}
  </div>
</div>
</template>

<script>
import { mapState, mapMutations, mapActions } from 'vuex'

export default {
  name: 'navbar',
  components: {
  },
  computed: mapState([
    'notifications'
  ]),
  data: () => {
    return { 
    }
  },
  methods: {
    ...mapMutations([
      'addNotification',
      'removeNotification'
    ]),
    ...mapActions([
      
    ]),
    async close(uuid) {
      this.removeNotification(uuid)
    },
  },
  async created() { 
    // this.addNotification({
    //   level: 'success',
    //   message: 'Hello World!'
    // })
  }
}
</script>

<style scoped>
/* adapted from https://codepen.io/kipp0/pen/pPNrrj */

.notification {
  visibility: hidden;
  position: fixed;
  max-width: 30rem;
  text-align: center;
  margin: auto;
  /* height: 4rem; */
  z-index: 1;
  left: 0;right:0;
  bottom: 30px;
  font-size: 17px;
}

.notification.show {
    visibility: visible;
    -webkit-animation: fadein 0.5s, expand 0.5s 0.5s,stay 3s 1s, shrink 0.5s 2s, fadeout 0.5s 2.5s;
    animation: fadein 0.5s, expand 0.5s 0.5s,stay 3s 1s, shrink 0.5s 4s, fadeout 0.5s 4.5s;
}

@-webkit-keyframes fadein {
    from {bottom: 0; opacity: 0;} 
    to {bottom: 30px; opacity: 1;}
}

@keyframes fadein {
    from {bottom: 0; opacity: 0;}
    to {bottom: 30px; opacity: 1;}
}

@-webkit-keyframes expand {
    from {min-width: 50px} 
    to {min-width: 350px}
}

@keyframes expand {
    from {min-width: 50px}
    to {min-width: 350px}
}
@-webkit-keyframes stay {
    from {min-width: 350px} 
    to {min-width: 350px}
}

@keyframes stay {
    from {min-width: 350px}
    to {min-width: 350px}
}
@-webkit-keyframes shrink {
    from {min-width: 350px;} 
    to {min-width: 50px;}
}

@keyframes shrink {
    from {min-width: 350px;} 
    to {min-width: 50px;}
}

@-webkit-keyframes fadeout {
    from {bottom: 30px; opacity: 1;} 
    to {bottom: 60px; opacity: 0;}
}

@keyframes fadeout {
    from {bottom: 30px; opacity: 1;}
    to {bottom: 60px; opacity: 0;}
}

</style>