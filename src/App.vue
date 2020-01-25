<template>
  <div id="app">   
    <router-view/>
  </div>
</template>

<style lang="scss">  
nav.breadcrumb {
  margin: 1rem 0 0 0
}

/* 
 * Used to override Bulma's code styles 
 * which conflicts with Prism.js code highlighting
 */
.content .token.tag, .content .token.number {
  display: inline;
  padding: inherit;
  font-size: inherit;
  line-height: inherit;
  text-align: inherit;
  vertical-align: inherit;
  border-radius: inherit;
  font-weight: inherit;
  white-space: inherit;
  background: inherit;
  margin: inherit;
}
pre[class*="language-"].content {
  margin: 0
}
</style>
