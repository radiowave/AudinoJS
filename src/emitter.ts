import { IEmitter } from "./interfaces";

interface ICb {
  id: number
  fn: (...args) => any
}

const WILD_CARD_HOOK = '*'

export class Emitter implements IEmitter {
  private hookId = 0
  private cbMap: Map<string, ICb[]>

  constructor () {
    this.cbMap = new Map<string, ICb[]>()
  }

  private get nextHookId () {
    this.hookId++
    return this.hookId
  }

  private emitWildCard = async (hookName: string, ...args) => {
    if (hookName !== WILD_CARD_HOOK) {
      await this.$emit(WILD_CARD_HOOK, hookName, ...args)
    }
  }

  private $off = (hookName: string, cb: ICb) => {
    // Check hook exists
    if (!this.cbMap.has(hookName)) {
      return
    }

    // Get all callbacks for hook
    const callbacks = this.cbMap.get(hookName)

    // Try id lookup
    const cbIndex = callbacks.findIndex((callback) => callback.id === cb.id)

    // Check id is still valid
    if (cbIndex < 0) {
      return
    }

    // Remove hook from map when callbacks should be empty
    if (callbacks.length === 1) {
      // Cleanup hook
      this.$offAll(hookName)
    } else {
      // Remove the callback
      callbacks.splice(cbIndex, 1)
    }
  }

  public $on = (hookName: string, fn: (...args) => any) => {
    // Check if this hook as already been created
    const cb = {
      fn,
      id: this.nextHookId
    }

    if (this.cbMap.has(hookName)) {
      const callbacks = this.cbMap.get(hookName)
      callbacks.push(cb)
    } else {
      // Init the hook
      this.cbMap.set(hookName, [cb])
    }

    return () => {
      this.$off(hookName, cb)
    }
  }

  public $offAll = (hookName: string) => {
    // Delete all callbacks for hook
    if (this.cbMap.has(hookName)) {
      this.cbMap.delete(hookName)
    }
  }

  public $emit = async (hookName: string, ...args) => {
    await this.emitWildCard(hookName, ...args)

    // Check hook exists
    if (!this.cbMap.has(hookName)) {
      return
    }

    // Attempt to invoke each callback
    const callbacks = this.cbMap.get(hookName)
    for (const callback of callbacks) {
      try {
        await callback.fn(...args)
      } catch (ex) {
        console.error(ex)
      }
    }
  }
}