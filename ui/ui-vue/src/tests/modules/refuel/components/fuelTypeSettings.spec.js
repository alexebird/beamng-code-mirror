import { vi, describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import FuelTypeSettings from '@/modules/refuel/components/FuelTypeSettings'

const bngVueMock = vi.fn(() => {
    isProd: false
})

vi.stubGlobal('bngVue', bngVueMock)

describe('Refuel/FuelNozzle.vue Test', () => {
    it('Previous button clicked should emit previousClick', async () => {
        const wrapper = mount(FuelTypeSettings, {
            props: {
                htmlId: 'fuelTypeSettings',
                fuelOptions: [
                    { id: 1, value: 0, name: "FuelType-1" },
                    { id: 2, value: 1, name: "FuelType-2" },
                    { id: 3, value: 2, name: "FuelType-3" }
                ]
            }
        })
        const previousButton = wrapper.find('[data-testid="previous-btn"')

        await previousButton.trigger('click')

        expect(wrapper.emitted('previousClick')).toHaveLength(1)
    })

    it('Next button clicked should emit nextClick', async () => {
        const wrapper = mount(FuelTypeSettings, {
            props: {
                htmlId: 'fuelTypeSettings',
                fuelOptions: [
                    { id: 1, value: 0, name: "FuelType-1" },
                    { id: 2, value: 1, name: "FuelType-2" },
                    { id: 3, value: 2, name: "FuelType-3" }
                ]
            }
        })
        const previousButton = wrapper.find('[data-testid="next-btn"')

        await previousButton.trigger('click')

        expect(wrapper.emitted('nextClick')).toHaveLength(1)
    })
})