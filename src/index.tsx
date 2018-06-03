import {h, render} from 'preact'
import App from './App'

const mountElement = document.createElement('div')
document.body.appendChild(mountElement)

render(<App />, mountElement)
