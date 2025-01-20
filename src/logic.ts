import type { PlayerId, RuneClient } from "rune-sdk"
import { physics } from "propel-js"

export type Cells = (PlayerId | null)[]

export interface GameState {
  playerIds: PlayerId[]
  world: physics.World
  playerBodies: Record<PlayerId, number>
}

type GameActions = {
  move: (controls: { x: number, y: number}) => void
}

type Controls = {
  x: number
  y: number
}

declare global {
  const Rune: RuneClient<GameState, GameActions>
}

export const SPACE_WIDTH = 250
export const SPACE_HEIGHT = 140
export const SHIP_SIZE = 10

Rune.initLogic({
  minPlayers: 1,
  maxPlayers: 6,
  updatesPerSecond: 30,
  reactive: false,
  update: ({ game }) => {
    const collisions = physics.worldStep(60, game.world)
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
        col: 'orange',
        num: 0,
        ox: (SPACE_WIDTH / 6),
        oy: SPACE_HEIGHT / 2,
      }

      playerBodies[playerId] = player.id

      physics.addBody(world, player)

      player.velocity.y = 25

      // physics.applyVelocity(player, {
      //   x: 200,
      //   y: 200,
      // })
    })

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
      const playerBody = game.world.dynamicBodies.find((b) => b.id === playerBodies[playerId])
      if (playerBody) {
        physics.applyVelocity(playerBody, {
          x: controls.x,
          y: controls.y,
        })
      }
    },
  },
})
