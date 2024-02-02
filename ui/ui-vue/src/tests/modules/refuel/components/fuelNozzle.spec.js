import { vi, describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import FuelNozzle from '@/modules/refuel/components/FuelNozzle'
import { BngButton } from '@/common/components/base'

const bngVueMock = vi.fn(() => {
    isProd: false
})

vi.stubGlobal('bngVue', bngVueMock)

describe('Refuel/FuelNozzle.vue Test', () => {
    it('Button mouse down should emit triggerDown', async () => {
        const wrapper = mount(FuelNozzle, {
            props: {
                refuelType: 'fuel',
            }
        })
        const bngButton = wrapper.findComponent(BngButton)

        await bngButton.trigger('mousedown')
        expect(wrapper.emitted('triggerDown')).toHaveLength(1)
    })

    it('Button mouse up should emit triggerUp', async () => {
        const wrapper = mount(FuelNozzle, {
            props: {
                refuelType: 'fuel',
            }
        })
        const bngButton = wrapper.findComponent(BngButton)

        await bngButton.trigger('mouseup')
        expect(wrapper.emitted('triggerUp')).toHaveLength(1)
    })
})
