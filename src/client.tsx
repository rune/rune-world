import { renderJoystick } from "./joystick.ts"
import type { Controls } from "./logic.ts"
import { renderGame } from "./render.ts"
import { renderThrusterButton } from "./thrusterButton.ts"

const onJoystickMove = (controls: Controls) => {
  Rune.actions.move(controls)
}

const onAccelerate = (acceleration: number) => {
  Rune.actions.accelerate(acceleration)
}

let firstRender = true

const startUI = () => {
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
