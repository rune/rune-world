import { renderJoystick } from "./joystick.ts"
import type { Controls } from "./logic.ts"
import { renderGame } from "./render.ts"

const onJoystickMove = (controls: Controls) => {
  Rune.actions.move(controls)
}

let firstRender = true

const startUI = () => {
  Rune.initClient({
    onChange: ({ game, yourPlayerId }) => {
      const runeWorldRootDiv = document.getElementById("rune-world-root")
      if (
        runeWorldRootDiv &&
        runeWorldRootDiv instanceof HTMLDivElement &&
        yourPlayerId
      ) {
        renderGame({ game, playerId: yourPlayerId, rootDiv: runeWorldRootDiv })

        if (firstRender) {
          renderJoystick({ onMove: onJoystickMove })
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
