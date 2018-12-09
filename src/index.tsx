import {h, render} from 'preact'
import App from './App'

const mountElement = document.createElement('div')
mountElement.id = 'root'
document.body.appendChild(mountElement)

const style = document.createElement('style')
style.innerHTML = `
  html {
    height: 100%;
  }
  body {
    height: 100%;
    margin: 0;
  }
  #root {
    height: 100%;
  }
`
document.head.appendChild(style)

render(<App />, mountElement)
