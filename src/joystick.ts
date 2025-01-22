import { type Controls } from "./logic"
import nipplejs, { Joystick, JoystickManager } from "nipplejs"

const lastMoveOldEnough = (date: Date) => {
  return new Date().getTime() - date.getTime() > 100
}

let lastMoveTime: Date | undefined = undefined

let joystick: JoystickManager | undefined = undefined
let controller: Joystick | undefined = undefined

export const renderJoystick = ({
  onMove,
}: {
  onMove: (controls: Controls) => void
}) => {
  if (joystick) {
    joystick.destroy()
  }
  if (controller) {
    controller.remove()
  }

  joystick = nipplejs.create({
    mode: "static",
    position: { left: "80px", bottom: "80px" },
    threshold: 0.2,
    color: "#FAEF98",
    dynamicPage: true,
  })

  controller = joystick.get(joystick.ids[0])

  joystick.on("move", (event, joystick) => {
    if (!lastMoveTime || lastMoveOldEnough(lastMoveTime)) {
      lastMoveTime = new Date()

      const newControls = joystick.vector

      // clamp inputs to stop stutter
      newControls.x = Math.floor(newControls.x * 30) / 30
      newControls.y = Math.floor(newControls.y * 30) / 30

      onMove(newControls)
    }
  })
}
