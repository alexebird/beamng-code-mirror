import { describe, it, expect } from 'vitest'
import { shallowMount, mount } from '@vue/test-utils'
import { BngSlider } from '@/common/components/base'

const valueChangedEventName = 'valueChanged'

describe('bngSlider.vue Test', () => {
    it('should emit valueChanged event on input value changed', async () => {
        const wrapper = mount(BngSlider, {props: {max: 100}})
        const input = wrapper.find('input')

        await input.setValue(30)

        expect(wrapper.emitted(valueChangedEventName).length).toEqual(1)
        expect(wrapper.emitted(valueChangedEventName)[0]).toEqual(['30'])
    })

    it('should not emit valueChanged event when disabled', async () => {
        const wrapper = shallowMount(BngSlider, {props: {disabled: true, max: 100}})
        const input = wrapper.find('input')

        await input.setValue(1)

        expect(wrapper.emitted()).not.toHaveProperty(valueChangedEventName)
    })

    it('should have initial value equal to min prop if value is less than min prop', () => {
        const min = 10
        const wrapper = shallowMount(BngSlider, {props: {value: 0, min: min, max: 100}})
        const input = wrapper.find('input')
        
        expect(input.element.value).toBe(min.toString())
    })

    it('should have min equal to min prop', () => {
        const min = 10
        const wrapper = shallowMount(BngSlider, {props: {min: min, max: 100}})
        
        expect(wrapper.attributes('min')).toEqual(min.toString())
    })

    it('should have max equal to max prop', () => {
        const max = 100
        const wrapper = shallowMount(BngSlider, {props: {max: max}})
        
        expect(wrapper.attributes('max')).toEqual(max.toString())
    })

    it('should have step equal to step prop', () => {
        const step = 10
        const wrapper = shallowMount(BngSlider, {props: {step: step, max: 100}})
        
        expect(wrapper.attributes('step')).toEqual(step.toString())
    })

    it('should be navigatable when enabled', () => {
        const wrapper = shallowMount(BngSlider, {props: {max: 100}})
        
        expect(wrapper.attributes('tabindex')).toEqual('0')
    })

    it('should not be navigatable when disabled', () => {
        const wrapper = shallowMount(BngSlider, {props: {max: 100, disabled: true}})
        
        expect(wrapper.attributes('tabindex')).toEqual('-1')
    })

    it('should be navigatable when enabled', () => {
        const wrapper = shallowMount(BngSlider, {props: {max: 100}})
        
        expect(wrapper.attributes('tabindex')).toEqual('0')
    })

    it('should not be disabled when prop disabled is false', () => {
        const wrapper = shallowMount(BngSlider, {props: {max: 100, disabled: false}})
        
        expect(wrapper.attributes('disabled')).toBeUndefined()
    })

    it('should be disabled when prop disabled is true', () => {
        const wrapper = shallowMount(BngSlider, {props: {max: 100, disabled: true}})
        
        expect(wrapper.attributes('disabled')).not.toBeUndefined()
    })
})