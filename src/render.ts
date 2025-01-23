import { PlayerId } from "rune-sdk"
import { GameState, SPACE_HEIGHT, SPACE_WIDTH } from "./logic.ts"
import { physics } from "propel-js"

const getCanvasDimensions = () => {
  // whats the right way to do this?
  const width = window.innerWidth
  const height = window.innerHeight

  return {
    width,
    height,
  }
}

const playerAvatarImages: Record<PlayerId, HTMLImageElement> = {}

const renderPlayer = (
  ctx: CanvasRenderingContext2D,
  playerId: PlayerId,
  centerX: number,
  centerY: number,
  angle: number,
  accelerating: boolean
) => {
  if (!playerAvatarImages[playerId]) {
    const imageDiv = document.getElementById("game-images")
    if (imageDiv && imageDiv instanceof HTMLDivElement) {
      console.log("image", Rune.getPlayerInfo(playerId).avatarUrl)
      const img = document.createElement("img")
      img.id = `avatar-img-${playerId}`
      img.src = Rune.getPlayerInfo(playerId).avatarUrl
      img.height = 300
      img.width = 300
      img.className = "hidden-img"
      imageDiv.appendChild(img)
      playerAvatarImages[playerId] = img
    }
  }

  ctx.translate(centerX, centerY)
  ctx.rotate(angle)
  // ctx.imageSmoothingEnabled = false
  // ctx.scale(window.devicePixelRatio, window.devicePixelRatio)

  const avatarImage = playerAvatarImages[playerId]
  if (avatarImage) {
    if (accelerating) {
      const shipThrusterElement = document.getElementById(
        `ship-thruster`
      ) as HTMLImageElement
      if (shipThrusterElement) {
        ctx.drawImage(shipThrusterElement, 0, 0, 360, 700, -18, 55, 36, 70)
      }
    }
    const shipSaucer = document.getElementById(
      `ship-saucer`
    ) as HTMLImageElement
    if (shipSaucer) {
      ctx.drawImage(shipSaucer, 0, 0, 312, 164, -46, 0, 93.6, 49.2)
    }
    ctx.drawImage(avatarImage, 0, 0, 300, 300, -20, -19, 42.8, 42.8)
    const shipDome = document.getElementById(`ship-dome`) as HTMLImageElement
    if (shipDome) {
      ctx.drawImage(shipDome, 0, 0, 232, 176, -34.3, -26, 69.6, 52.8)
    }
  }
}

const draw = async (
  ctx: CanvasRenderingContext2D | null,
  canvas: HTMLCanvasElement,
  gameState: GameState,
  myPlayerId: PlayerId
) => {
  if (ctx) {
    const world = gameState.world
    ctx.reset()
    ctx.resetTransform()

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

    const background = document.getElementById("background")
    if (background && background instanceof HTMLImageElement) {
      if (!background.complete) {
        await new Promise((resolve) => {
          background.onload = resolve
        })
      }
      ctx.save()
      ctx.translate(Math.max(left, 0) - SPACE_WIDTH, top - SPACE_HEIGHT)
      ctx.drawImage(
        background,
        0,
        0,
        2048,
        2048,
        0,
        0,
        SPACE_WIDTH * 2,
        SPACE_HEIGHT * 2
      )
      ctx.restore()
    }

    for (const body of physics.allBodies(world)) {
      const shape = body.shapes[0]

      // render a player
      if (shape.type === physics.ShapeType.CIRCLE) {
        const accelerating =
          !body.static &&
          (body.acceleration.x !== 0 || body.acceleration.y !== 0)
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
            body.angle,
            accelerating
          )
          ctx.restore()
        }
      }
    }

    if (myPlayerBody) {
      ctx.save()
      const accelerating =
        !myPlayerBody.static &&
        (myPlayerBody.acceleration.x !== 0 || myPlayerBody.acceleration.y !== 0)
      renderPlayer(
        ctx,
        myPlayerId,
        // TODO: try to get the player to move all the way to the edge of the screen
        myPlayerBody.center.x < canvas.width / 2
          ? canvas.width - myPlayerBody.center.x
          : canvas.width / 2,
        // canvas.width / 2,
        canvas.height / 2,
        myPlayerBody.angle,
        accelerating
      )
      ctx.restore()
    }
  }
}

let canvas: HTMLCanvasElement

export const renderGame = ({
  game,
  playerId,
  rootDiv,
}: {
  rootDiv: HTMLDivElement
  game: GameState
  playerId: PlayerId
}) => {
  if (!canvas) {
    const { height, width } = getCanvasDimensions()

    canvas = document.createElement("canvas")
    canvas.width = width
    canvas.height = height

    rootDiv.appendChild(canvas)
  }

  const ctx = canvas.getContext("2d")

  draw(ctx, canvas, game, playerId)
}
