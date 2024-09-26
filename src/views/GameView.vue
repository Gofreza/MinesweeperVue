<script setup lang="ts">
import { ref } from 'vue'
import GameInputs from '@/components/GameInputs.vue'
import GameCanvas from '@/components/GameCanvas.vue'

var isGameRunning = ref(false)

function beginGame() {
  isGameRunning.value = true
  console.log('hi', isGameRunning.value)
}
</script>

<template>
  <main class="main">
    <div v-if="!isGameRunning">
      <GameInputs @begin-game="beginGame" />
    </div>
    <div v-else>
      <GameCanvas/>
    </div>
  </main>
</template>

<style scoped>
.main {
  width: 100%;
  height: 100vh;
  background-color: var(--color-menu);
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 10px 10px 0 0;
}
</style>
