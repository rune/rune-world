import { useCallback, useEffect, useRef, useState } from "react"
import { Controls, GameState, SPACE_HEIGHT, SPACE_WIDTH } from "./logic.ts"
import { physics } from "propel-js"

import { Joystick } from "./Joystick.tsx"
import { PlayerId } from "rune-sdk"
import shipDome from "./assets/spaceship_dome.png"
import shipSaucer from "./assets/ship_saucer.png"

const scaleToCanvas = ({
  x,
  y,
  canvas,
}: {
  x: number
  y: number
  canvas: HTMLCanvasElement
}): { x: number; y: number } => {
  return {
    x: (x * canvas.width) / SPACE_WIDTH,
    y: (y * canvas.height) / SPACE_HEIGHT,
  }
}

const draw = (
  ctx: CanvasRenderingContext2D | null,
  canvas: HTMLCanvasElement,
  gameState: GameState
) => {
  if (ctx) {
    const world = gameState.world
    ctx.reset()
    ctx.resetTransform()

    for (const body of physics.allBodies(world)) {
      const shape = body.shapes[0]

      // render a player
      if (shape.type === physics.ShapeType.CIRCLE) {
        const [playerId] =
          Object.entries(gameState.playerBodies).find(
            ([, playerBodyId]) => playerBodyId === shape.bodyId
          ) || []

        if (playerId !== undefined) {
          ctx.save()
          ctx.translate(shape.center.x, shape.center.y)
          ctx.rotate(body.angle)

          const avatarImage = document.getElementById(
            `avatar-img-${playerId}`
          ) as HTMLImageElement
          if (avatarImage) {
            const shipSaucer = document.getElementById(
              `ship-saucer`
            ) as HTMLImageElement
            if (shipSaucer) {
              ctx.drawImage(shipSaucer, -72.5, 0, 145, 61)
            }
            ctx.drawImage(avatarImage, -25, -25, 50, 50)
            const shipDome = document.getElementById(
              `ship-dome`
            ) as HTMLImageElement
            if (shipDome) {
              ctx.drawImage(shipDome, -42, -28, 84, 56)
            }
          }

          ctx.restore()
        }
      } else {
        ctx.fillStyle = "rgba(255,255,0,0.7)"
        ctx.save()
        ctx.translate(shape.center.x, shape.center.y)
        ctx.rotate(body.angle + shape.angle)
        const { x: width, y: height } = scaleToCanvas({
          x: shape.width,
          y: shape.height,
          canvas,
        })
        ctx.strokeRect(-shape.width / 2, -shape.height / 2, width, height)
        ctx.restore()
      }
    }
  }
}

const getCanvasDimensions = () => {
  // whats the right way to do this?
  const width = window.innerWidth
  const height = window.innerHeight

  return {
    width,
    height,
  }
}

function App() {
  const [game, setGame] = useState<GameState>()
  const [playerId, setPlayerId] = useState<PlayerId>()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { height, width } = getCanvasDimensions()

  useEffect(() => {
    Rune.initClient({
      onChange: ({ game, yourPlayerId }) => {
        setGame(game)
        setPlayerId(yourPlayerId)
      },
    })
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !game) return
    const context = canvas.getContext("2d")

    //Our draw come here
    draw(context, canvas, game)
  }, [game, playerId])

  const onMove = useCallback(
    (controls: Controls) => Rune.actions.move(controls),
    []
  )

  if (!game) {
    // Rune only shows your game after an onChange() so no need for loading screen
    return
  }

  return (
    <>
      <canvas width={width} height={height} ref={canvasRef} />
      <Joystick onMove={onMove} />
      {game.playerIds.map((playerId) => (
        <img
          id={`avatar-img-${playerId}`}
          key={playerId}
          src={Rune.getPlayerInfo(playerId).avatarUrl}
          height={40}
          width={40}
        />
      ))}

      <img id="ship-dome" src={shipDome} height={56} width={86} />
      <img id="ship-saucer" src={shipSaucer} height={61} width={145} />
    </>
  )
}

export default App
