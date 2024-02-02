import { describe, it, expect } from 'vitest'
import { shallowMount } from '@vue/test-utils'
import { BngInput } from '@/common/components/base'

const inputId = '[data-testid="input"]'
const externalLabelId = '[data-testid="external-label"]'
const leadingIconId = '[data-testid="leading-icon"]'
const trailingIconId = '[data-testid="trailing-icon"]'
const externalTrailingIconId = '[data-testid="external-trailing-icon"]'
const prefixId = '[data-testid="prefix"]'
const suffixId = '[data-testid="suffix"]'
const floatingLabelId = '[data-testid="floating-label"]'
const errorMessageId = '[data-testid="error-message"]'

describe('BngInput.vue Test', () => {
    it('should have input initial value equal prop value', async () => {
        const initialValue = 'test'
        const wrapper = shallowMount(BngInput, {
            props: {
                initialValue: initialValue
            }
        })
        const input = wrapper.find(inputId)

        expect(input.element.value).toEqual(initialValue)
    })

    it('should emit valueChanged on input focus out', async () => {
        const wrapper = shallowMount(BngInput)
        const input = wrapper.find(inputId)
        const inputValue = 'test'

        await input.setValue(inputValue)
        await input.trigger('focusout')

        expect(wrapper.emitted('valueChanged')).toHaveLength(1)
        expect(wrapper.emitted('valueChanged')[0]).toEqual([inputValue])
    })

    it('should have external label if set', async () => {
        const externalLabelText = 'label'
        const wrapper = shallowMount(BngInput, {
            props: {
                externalLabel: externalLabelText
            }
        })
        const externalLabel = wrapper.find(externalLabelId)

        expect(externalLabel.exists()).toBe(true)
        expect(externalLabel.element.textContent).toEqual(externalLabelText)
    })

    it('should have leading icon if set', async () => {
        const wrapper = shallowMount(BngInput, {
            props: {
                // Should be a bng icon or an asset URL
                leadingIcon: 'dummy value'
            }
        })

        expect(wrapper.find(leadingIconId).exists()).toBe(true)
    })

    it('should have trailing icon if set', async () => {
        const wrapper = shallowMount(BngInput, {
            props: {
                // Should be a bng icon or an asset URL
                trailingIcon: 'dummy value'
            }
        })

        expect(wrapper.find(trailingIconId).exists()).toBe(true)
    })

    it('should have external trailing icon if set', async () => {
        const wrapper = shallowMount(BngInput, {
            props: {
                // Should be a bng icon or an asset URL
                trailingIcon: 'dummy value',
                trailingIconOutside: true
            }
        })

        expect(wrapper.find(externalTrailingIconId).exists()).toBe(true)
    })

    it('should have suffix if set', async () => {
        const suffixText = 'suffix text'
        const wrapper = shallowMount(BngInput, {
            props: {
                suffix: suffixText
            }
        })
        const suffix = wrapper.find(suffixId)

        expect(suffix.exists()).toBe(true)
        expect(suffix.element.textContent).toEqual(suffixText)
    })

    it('should have prefix if set', async () => {
        const prefixText = 'prefix text'
        const wrapper = shallowMount(BngInput, {
            props: {
                prefix: prefixText
            }
        })
        const prefix = wrapper.find(prefixId)

        expect(prefix.exists()).toBe(true)
        expect(prefix.element.textContent).toEqual(prefixText)
    })

    it('should have error message if invalid', async () => {
        const wrapper = shallowMount(BngInput, {
            props: {
                validate: (value) => false
            }
        })
        const errorMessage = wrapper.find(errorMessageId)

        expect(errorMessage.exists()).toBe(true)
    })

    it('should not have optional elements if not set', async () => {
        const wrapper = shallowMount(BngInput)

        expect(wrapper.find(externalLabelId).exists()).toBe(false)
        expect(wrapper.find(leadingIconId).exists()).toBe(false)
        expect(wrapper.find(trailingIconId).exists()).toBe(false)
        expect(wrapper.find(externalTrailingIconId).exists()).toBe(false)
        expect(wrapper.find(prefixId).exists()).toBe(false)
        expect(wrapper.find(suffixId).exists()).toBe(false)
        expect(wrapper.find(floatingLabelId).exists()).toBe(false)
        expect(wrapper.find(errorMessageId).exists()).toBe(false)
    })
})