<script setup lang="ts">
import { onMounted, ref } from 'vue'
import axios from 'axios'
import GameInputs from '@/components/GameInputs.vue'
import GameCanvas from '@/components/GameCanvas.vue'
import { useGlobalStore } from '@/stores/global'

var isGameRunning = ref(false)
const store = useGlobalStore()
let isGameReload = false
var gameGrid: any = null

function beginGame() {
  isGameRunning.value = true
  console.log('hi', isGameRunning.value)
}

const recoverGrid = async () => {
  try {
    const response = await axios.get('http://localhost:8080/game', {
      params: { roomId: store.roomId }
    })
    return response.data
  } catch (error) {
    console.error('Error:', error)
  }
}

const isReload = () => {
  console.log(store.roomId)
  var doesGameExist = false
  if (store.roomId != -1) {
    recoverGrid().then((grid) => {
      console.log('Grid:', grid)
      if (grid) {
        doesGameExist = true
        gameGrid = grid
      }
      if (doesGameExist) {
        isGameReload = true
        isGameRunning.value = true
      } else {
        isGameReload = false
        isGameRunning.value = false
        store.setRoomId(-1)
      }
    })
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
      <GameCanvas :isGameReload="isGameReload" :grid="gameGrid" />
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
