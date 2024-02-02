import { describe, it, expect } from 'vitest'
import { shallowMount } from '@vue/test-utils'
import { BngSwitch } from '@/common/components/base'

const valueChangedEventName = 'valueChanged'

describe('bngSwitch.vue Test', () => {
    it('should emit valueChanged event on click', async () => {
        const wrapper = shallowMount(BngSwitch)

        await wrapper.trigger('click')

        expect(wrapper.emitted(valueChangedEventName)).toHaveLength(1)
        expect(wrapper.emitted(valueChangedEventName)[0]).toEqual([true])
    })

    it('should emit valueChanged event on space key ', async () => {
        const wrapper = shallowMount(BngSwitch)

        await wrapper.trigger('keyup.space')

        expect(wrapper.emitted(valueChangedEventName)).toHaveLength(1)
        expect(wrapper.emitted(valueChangedEventName)[0]).toEqual([true])
    })

    it('should not emit valueChanged event on click when disabled ', async () => {
        const wrapper = shallowMount(BngSwitch, {propsData: {disabled: true}})

        await wrapper.trigger('click')

        expect(wrapper.emitted()).not.toHaveProperty(valueChangedEventName)
    })

    it('should not emit valueChanged event on space key when disabled', async () => {
        const wrapper = shallowMount(BngSwitch, {propsData: {disabled: true}})

        await wrapper.trigger('keyup.space')

        expect(wrapper.emitted()).not.toHaveProperty(valueChangedEventName)
    })

    it('should be navigatable when enabled', async () => {
        const wrapper = shallowMount(BngSwitch)
        expect(wrapper.attributes('tabindex')).toEqual('0')
    })

    it('should not be navigatable when disabled', async () => {
        const wrapper = shallowMount(BngSwitch, {propsData: {disabled: true}})
        expect(wrapper.attributes('tabindex')).toEqual('-1')
    })
})