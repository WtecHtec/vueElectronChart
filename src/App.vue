<template>
  <div id="app">
    <router-view/>
  </div>
</template>

<script>
  export default {
    name: 'app',
    mounted() {
      console.log('nim-web', this.$store.getters.getNimWeb)
      if (!this.$store.getters.getNimWeb) {
        this.$alert('登陆已失效，请重新登陆！', '提示', {
          confirmButtonText: '确定',
          callback: action => {
            this.$router.push({name: 'Login'})
          }
        })
      }
    }
  }
</script>

<style>
  #app {
    font-family: 'Avenir', Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-align: center;
    color: #2c3e50;
    height: 100%;
  }
  #app img {
    width: 200px;
    height: 200px;
  }

  div::-webkit-scrollbar{
    width:10px;
    height:10px;
    /**/
  }
  div::-webkit-scrollbar-track{
    background: rgb(239, 239, 239);
    border-radius:2px;
  }
  div::-webkit-scrollbar-thumb{
    background: #bfbfbf;
    border-radius:10px;
  }

  div::-webkit-scrollbar-corner{
    background: #179a16;
  }
</style>
