import { defineStore } from 'pinia'

export const useMessageStore = defineStore('message', {
  state: () => ({
    totalUnread: 0
  }),
  actions: {
    setUnread(count: number) {
      this.totalUnread = count
    },
    increment() {
      this.totalUnread += 1
    },
    reset() {
      this.totalUnread = 0
    }
  }
})
