<script setup lang="ts">
import { useGlobalStore } from '@/stores/global'
import { onMounted, ref } from 'vue'
import GameEnding from '@/components/GameEnding.vue'
import axios from 'axios'

const props = defineProps<{
  isGameReload: boolean
}>()

const store = useGlobalStore()
var canvas: any = ref(null)
var isGameEnding = ref(false)

const drawGrid = () => {
  if (!canvas.value) return
  const ctx = canvas.value.getContext('2d')
  if (!ctx) return

  ctx.clearRect(0, 0, canvas.value.width, canvas.value.height)

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
  if (!canvas.value) return

  const rect = canvas.value.getBoundingClientRect()
  const x = clientX - rect.left
  const y = clientY - rect.top

  const col = Math.floor(x / store.cellSize)
  const row = Math.floor(y / store.cellSize)

  return { col, row }
}

const handleCanvasLeftClick = async (event: MouseEvent): Promise<void> => {
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
      handleGameUpdate(response.data)
    } catch (error) {
      console.error('Error:', error)
    }
  }
}

const handleCanvasRightClick = async (event: MouseEvent): Promise<void> => {
  event.preventDefault()
  const { clientX, clientY } = event
  const coordinates = getGridCoordinates(clientX, clientY)
  if (coordinates) {
    console.log('Grid Coordinates:', coordinates)
    try {
      const response = await axios.post('http://localhost:8080/game/flag', {
        row: coordinates.row,
        col: coordinates.col,
        roomId: store.roomId
      })
      handleGameUpdate(response.data)
    } catch (error) {
      console.error('Error:', error)
    }
  }
}

const drawBomb = (ctx: any, x: number, y: number, radius: number, offset: number) => {
  // Draw a black circle for bombs
  ctx.fillStyle = 'black' // Set the fill color to red
  ctx.beginPath()
  //ctx.arc(col * cellSize + cellSize / 2, row * cellSize + cellSize / 2, cellSize / 2.5, 0, 2 * Math.PI);
  ctx.arc(x, y, radius, 0, 2 * Math.PI)
  ctx.fill()
  ctx.closePath()

  ctx.lineWidth = 4
  // Draw the vertical line
  ctx.beginPath()
  ctx.moveTo(x, y - radius - offset)
  ctx.lineTo(x, y + radius + offset)
  ctx.stroke()
  ctx.closePath()

  // Draw the horizontal line
  ctx.beginPath()
  ctx.moveTo(x - radius - offset, y)
  ctx.lineTo(x + radius + offset, y)
  ctx.stroke()
  ctx.closePath()

  // Draw diagonal lines
  ctx.beginPath()
  ctx.moveTo(x - radius / 1.5 - offset, y - radius / 1.5 - offset)
  ctx.lineTo(x + radius / 1.5 + offset, y + radius / 1.5 + offset)
  ctx.stroke()
  ctx.closePath()

  //Draw diagonal lines
  ctx.beginPath()
  ctx.moveTo(x + radius / 1.5 + offset, y - radius / 1.5 - offset)
  ctx.lineTo(x - radius / 1.5 - offset, y + radius / 1.5 + offset)
  ctx.stroke()
  ctx.closePath()

  ctx.lineWidth = 1

  // Draw a grey gradient circle for bombs
  const gradient = ctx.createLinearGradient(x - radius, y - radius, x + radius / 2, y + radius / 2)
  gradient.addColorStop(0, 'grey') // Starting color at the top left
  gradient.addColorStop(1, 'black') // Ending color at the middle bottom right
  ctx.fillStyle = gradient
  ctx.beginPath()
  ctx.arc(x, y, radius - 2, 0, 2 * Math.PI)
  ctx.fill()
  ctx.closePath()

  // Draw a black little circle
  ctx.fillStyle = 'black' // Set the fill color to red
  ctx.beginPath()
  //ctx.arc(col * cellSize + cellSize / 2, row * cellSize + cellSize / 2, cellSize / 2.5, 0, 2 * Math.PI);
  ctx.arc(x, y, radius / 4, 0, 2 * Math.PI)
  ctx.fill()
  ctx.closePath()
}

const redrawGrid = (data: any, cellSize: number, isFinished: boolean = false) => {
  if (!canvas.value) return
  const ctx = canvas.value.getContext('2d')
  if (!ctx) return

  ctx.strokeStyle = '#000000'
  ctx.lineWidth = 1

  data.forEach((element: any) => {
    console.log("El:", element)
    const x = element.col * cellSize
    const y = element.row * cellSize

    if (element.cell.flagged) {
      // Set the background color
      ctx.fillStyle = '#888888'
      ctx.fillRect(x, y, cellSize, cellSize)

      // Draw a red square
      ctx.fillStyle = '#ff0000'
      ctx.fillRect(
        element.col * cellSize + cellSize / 4,
        element.row * cellSize + cellSize / 4,
        cellSize / 2,
        cellSize / 2
      ) // Draw a flag
    } else {
      // Draw the background
      if (isFinished && !element.cell.visible && !element.cell.bomb)
        ctx.fillStyle = '#999999'
      else
        ctx.fillStyle = '#f9f8f5'
      ctx.fillRect(x, y, cellSize, cellSize)

      // Determine the text color
      let textColor = '#000000'
      if (element.cell.bombAround === 1) {
        textColor = 'blue'
      } else if (element.cell.bombAround === 2) {
        textColor = 'green'
      } else if (element.cell.bombAround === 3) {
        textColor = 'red'
      } else if (element.cell.bombAround === 4) {
        textColor = '#00008B'
      } else if (element.cell.bombAround === 5) {
        textColor = '#8B0000'
      } else if (element.cell.bombAround === 6) {
        textColor = '#00FFFF'
      } else if (element.cell.bombAround === 7) {
        textColor = 'black'
      } else if (element.cell.bombAround === 8) {
        textColor = 'grey'
      }

      // Draw the text
      if (element.cell.bombAround !== 0) {
        ctx.fillStyle = textColor
        ctx.font = '20px Arial'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(element.cell.bombAround.toString(), x + cellSize / 2, y + cellSize / 2)
      } else {
        if (element.cell.bomb) {
          console.log('Cell:', element.cell.bomb)
          drawBomb(ctx, x + cellSize / 2, y + cellSize / 2, cellSize / 4, cellSize / 8)
        }
      }
    }

    // Draw the borders
    ctx.strokeRect(x, y, cellSize, cellSize)
  })
}

const recoverGrid = async () => {
  try {
      const response = await axios.post('http://localhost:8080/game/get', {
        roomId : store.roomId
      })
      return response.data
    } catch (error) {
      console.error('Error:', error)
    }
}

const deleteRoom = async () => {
  try {
    await axios.delete('http://localhost:8080/game', {
      data: {
        roomId: store.roomId
      }
    });
    
    store.setRoomId(-1);
  } catch (error) {
    console.error('Error:', error);
  }
}

const handleGameUpdate = (data: any) => {
  let gameStopped = false
  console.log (data)
  // Check if game is end
  if (data.isGameEnded) {
    if(data.isGameWin)
      store.isWin = true
    else
      store.isWin = false
    gameStopped = true
    isGameEnding.value = true
    recoverGrid()
      .then((grid) => {
        redrawGrid(grid.changedCells, store.cellSize, true);
        deleteRoom()
        canvas.value?.removeEventListener('click', handleCanvasLeftClick)
        canvas.value?.removeEventListener('contextmenu', handleCanvasRightClick)

        console.log('la partie est terminé')
      })
    
  }
  if (!gameStopped)
    redrawGrid(data.changedCells, store.cellSize)
}

onMounted(async () => {
  if(props.isGameReload) {
    recoverGrid()
    .then((grid) => {
      handleGameUpdate(grid);
    })
  }
  canvas.value = document.getElementById('game-canvas') as HTMLCanvasElement
  drawGrid()
  if (canvas.value) {
    canvas.value.addEventListener('click', handleCanvasLeftClick)
    canvas.value.addEventListener('contextmenu', handleCanvasRightClick)
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
    <div v-if="isGameEnding">
      <GameEnding />
    </div>
  </div>
</template>
