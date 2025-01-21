import { useCallback, useEffect, useRef, useState } from "react"
import { Controls, GameState, SPACE_HEIGHT, SPACE_WIDTH } from "./logic.ts"
import { physics } from "propel-js"

import { Joystick } from "./Joystick.tsx"
import { PlayerId } from "rune-sdk"
import shipDome from "./assets/spaceship_dome.png"
import shipSaucer from "./assets/ship_saucer.png"
import background from "./assets/background_1.jpg"

const renderPlayer = (
  ctx: CanvasRenderingContext2D,
  playerId: PlayerId,
  centerX: number,
  centerY: number,
  angle: number
) => {
  ctx.translate(centerX, centerY)
  ctx.rotate(angle)

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
    const shipDome = document.getElementById(`ship-dome`) as HTMLImageElement
    if (shipDome) {
      ctx.drawImage(shipDome, -42, -28, 84, 56)
    }
  }
}

const draw = (
  ctx: CanvasRenderingContext2D | null,
  canvas: HTMLCanvasElement,
  gameState: GameState,
  myPlayerId: PlayerId
) => {
  if (ctx) {
    const world = gameState.world
    ctx.reset()
    ctx.resetTransform()

    // ctx.restore()
    const myPlayerBody = physics
      .allBodies(world)
      .find((body) => body.id === gameState.playerBodies[myPlayerId])

    if (!myPlayerBody) {
      return
    }

    const playerCenterX = myPlayerBody.center.x
    const playerCenterY = myPlayerBody.center.y
    const top = playerCenterY - canvas.height / 2
    const left = playerCenterX - canvas.width / 2

    ctx.save()
    const background = document.getElementById("background") as HTMLImageElement
    ctx.translate(left - SPACE_WIDTH, top - SPACE_HEIGHT)
    ctx.drawImage(background, 0, 0, SPACE_WIDTH * 2, SPACE_HEIGHT * 2)
    ctx.restore()

    for (const body of physics.allBodies(world)) {
      const shape = body.shapes[0]

      // render a player
      if (shape.type === physics.ShapeType.CIRCLE) {
        const [playerId] =
          Object.entries(gameState.playerBodies).find(
            ([, playerBodyId]) => playerBodyId === shape.bodyId
          ) || []

        if (playerId !== undefined && playerId !== myPlayerId) {
          ctx.save()
          renderPlayer(
            ctx,
            playerId,
            playerCenterX - shape.center.x + canvas.width / 2,
            playerCenterY - shape.center.y + canvas.height / 2,
            body.angle
          )
          ctx.restore()
        }
      }
    }

    if (myPlayerBody) {
      ctx.save()
      renderPlayer(
        ctx,
        myPlayerId,
        canvas.width / 2,
        canvas.height / 2,
        myPlayerBody.angle
      )
      ctx.restore()
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
    draw(context, canvas, game, playerId ?? "")
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

      <img
        id="ship-dome"
        className="hidden-img"
        src={shipDome}
        height={56}
        width={86}
      />
      <img
        id="ship-saucer"
        className="hidden-img"
        src={shipSaucer}
        height={61}
        width={145}
      />
      <img
        id="background"
        className="hidden-img"
        src={background}
        height={height}
        width={width}
      />
    </>
  )
}

export default App
