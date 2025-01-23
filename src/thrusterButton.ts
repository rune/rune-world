const isTouch = !!("ontouchstart" in window)
export const renderThrusterButton = ({
  onAccelerate: onAccelerateHandler,
}: {
  onAccelerate: (acceleration: number) => void
}) => {
  const button = document.getElementById("thruster-button")
  button?.addEventListener(isTouch ? "touchstart" : "mousedown", () => {
    onAccelerateHandler(1)
  })

  button?.addEventListener(isTouch ? "touchend" : "mouseup", () => {
    onAccelerateHandler(0)
  })

  button?.addEventListener("mouseout", () => {
    onAccelerateHandler(0)
  })
}
