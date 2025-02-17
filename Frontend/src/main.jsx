import { createRoot } from 'react-dom/client'
import store from './store.jsx'
import {BrowserRouter} from "react-router-dom"
import {Provider} from "react-redux"
import App from './App.jsx'
import "./index.css"

console.log("store" , store.getState())

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <Provider store={store}>
      <App />
    </Provider>
  </BrowserRouter>  
)