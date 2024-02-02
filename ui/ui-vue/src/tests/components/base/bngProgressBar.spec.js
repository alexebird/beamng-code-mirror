import { describe, it, expect } from 'vitest'
import { shallowMount } from '@vue/test-utils'
import { BngProgressBar } from '@/common/components/base'

const valueLabelId = '[data-testid="value-label"]'

describe('BngProgressBar.vue Test', () => {
    it('should have value equal to min prop if value is less than min prop', async () => {
        const min = 10
        const wrapper = shallowMount(BngProgressBar, { props: { value: 0, min: min, max: 100 } })
        const label = wrapper.find(valueLabelId)

        await wrapper.vm.$nextTick()

        expect(label.text()).toMatch(min.toString())
    })

    it('should increase value if increaseValueBy invoked', async () => {
        const value = 10, increaseBy = 20
        const wrapper = shallowMount(BngProgressBar, { props: { value: value, min: 0, max: 100 } })
        const label = wrapper.find(valueLabelId)

        wrapper.vm.increaseValueBy(increaseBy)

        await wrapper.vm.$nextTick()

        expect(label.text()).toMatch((value + increaseBy).toString())
    })

    it('should decrease value if decreaseValueBy invoked', async () => {
        const value = 30, decreaseBy = 20
        const wrapper = shallowMount(BngProgressBar, { props: { value: value, min: 0, max: 100 } })
        const label = wrapper.find(valueLabelId)

        wrapper.vm.decreaseValueBy(decreaseBy)
        
        await wrapper.vm.$nextTick()

        expect(label.text()).toMatch((value - decreaseBy).toString())
    })

    it('should set new value if setValue invoked', async () => {
        const value = 30
        const wrapper = shallowMount(BngProgressBar, { props: { value: value, min: 0, max: 100 } })
        const label = wrapper.find(valueLabelId)

        wrapper.vm.updateCurrentValue(30)
        
        await wrapper.vm.$nextTick()

        expect(label.text()).toMatch((value).toString())
    })
})