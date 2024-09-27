<script setup lang="ts">
import axios from 'axios'
import { useGlobalStore } from '@/stores/global'

const store = useGlobalStore()

let col = store.cols
let row = store.rows
var isMultiplayer = false
var difficulties = ['EASY', 'MEDIUM', 'HARD', 'VERYHARD']
var difficulty = 'EASY'

const emit = defineEmits(['begin-game'])

async function sendInputs() {
  try {
    console.log('D:', difficulty)
    const payload = {
      rows: row,
      cols: col,
      difficulty: difficulty,
      isMultiplayer: isMultiplayer,
      username: store.username
    }
    console.log('Payload:', payload)
    const response = await axios.post('http://localhost:8080/game/new', payload)
    console.log('Response:', response.data)
    store.setRoomId(response.data.roomId)
    store.setRows(row)
    store.setCols(col)
    emit('begin-game')
  } catch (error) {
    console.error('Error:', error)
  }
}
</script>

<template>
  <div id="input-container" class="input-container">
    <div class="inputs">
      <label for="col">Columns:</label>
      <input id="col" type="number" v-model="col" />
      <label for="row">Rows:</label>
      <input id="row" type="number" v-model="row" />
    </div>

    <div>
      <label for="difficulties">Difficulty:</label>
      <select id="difficulties" v-model="difficulty">
        <option v-for="difficulty in difficulties" :key="difficulty" :value="difficulty">
          {{ difficulty }}
        </option>
      </select>
    </div>

    <div>
      <label for="multiplayer">Multiplayer:</label>
      <input
        id="multiplayer"
        type="checkbox"
        v-model="isMultiplayer"
        @change="console.log(isMultiplayer)"
      />
    </div>

    <button @click="sendInputs">Click me</button>
  </div>
</template>

<style scoped>
.input-container {
  display: inline-block;
  justify-content: center;
  flex-direction: column;
  align-items: center;
  background-color: var(--color-background);
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.inputs {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

label {
  margin-right: 10px;
  font-weight: bold;
  color: var(--color-text);
}

input[type='number'] {
  width: 60px;
  padding: 5px;
  border: 1px solid var(--color-border);
  border-radius: 5px;
}

select {
  margin-bottom: 20px;
  padding: 5px;
  border: 1px solid var(--color-border);
  border-radius: 5px;
}

input[type='checkbox'] {
  margin-bottom: 20px;
}

button {
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  background-color: var(--color-background-mute);
  color: var(--color-text);
  cursor: pointer;
}

button:hover {
  background-color: var(--color-background-soft);
}
</style>
