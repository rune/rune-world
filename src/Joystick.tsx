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
        color: "#FAEF98",
      })

      joystick.on("move", (event, joystick) => {
        if (!lastMoveRef.current || lastMoveOldEnough(lastMoveRef.current)) {
          lastMoveRef.current = new Date()

          const newControls = {
            ...joystick.vector,
            direction: joystick.direction,
          }


          // clamp inputs to stop stutter
          newControls.x = Math.floor(newControls.x * 30) / 30
          newControls.y = Math.floor(newControls.y * 30) / 30

          onMove(newControls)
        }
      })

      // TODO: do this better
      joystick.on("end", () => {
        onMove({
          x: 0,
          y: 0,
          direction: { angle: "down", x: "right", y: "down" },
        })
      })

      return () => joystick.destroy()
    }
  }, [onMove])

  return <div id="controller" ref={controllerDivRef} />
}
