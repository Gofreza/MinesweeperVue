import { defineStore } from 'pinia'

export const useGlobalStore = defineStore('global', {
  state: () => ({
    isDarkTheme: false,
    cellSize: 40,
    cols: 10,
    rows: 10,
    roomId: -1,
    isFinish: false,
    isWin: false,
    isMulti: false,
    username: 'player1',
    time: 0
  }),
  // Computed properties
  getters: {},
  // Methods that mutate the store
  actions: {
    toggleTheme() {
      this.isDarkTheme = !this.isDarkTheme
    },
    setCellSize(size: number) {
      this.cellSize = size
    },
    setCols(cols: number) {
      this.cols = cols
    },
    setRows(rows: number) {
      this.rows = rows
    },
    setRoomId(roomId: number) {
      this.roomId = roomId
    },
    setElapsedTime(time: number){
      this.time = time
    }
  },
  persist: {
    storage: sessionStorage
  }
})
