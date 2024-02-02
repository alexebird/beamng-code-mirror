import { describe, it, expect } from 'vitest'
import { shallowMount } from '@vue/test-utils'
import { BngPill } from '@/common/components/base'

describe('BngPill.vue Test', () => {
    it('should be navigatable if click event is set', async () => {
        const wrapper = shallowMount(BngPill, {
            attrs: { onClick: () => {}}
        })

        expect(wrapper.attributes('tabindex')).toEqual('0')
    })

    it('should not be navigatable if click event is not set', async () => {
        const wrapper = shallowMount(BngPill)

        expect(wrapper.attributes('tabindex')).toEqual('-1')
    })
})