<script setup lang="ts">
import { onMounted, ref } from 'vue'
import GameInputs from '@/components/GameInputs.vue'
import GameCanvas from '@/components/GameCanvas.vue'
import { useGlobalStore } from '@/stores/global'

var isGameRunning = ref(false)
const store = useGlobalStore()
let isGameReload = false

function beginGame() {
  isGameRunning.value = true
  console.log('hi', isGameRunning.value)
}

const isReload = () => {
  console.log(store.roomId)
  
  if(store.roomId != -1){
    isGameReload = true
    isGameRunning.value = true
  }
}

onMounted(() => {
  isReload()
})
</script>

<template>
  <main class="main">
    <div v-if="!isGameRunning">
      <GameInputs @begin-game="beginGame" />
    </div>
    <div v-else>
      <GameCanvas :isGameReload="isGameReload" />
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
