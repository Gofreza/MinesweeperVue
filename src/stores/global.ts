import { defineStore } from 'pinia'

export const useGlobalStore = defineStore('global', {
  state: () => ({
    isDarkTheme: false
  }),
  // Computed properties
  getters: {},
  // Methods that mutate the store
  actions: {}
})
