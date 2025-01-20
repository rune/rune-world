import { useEffect, useRef, useState } from "react"
import { PlayerId } from "rune-sdk"

import selectSoundAudio from "./assets/select.wav"
import { GameState, SPACE_HEIGHT, SPACE_WIDTH } from "./logic.ts"
import { physics } from "propel-js"
import nipplejs, { Joystick, JoystickManager } from "nipplejs"

const selectSound = new Audio(selectSoundAudio)

const draw = (
  ctx: CanvasRenderingContext2D | null,
  canvas: HTMLCanvasElement,
  gameState: GameState,
) => {
  // requestAnimationFrame(draw)
  const scale = Math.min(
    window.innerWidth / SPACE_WIDTH,
    window.innerHeight / SPACE_HEIGHT
  )
  if (ctx) {
    // console.log("Drawing", gameState.playerIds)

    const world = gameState.world
    ctx.reset()
    ctx.resetTransform();

    // const collisions = physics.worldStep(60, world);
    
    for (const body of physics.allBodies(world)) {

      // console.log("center:", body.center)

      const shape = body.shapes[0]
      if (shape.type === physics.ShapeType.CIRCLE) {
        // const offsetx =
        //   ((body.center.x - SPACE_WIDTH / 2) / (SPACE_WIDTH / 2)) * (4 / scale)
        // const offsety =
        //   ((body.center.y - SPACE_HEIGHT / 2) / (SPACE_HEIGHT / 2)) * (4 / scale)
        // ctx.fillStyle = "yellow"
        // ctx.beginPath()
        // ctx.arc(
        //   body.center.x + offsetx * scale,
        //   body.center.y + offsety * scale,
        //   shape.bounds,
        //   0,
        //   Math.PI * 2
        // )
        // ctx.fill()

        ctx.save();
        ctx.translate(shape.center.x, shape.center.y);
        ctx.rotate(body.angle);

        ctx.beginPath();
        ctx.arc(0, 0, shape.bounds, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(0, shape.bounds);
        ctx.stroke();

        ctx.restore();
      }

      if (!body.static) {
        const dynamic = body as physics.DynamicRigidBody;
        ctx.fillStyle = "blue";
        ctx.beginPath();
        ctx.arc(dynamic.centerOfPhysics.x, dynamic.centerOfPhysics.y, 2, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.fillStyle = "red";
      ctx.beginPath();
      ctx.arc(body.center.x, body.center.y, 2, 0, Math.PI * 2);
      ctx.fill();
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

type JoystickState = {
  x: number
  y: number
}

function App() {
  const joystickStateRef = useRef<JoystickState>({x: 0, y: 0})
  const [game, setGame] = useState<GameState>()
  const [yourPlayerId, setYourPlayerId] = useState<PlayerId | undefined>()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const {height, width} = getCanvasDimensions()
  const [canvasContext, setCanvasContext] = useState<CanvasRenderingContext2D>()
  const controllerDivRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    Rune.initClient({
      onChange: ({ game, yourPlayerId }) => {
        setGame(game)
        setYourPlayerId(yourPlayerId)
      },
    })
  }, [])

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
        const newControls = joystick.vector
        
        // clamp inputs to stop stutter
        newControls.x = Math.floor(newControls.x * 30) / 30
        newControls.y = Math.floor(newControls.y * 30) / 30

        Rune.actions.move(newControls)
      })

      return () => joystick.destroy()
    }
  }, [controllerDivRef.current])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !game) return
    const context = canvas.getContext("2d")

    //Our draw come here
    draw(context, canvas, game, joystickStateRef.current)
  }, [game])

  if (!game) {
    // Rune only shows your game after an onChange() so no need for loading screen
    return
  }

  const { winCombo, cells, lastMovePlayerId, playerIds, freeCells } = game

  return (
    <>
      <canvas width={width} height={height} ref={canvasRef} />
      <div id="controller" ref={controllerDivRef} />
    </>
  )
}

export default App
