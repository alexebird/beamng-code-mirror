import { vi, describe, it, expect, beforeAll } from 'vitest'
import { mount } from '@vue/test-utils'
import { BngPillCheckbox, BngPill } from '@/common/components/base'

const valueChangedEvent = 'valueChanged'

const bngVueMock = vi.fn(() => {
    isProd: false
})

vi.stubGlobal('bngVue', bngVueMock)

describe('BngPillCheckbox.vue Test', () => {
    it('should emit valueChanged on click', async () => {
        const wrapper = mount(BngPillCheckbox)
        const bngPill = wrapper.findComponent(BngPill)

        await bngPill.trigger('click')

        expect(wrapper.emitted(valueChangedEvent)).toHaveLength(1)
        expect(wrapper.emitted(valueChangedEvent)[0]).toEqual([true])
    })

    it('should emit valueChanged on keyup.space', async () => {
        const wrapper = mount(BngPillCheckbox)
        const bngPill = wrapper.findComponent(BngPill)

        await bngPill.trigger('keyup.space')

        expect(wrapper.emitted(valueChangedEvent)).toHaveLength(1)
        expect(wrapper.emitted(valueChangedEvent)[0]).toEqual([true])
    })
})