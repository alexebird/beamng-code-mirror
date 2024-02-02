import { vi, describe, it, beforeEach, beforeAll, expect } from 'vitest'
import { createApp } from 'vue'
import { createPinia, setActivePinia } from 'pinia'
import Emitter from 'tiny-emitter'
import { useRefuelStore } from '@/modules/refuel/refuelStore'
import RefuelMain from '@/modules/refuel/views/RefuelMain'
import { shallowMount } from '@vue/test-utils'
import { useTestStore } from './testStore'

// const bngVueMock = vi.fn(() => {
//     isProd: false
// })

// const gameMock = {
//     events: new Emitter()
// }

// // vi.stubGlobal('bngVue', bngVueMock)
// vi.stubGlobal('$game', gameMock)

describe('Refuel/refuelStore Test', () => {
    // const app = createApp({
    //     provide: {
    //         $game: gameMock
    //     }
    // })

    beforeEach(() => {
        // const pinia = createPinia().use(({ store }) => {
        //     store.provide('$game', gameMock)
        // })
        // app.use(pinia)
        // setActivePinia(pinia)
    })

    it('Should have initial currentFuelData equal to first energyType value', async () => {
        const app = createApp({})

        const emitter = new Emitter()
        const $game = {
            events: emitter
        }
        const pinia = createPinia().use(() => ({ $game: $game}))

        app.use(pinia)
        setActivePinia(pinia)

        const refuelStore = useRefuelStore()
        const fuelData = {
            energyTypes: ["gasoline"],
            fuelData: [
                {
                    currentEnergy: 35,
                    energyType: 'gasoline',
                    maxEnergy: 35,
                    pricePerUnit: 1.9,
                    unit: 'L'
                }
            ]
        }


        $game.events.emit('initialFuelingData', fuelData)
        expect(refuelStore.currentFuelData).not.toBeUndefined()
    })
})