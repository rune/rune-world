import React from "react"
import ReactDOM from "react-dom/client"

import App from "./App.tsx"
import "./styles.css"

ReactDOM.createRoot(
  document.getElementById("rune-world-root") as HTMLElement
).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
