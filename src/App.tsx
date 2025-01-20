import { useEffect, useRef, useState } from "react"
import { PlayerId } from "rune-sdk"

import selectSoundAudio from "./assets/select.wav"
import { GameState } from "./logic.ts"

const selectSound = new Audio(selectSoundAudio)

const draw = (
  ctx: CanvasRenderingContext2D | null,
  canvas: HTMLCanvasElement
) => {
  if (ctx) {
    console.log("Drawing")
    ctx.fillStyle = "blue"
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.fillStyle = "#FF0000"
    ctx.beginPath()
    ctx.arc(50, 100, 20, 0, 2 * Math.PI)
    ctx.fill()
  }
}

function App() {
  const [game, setGame] = useState<GameState>()
  const [yourPlayerId, setYourPlayerId] = useState<PlayerId | undefined>()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [canvasContext, setCanvasContext] = useState<CanvasRenderingContext2D>()

  useEffect(() => {
    Rune.initClient({
      onChange: ({ game, action, yourPlayerId }) => {
        setGame(game)
        setYourPlayerId(yourPlayerId)

        if (action && action.name === "claimCell") selectSound.play()
      },
    })
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const context = canvas.getContext("2d")

    //Our draw come here
    draw(context, canvas)
  }, [game])

  if (!game) {
    // Rune only shows your game after an onChange() so no need for loading screen
    return
  }

  const { winCombo, cells, lastMovePlayerId, playerIds, freeCells } = game

  return <canvas ref={canvasRef} />
}

export default App
