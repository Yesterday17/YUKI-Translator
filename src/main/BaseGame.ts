const debug = require('debug')('yuki:game')
import { EventEmitter } from 'events'
import Hooker from './Hooker'
import { registerProcessExitCallback, registerWindowMinimizeStartCallback, registerWindowMinimizeEndCallback } from './Win32'

export default abstract class BaseGame extends EventEmitter {
  protected pids: number[]

  constructor () {
    super()
    this.pids = []
  }

  public abstract start (): void

  public getPids () {
    return this.pids
  }

  public abstract getInfo (): yuki.Game

  protected afterGetPids () {
    this.injectProcessByPid()
    this.registerProcessExitCallback()
    this.registerGameWindowStatusCallback()
    this.emit('started', this)
  }

  private injectProcessByPid () {
    this.pids.map((pid) => Hooker.getInstance().injectProcess(pid))
  }

  private registerProcessExitCallback () {
    registerProcessExitCallback(this.pids, () => {
      this.emit('exited', this)
    })
  }

  private registerGameWindowStatusCallback() {
    registerWindowMinimizeStartCallback(this.pids[0], ()=>{
      this.emit('minimize-start', this)
    })
    registerWindowMinimizeEndCallback(this.pids[0], ()=>{
      this.emit('minimize-end', this)
    })
  }
}
