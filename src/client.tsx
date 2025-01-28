import { renderJoystick } from "./joystick.ts"
import type { Controls } from "./logic.ts"
import { renderGame, staticImageIds } from "./render.ts"
import { renderThrusterButton } from "./thrusterButton.ts"

const onJoystickMove = (controls: Controls) => {
  Rune.actions.move(controls)
}

const onAccelerate = (acceleration: number) => {
  Rune.actions.accelerate(acceleration)
}
const waitForImage = async (img: HTMLImageElement, timeoutMs = 10_000) => {
  if (img.complete) {
    return
  }

  return new Promise((resolve, reject) => {
    img.onload = resolve
    img.onerror = reject
    setTimeout(() => {
      reject(new Error(`Loading ${img.id} took more than ${timeoutMs}ms`))
    }, timeoutMs)
  })
}

let firstRender = true

const startUI = async () => {
  await Promise.allSettled(
    Object.values(staticImageIds).map(async (id) => {
      const image = document.getElementById(id)
      if (image instanceof HTMLImageElement) {
        await waitForImage(image)
      }
    })
  )

  Rune.initClient({
    onChange: ({ game, yourPlayerId }) => {
      if (yourPlayerId) {
        renderGame({ game, playerId: yourPlayerId })

        if (firstRender) {
          renderJoystick({ onMove: onJoystickMove })
          renderThrusterButton({ onAccelerate })
          firstRender = false
        }
      }
    },
  })
}

startUI()
