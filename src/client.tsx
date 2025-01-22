import { renderJoystick } from "./joystick.ts"
import type { Controls } from "./logic.ts"
import { renderGame } from "./render.ts"

const onJoystickMove = (controls: Controls) => Rune.actions.move(controls)

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
      }
    },
  })

  const joystickDiv = document.getElementById("joystick")
  if (joystickDiv && joystickDiv instanceof HTMLDivElement) {
    renderJoystick({ zone: joystickDiv, onMove: onJoystickMove })
  }
}

startUI()
