<script setup lang="ts">
import { useGlobalStore } from '@/stores/global'
import { onMounted, onUnmounted, ref, computed } from 'vue'
import GameEnding from '@/components/GameEnding.vue'
import axios from 'axios'
import SockJS from 'sockjs-client/dist/sockjs'
import Stomp from 'webstomp-client'

const props = defineProps<{
  isGameReload: boolean
  grid: {
    changedCells: Array<{
      row: number
      col: number
      cell: {
        visible: boolean
        flagged: boolean
        bomb: boolean
        bombAround: number
      }
    }>
  }
}>()
const store = useGlobalStore()
var canvas: any = ref(null)
var isGameEnding = ref(false)
let elapsedTime = ref(0)
let timerId: ReturnType<typeof setInterval> | null = null

var stompClient: any = null

const connect = () => {
  const socket = new SockJS('http://localhost:8080/ws')
  stompClient = Stomp.over(socket)
  stompClient.connect({}, onConnected, onError)
}

const onConnected = () => {
  stompClient.subscribe('/topic/game', onMessageReceived)
}

const onError = (error: any) => {
  console.error('Error:', error)
}

const onMessageReceived = (payload: any) => {
  const message = JSON.parse(payload.body)
  console.log('Message:', message)
  console.log(message.roomId == store.roomId, message.roomId, store.roomId)
  if (message.roomId == store.roomId) {
    if (store.isMulti) {
      if (message.username === store.username) {
        console.log('Bonjour multi')
      }
    } else {
      // console.log('Message:', payload)
      // if (message === 'Delete successful') {
      //   isGameEnding.value = true
      //   store.setRoomId(-1)
      //   return
      // }

      handleGameUpdate(message)
    }
  }
}

const sendMessage = (path: string, payload: any) => {
  stompClient.send('/app/' + path, JSON.stringify(payload), {})
}

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
    const payload = {
      row: coordinates.row,
      col: coordinates.col,
      roomId: store.roomId,
      username: store.isMulti ? 'player1' : null
    }
    sendMessage('play', payload)
  }
}

const handleCanvasRightClick = async (event: MouseEvent): Promise<void> => {
  event.preventDefault()
  const { clientX, clientY } = event
  const coordinates = getGridCoordinates(clientX, clientY)
  if (coordinates) {
    const payload = {
      row: coordinates.row,
      col: coordinates.col,
      roomId: store.roomId,
      username: store.isMulti ? 'player1' : null
    }
    sendMessage('flag', payload)
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
      if (!element.cell.visible && !isFinished) ctx.fillStyle = '#888888'
      else if (isFinished && !element.cell.visible && !element.cell.bomb) ctx.fillStyle = '#999999'
      else ctx.fillStyle = '#f9f8f5'
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
  sendMessage('grid', store.roomId)
}

const deleteRoom = async () => {
  try {
    await axios.delete('http://localhost:8080/game', {
      data: { roomId: store.roomId }
    })
    isGameEnding.value = true
    store.setRoomId(-1)
  } catch (error) {
    console.error('Error:', error)
  }
}

const handleGameUpdate = (data: any) => {
  if (data.isGameEnded) {
    if (data.changedCells.length == store.cols * store.rows) {
      redrawGrid(data.changedCells, store.cellSize, true)
      stopTimer()

      if (data.isGameWin) store.isWin = true
      else store.isWin = false

      deleteRoom()
      canvas.value?.removeEventListener('click', handleCanvasLeftClick)
      canvas.value?.removeEventListener('contextmenu', handleCanvasRightClick)

      console.log('la partie est terminé')
    } else recoverGrid()
  } else redrawGrid(data.changedCells, store.cellSize)
}

const formattedTime = computed(() => {
  const minutes = String(Math.floor(elapsedTime.value / 60)).padStart(2, '0')
  const seconds = String(elapsedTime.value % 60).padStart(2, '0')
  return `${minutes}:${seconds}`
})

const startTimer = () => {
  timerId = setInterval(() => {
    elapsedTime.value += 1 // Increment elapsed time
  }, 1000)
}

const stopTimer = () => {
  if (timerId) {
    clearInterval(timerId) // Stop the timer
    timerId = null
  }
}

onMounted(async () => {
  startTimer()
  if (props.isGameReload) {
    elapsedTime.value = store.time
    recoverGrid().then((grid) => {
      handleGameUpdate(grid)
    })
  }
  connect()
  canvas.value = document.getElementById('game-canvas') as HTMLCanvasElement
  drawGrid()
  if (props.isGameReload) {
    console.log('Grid:', props.grid)
    redrawGrid(props.grid.changedCells, store.cellSize)
  }
  if (canvas.value) {
    canvas.value.addEventListener('click', handleCanvasLeftClick)
    canvas.value.addEventListener('contextmenu', handleCanvasRightClick)
  }
})

onUnmounted(() => {
  store.setElapsedTime(elapsedTime.value)
})
</script>

<template>
  <div class="container">
    <div class="sidebar">
      <h2>Informations supplémentaires...</h2>
      <div class="timer">
        <p>Temps écoulé : {{ formattedTime }} Bombe restante :</p>
      </div>
    </div>
    <div class="canvas-container">
      <canvas
        id="game-canvas"
        :width="store.cols * store.cellSize"
        :height="store.rows * store.cellSize"
      ></canvas>
      <div v-if="isGameEnding">
        <GameEnding />
      </div>
    </div>
  </div>
</template>

<style scoped>
.container {
  position: relative;
  display: flex;
  flex-direction: column;
  height: 100%;
  justify-content: space-between;
}
.sidebar {
  height: fit-content;
  padding: 20px;
  background-color: var(--color-background);
}
.canvas-container {
  padding: 10px;
  position: relative;
  max-width: 800px;
  max-height: 800px;
  overflow: auto;
}
#game-canvas {
  width: auto;
  height: auto;
  display: block;
}
</style>
