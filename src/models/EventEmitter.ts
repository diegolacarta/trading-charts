export default class EventEmitter {
  listeners = {}

  on = (event, listener) => {
    if (!this.listeners[event]) {
      this.listeners[event] = []
    }
    this.listeners[event].push(listener)
  }

  off = (event, listener) => {
    const listeners = this.listeners[event]
    if (!listeners) {
      return
    }
    listeners.splice(listeners.indexOf(listener), 1)
  }

  trigger = (event, ...args) => {
    const listeners = this.listeners[event]
    if (listeners) {
      listeners.forEach(listener => listener(...args))
    }
  }
}