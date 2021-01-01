<template>
  <div id="app">
    <nav>
      <router-link to='/index'>首页</router-link>
      <router-link to='/detail'>详情页</router-link>
      <router-view></router-view>
    </nav>
  </div>
</template>

<script>

export default {
  name: 'App',
}
</script>


