import { useEffect, useRef, useState } from "react"
import { GameState, SPACE_HEIGHT, SPACE_WIDTH } from "./logic.ts"
import { physics } from "propel-js"

import { Joystick } from "./Joystick.tsx"

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
  gameState: GameState,
) => {
  if (ctx) {
    const world = gameState.world
    ctx.reset()
    ctx.resetTransform()

    for (const body of physics.allBodies(world)) {
      const shape = body.shapes[0]
      if (shape.type === physics.ShapeType.CIRCLE) {
        ctx.save()
        ctx.translate(shape.center.x, shape.center.y)
        ctx.rotate(body.angle)

        ctx.beginPath()
        ctx.arc(0, 0, shape.bounds, 0, Math.PI * 2)
        ctx.stroke()
        ctx.beginPath()
        ctx.moveTo(0, 0)
        ctx.lineTo(0, shape.bounds)
        ctx.stroke()

        ctx.restore()
      } else {
        ctx.fillStyle = "rgba(255,255,0,0.7)";
        ctx.save();
        ctx.translate(shape.center.x, shape.center.y);
        ctx.rotate(body.angle + shape.angle);
        const { x: width, y: height } = scaleToCanvas({
          x: shape.width,
          y: shape.height,
          canvas,
        })
        ctx.strokeRect(-shape.width / 2, -shape.height / 2, width, height)

        // if (shape.sensor && shape.sensorColliding) {
        //     ctx.fillRect(-shape.width / 2, -shape.height / 2, shape.width, shape.height);
        // }
        ctx.restore()
      }

      if (!body.static) {
        const dynamic = body as physics.DynamicRigidBody;
        ctx.fillStyle = "blue";
        ctx.beginPath();
        ctx.arc(
          dynamic.centerOfPhysics.x,
          dynamic.centerOfPhysics.y,
          2,
          0,
          Math.PI * 2
        )
        ctx.fill()
      }
      ctx.fillStyle = "red"
      ctx.beginPath()
      ctx.arc(body.center.x, body.center.y, 2, 0, Math.PI * 2)
      ctx.fill()
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
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { height, width } = getCanvasDimensions()

  useEffect(() => {
    Rune.initClient({
      onChange: ({ game }) => {
        setGame(game)
      },
    })
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !game) return
    const context = canvas.getContext("2d")

    //Our draw come here
    draw(context, canvas, game)
  }, [game])

  if (!game) {
    // Rune only shows your game after an onChange() so no need for loading screen
    return
  }

  return (
    <>
      <canvas width={width} height={height} ref={canvasRef} />
      <Joystick onMove={(controls) => Rune.actions.move(controls)} />
    </>
  )
}

export default App
