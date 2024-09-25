<script setup lang="ts"></script>

<template>
  <div class="home-container">
    <router-link to="/solo" class="home-button">Solo</router-link>
    <router-link to="/multi" class="home-button">Multi</router-link>
  </div>
</template>

<style scoped>
.home-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 50px;
}

.home-button {
  width: 150px;
  margin: 10px;
  padding: 10px 20px;
  font-size: 16px;
  cursor: pointer;
  background-color: var(--color-menu);
  color: var(--color-text);
  text-align: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.home-button:hover {
  background-color: var(--color-menu-hover);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}
</style>
