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
          // added this to clear out invalid initial states that
          // can happen on load
          setTimeout(() => {
            renderJoystick({
              onMove: onJoystickMove,
            })
          }, 1000)
          firstRender = false
        }
      }
    },
  })
}

startUI()
