import { type Controls } from "./logic"
import nipplejs from "nipplejs"

const lastMoveOldEnough = (date: Date) => {
  return new Date().getTime() - date.getTime() > 100
}

let lastMoveTime: Date | undefined = undefined

export const renderJoystick = ({
  onMove,
  zone,
}: {
  onMove: (controls: Controls) => void
  zone: HTMLDivElement
}) => {
  const joystick = nipplejs.create({
    mode: "static",
    zone,
    position: { left: "80px", bottom: "80px" },
    threshold: 0.2,
    color: "#FAEF98",
  })

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
