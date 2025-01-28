import { PlayerId } from "rune-sdk"
import { GameState, SPACE_HEIGHT, SPACE_WIDTH } from "./logic.ts"
import { physics } from "propel-js"

const playerAvatarImageIds: Record<PlayerId, string> = {}

export const staticImageIds = {
  background: "background",
  thruster: "ship-thruster",
  saucer: "ship-saucer",
  dome: "ship-dome",
}

const renderPlayer = ({
  ctx,
  playerId,
  centerX,
  centerY,
  angle,
  accelerating,
  devicePixelRatio,
}: {
  ctx: CanvasRenderingContext2D
  playerId: PlayerId
  centerX: number
  centerY: number
  angle: number
  accelerating: boolean
  devicePixelRatio: number
}) => {
  if (!playerAvatarImageIds[playerId]) {
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
      playerAvatarImageIds[playerId] = img.id
    }
  }

  ctx.translate(centerX, centerY)
  ctx.rotate(angle)

  const avatarImage = document.getElementById(playerAvatarImageIds[playerId])
  if (avatarImage && avatarImage instanceof HTMLImageElement) {
    if (accelerating) {
      const shipThrusterElement = document.getElementById(
        staticImageIds.thruster
      )
      if (
        shipThrusterElement &&
        shipThrusterElement instanceof HTMLImageElement &&
        shipThrusterElement.complete
      ) {
        ctx.drawImage(
          shipThrusterElement,
          -9 * devicePixelRatio,
          52 * devicePixelRatio,
          18 * devicePixelRatio,
          30 * devicePixelRatio
        )
      }
    }

    const shipSaucer = document.getElementById(staticImageIds.saucer)
    if (
      shipSaucer &&
      shipSaucer instanceof HTMLImageElement &&
      shipSaucer.complete
    ) {
      ctx.drawImage(
        shipSaucer,
        -46 * devicePixelRatio,
        0,
        93.6 * devicePixelRatio,
        49.2 * devicePixelRatio
      )
    }

    // since this method is called every frame, we can just wait to draw the image
    // until it is fully loaded
    if (avatarImage.complete) {
      ctx.drawImage(
        avatarImage,
        -20 * devicePixelRatio,
        -19 * devicePixelRatio,
        42.8 * devicePixelRatio,
        42.8 * devicePixelRatio
      )
    }

    const shipDome = document.getElementById(staticImageIds.dome)
    if (shipDome && shipDome instanceof HTMLImageElement && shipDome.complete) {
      ctx.drawImage(
        shipDome,
        -34.3 * devicePixelRatio,
        -26 * devicePixelRatio,
        69.6 * devicePixelRatio,
        52.8 * devicePixelRatio
      )
    }
  }
}

const draw = async (
  ctx: CanvasRenderingContext2D | null,
  canvas: HTMLCanvasElement,
  gameState: GameState,
  myPlayerId: PlayerId,
  devicePixelRatio: number
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
    const cameraOffsetX =
      playerCenterX > SPACE_WIDTH - canvas.width / 2
        ? canvas.width - (SPACE_WIDTH - playerCenterX)
        : Math.min(playerCenterX, canvas.width / 2)
    const cameraOffsetY =
      playerCenterY > SPACE_HEIGHT - canvas.height / 2
        ? canvas.height - (SPACE_HEIGHT - playerCenterY)
        : Math.min(playerCenterY, canvas.height / 2)

    const background = document.getElementById(staticImageIds.background)
    if (
      background &&
      background instanceof HTMLImageElement &&
      background.complete
    ) {
      ctx.save()
      ctx.translate(
        -Math.min(
          Math.max(playerCenterX, canvas.width / 2),
          SPACE_WIDTH - canvas.width / 2
        ),
        -Math.min(
          Math.max(playerCenterY, canvas.height / 2),
          SPACE_HEIGHT - canvas.height / 2
        )
      )
      ctx.drawImage(
        background,
        0,
        0,
        2048 * devicePixelRatio,
        2048 * devicePixelRatio
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
          renderPlayer({
            ctx,
            playerId,
            centerX: shape.center.x - playerCenterX + cameraOffsetX,
            centerY: shape.center.y - playerCenterY + cameraOffsetY,
            angle: body.angle,
            accelerating,
            devicePixelRatio,
          })
          ctx.restore()
        }
      }
    }

    if (myPlayerBody) {
      ctx.save()
      const accelerating =
        !myPlayerBody.static &&
        (myPlayerBody.acceleration.x !== 0 || myPlayerBody.acceleration.y !== 0)
      renderPlayer({
        ctx,
        playerId: myPlayerId,
        centerX: cameraOffsetX,
        centerY: cameraOffsetY,
        angle: myPlayerBody.angle,
        accelerating,
        devicePixelRatio,
      })
      ctx.restore()
    }
  }
}

let canvas: HTMLCanvasElement

export const renderGame = ({
  game,
  playerId,
}: {
  game: GameState
  playerId: PlayerId
}) => {
  if (!canvas) {
    const { innerHeight: height, innerWidth: width, devicePixelRatio } = window

    const canvasEl = document.getElementById("game-canvas")
    if (canvasEl instanceof HTMLCanvasElement) {
      canvas = canvasEl
      canvas.width = width * devicePixelRatio
      canvas.height = height * devicePixelRatio
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
    }
  }

  const ctx = canvas.getContext("2d")

  draw(ctx, canvas, game, playerId, devicePixelRatio)
}
