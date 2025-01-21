import type { PlayerId, RuneClient } from "rune-sdk"
import { physics } from "propel-js"

export type Cells = (PlayerId | null)[]

export interface GameState {
  playerIds: PlayerId[]
  world: physics.World
  playerBodies: Record<PlayerId, number>
}

type GameActions = {
  move: (controls: { x: number; y: number }) => void
}

export type Controls = {
  x: number
  y: number
}

declare global {
  const Rune: RuneClient<GameState, GameActions>
}

export const SPACE_WIDTH = 400
export const SPACE_HEIGHT = 650
export const SHIP_SIZE = 50
const POWER_SCALE = 100

const createBoundary = ({
  world,
  center,
  width,
  height,
}: {
  world: physics.World
  center: {
    x: number
    y: number
  }
  width: number
  height: number
}) => {
  const mass = 0
  const friction = 0
  const restitution = 1
  const boundary = physics.createRectangle(
    world,
    {
      x: SPACE_WIDTH / 2 + center.x,
      y: SPACE_HEIGHT / 2 + center.y,
    },
    width,
    height,
    mass,
    friction,
    restitution
  )
  physics.addBody(world, boundary)

  return boundary
}

Rune.initLogic({
  minPlayers: 1,
  maxPlayers: 6,
  updatesPerSecond: 30,
  reactive: false,
  update: ({ game }) => {
    // propel-js likes a 60fps game loop since it keeps the iterations high so run it
    // twice since the game logic is configured to run at 30fps
    physics.worldStep(60, game.world)
    physics.worldStep(60, game.world)
  },
  setup: (allPlayerIds) => {
    const world = physics.createWorld({ x: 0, y: 0 }, 20)
    const playerBodies: Record<PlayerId, number> = {}
    allPlayerIds.forEach((playerId, i) => {
      const player: physics.DynamicRigidBody = physics.createCircle(
        world,
        { x: (SPACE_WIDTH / 6) * (i + 1), y: SPACE_HEIGHT / 2 },
        SHIP_SIZE,
        1,
        1,
        1
      ) as physics.DynamicRigidBody

      player.data = {
        col: "orange",
        num: 0,
        ox: SPACE_WIDTH / 6,
        oy: SPACE_HEIGHT / 2,
      }

      playerBodies[playerId] = player.id

      physics.addBody(world, player)

      player.velocity.y = 100

      // physics.applyVelocity(player, {
      //   x: 200,
      //   y: 200,
      // })
    })

    createBoundary({
      world,
      center: { x: 0, y: SPACE_HEIGHT / 2 },
      width: SPACE_WIDTH,
      height: 1,
    })
    createBoundary({
      world,
      center: { x: 0, y: -SPACE_HEIGHT / 2 },
      width: SPACE_WIDTH,
      height: 1,
    })
    createBoundary({
      world,
      center: { x: -SPACE_WIDTH / 2, y: 0 },
      width: 1,
      height: SPACE_HEIGHT,
    })
    createBoundary({
      world,
      center: { x: SPACE_WIDTH / 2, y: 0 },
      width: 1,
      height: SPACE_HEIGHT,
    })

    const gameState: GameState = {
      world,
      playerIds: allPlayerIds,
      playerBodies,
    }

    return gameState
  },
  events: {
    playerJoined: (playerId, { game }) => {
      const world = game.world
      const playerBody: physics.DynamicRigidBody = physics.createCircle(
        world,
        { x: (SPACE_WIDTH / 6) * game.playerIds.length, y: SPACE_HEIGHT / 2 },
        SHIP_SIZE,
        1,
        1,
        1
      ) as physics.DynamicRigidBody

      playerBody.data = {
        col: "orange",
        num: 0,
        ox: SPACE_WIDTH / 6,
        oy: SPACE_HEIGHT / 2,
      }

      game.playerBodies[playerId] = playerBody.id

      physics.addBody(world, playerBody)

      playerBody.velocity.y = 100

      game.playerIds.push(playerId)
    },
    playerLeft: (playerId, { game }) => {
      const world = game.world
      const playerBodyId = game.playerBodies[playerId]
      const playerBody = world.dynamicBodies.find(
        (body) => body.id === playerBodyId
      )
      if (playerBody) {
        physics.removeBody(world, playerBody)
      }
      delete game.playerBodies[playerId]
      game.playerIds = game.playerIds.filter((id) => id !== playerId)
    },
  },
  actions: {
    move: (controls: Controls, { game, playerId }) => {
      const playerBodies = game.playerBodies
      const playerBody = game.world.dynamicBodies.find(
        (b) => b.id === playerBodies[playerId]
      )
      if (playerBody) {
        physics.applyVelocity(playerBody, {
          x: controls.x * POWER_SCALE,
          y: controls.y * POWER_SCALE * -1,
        })

        // console.log("controls:", controls)
      }
    },
  },
})
