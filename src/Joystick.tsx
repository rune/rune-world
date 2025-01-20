import { useEffect, useRef } from "react"
import { Controls } from "./logic"
import nipplejs from "nipplejs"

const lastMoveOldEnough = (date: Date) => {
  return new Date().getTime() - date.getTime() > 100
}

export const Joystick = ({
  onMove,
}: {
  onMove: (controls: Controls) => void
}) => {
  const controllerDivRef = useRef<HTMLDivElement>(null)
  const lastMoveRef = useRef<Date>()

  useEffect(() => {
    if (controllerDivRef.current) {
      const joystick = nipplejs.create({
        mode: "static",
        zone: controllerDivRef.current,
        position: { left: "80px", bottom: "80px" },
        threshold: 0.2,
        color: "blue",
      })

      joystick.on("move", (event, joystick) => {
        if (!lastMoveRef.current || lastMoveOldEnough(lastMoveRef.current)) {
          lastMoveRef.current = new Date()

          const newControls = joystick.vector

          // clamp inputs to stop stutter
          newControls.x = Math.floor(newControls.x * 30) / 30
          newControls.y = Math.floor(newControls.y * 30) / 30

          onMove(newControls)
        }
      })

      return () => joystick.destroy()
    }
  }, [controllerDivRef.current])

  return <div id="controller" ref={controllerDivRef} />
}