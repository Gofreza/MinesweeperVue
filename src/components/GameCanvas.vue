<script setup lang="ts">
import { useGlobalStore } from '@/stores/global'
import { onMounted } from 'vue'
import axios from 'axios'
const store = useGlobalStore()

const drawGrid = () => {
  console.log(store.rows, store.cols, store.cellSize)
  const canvas = document.getElementById('game-canvas') as HTMLCanvasElement
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  ctx.clearRect(0, 0, canvas.width, canvas.height)

  ctx.fillStyle = '#999999'
  ctx.fillRect(0, 0, store.cols * store.cellSize, store.rows * store.cellSize)

  for (let r = 0; r < store.rows; r++) {
    for (let c = 0; c < store.cols; c++) {
      const x = c * store.cellSize
      const y = r * store.cellSize

      ctx.strokeRect(x, y, store.cellSize, store.cellSize)
    }
  }
}

const getGridCoordinates = (clientX: number, clientY: number) => {
  const canvas = document.getElementById('game-canvas') as HTMLCanvasElement
  if (!canvas) return

  const rect = canvas.getBoundingClientRect()
  const x = clientX - rect.left
  const y = clientY - rect.top

  const col = Math.floor(x / store.cellSize)
  const row = Math.floor(y / store.cellSize)

  return { col, row }
}

const handleCanvasClick = async (event: MouseEvent): Promise<void> => {
  const { clientX, clientY } = event
  const coordinates = getGridCoordinates(clientX, clientY)
  if (coordinates) {
    console.log('Grid Coordinates:', coordinates)
    try {
      const response = await axios.post('http://localhost:8080/game/play', {
        row: coordinates.row,
        col: coordinates.col,
        roomId: store.roomId
      })
      console.log('Response:', response)
    } catch (error) {
      console.error('Error:', error)
    }
  }
}

onMounted(() => {
  drawGrid()
  const canvas = document.getElementById('game-canvas') as HTMLCanvasElement
  if (canvas) {
    canvas.addEventListener('click', handleCanvasClick)
  }
})
</script>

<template>
  <div>
    <canvas
      id="game-canvas"
      :width="store.cols * store.cellSize"
      :height="store.rows * store.cellSize"
    ></canvas>
  </div>
</template>
