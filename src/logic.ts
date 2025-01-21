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
export const SPACE_HEIGHT = 700
export const SHIP_SIZE = 10
const POWER_SCALE = 100

function createEdge(
  world: physics.World,
  x: number,
  y: number,
  width: number,
  height: number
) {
  const edge = physics.createRectangle(
    world,
    { x: x + width / 2, y: y + height / 2 },
    width,
    height,
    0,
    0.5,
    0.9
  )
  physics.addBody(world, edge)
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

    // Top
    createEdge(world, 0, 0, SPACE_WIDTH, -20)
    // Bottom
    createEdge(world, 0, SPACE_HEIGHT - 20, SPACE_WIDTH, 20)
    // Left
    createEdge(world, 0, 0, -20, SPACE_HEIGHT)
    // Right
    // TODO: why isn't space width the right value here for position
    createEdge(world, SPACE_WIDTH - 20, 20, 20, SPACE_HEIGHT)

    const gameState: GameState = {
      world,
      playerIds: allPlayerIds,
      playerBodies,
    }

    return gameState
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
