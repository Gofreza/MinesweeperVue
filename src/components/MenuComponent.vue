<script setup lang="ts">
import { onMounted } from 'vue'
import { useGlobalStore } from '@/stores/global'

const store = useGlobalStore()

function toggleTheme() {
  store.isDarkTheme = !store.isDarkTheme
  if (store.isDarkTheme) {
    document.body.classList.add('dark-theme')
    document.body.classList.remove('white-theme')
  } else {
    document.body.classList.add('white-theme')
    document.body.classList.remove('dark-theme')
  }
}

onMounted(() => {
  // Set initial theme based on system preference
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    store.isDarkTheme = true
    document.body.classList.add('dark-theme')
  } else {
    store.isDarkTheme = false
    document.body.classList.add('white-theme')
  }
})
</script>

<template>
  <div id="menu" class="menu">
    <slot name="title">Vue 3 Multisweeper</slot>
    <nav>
      <router-link to="/">Home</router-link> | <router-link to="/about">About</router-link> |
      <button @click="toggleTheme">Toggle Theme</button>
    </nav>
  </div>
</template>

<style scoped>
.menu {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
  background-color: var(--color-menu);
  color: var(--color-text);
  font-size: 20px;
  height: 60px;
  width: 100%;
  box-sizing: border-box;
}
</style>
