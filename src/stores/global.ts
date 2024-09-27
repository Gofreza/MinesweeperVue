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
    }
  },
  persist: {
    storage:sessionStorage
  }

})
