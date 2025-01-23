export const renderThrusterButton = ({
  onAccelerate: onAccelerateHandler,
}: {
  onAccelerate: (accleration: number) => void
}) => {
  const button = document.getElementById("thruster-button")
  button?.addEventListener("mousedown", () => {
    onAccelerateHandler(1)
  })

  button?.addEventListener("mouseup", () => {
    onAccelerateHandler(0)
  })
}
