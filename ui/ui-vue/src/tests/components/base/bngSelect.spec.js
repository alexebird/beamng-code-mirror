import { describe, it, expect } from 'vitest'
import { shallowMount } from '@vue/test-utils'
import { BngSelect } from '@/common/components/base'

const previousButtonId = '[data-testid="previous-btn"]'
const nextButtonId = '[data-testid="next-btn"]'
const valueChangedEventName = 'valueChanged'

describe('bngSelect.vue Test', () => {
    it('should emit valueChanged on click previous button', async () => {
        const wrapper = shallowMount(BngSelect, {
            props: {
                value: 2,
                options: [1, 2, 3]
            }
        })
        const button = wrapper.find(previousButtonId)

        await button.trigger('click')

        expect(wrapper.emitted()).toHaveProperty(valueChangedEventName)
        expect(wrapper.emitted(valueChangedEventName)[0]).toEqual([1, 1, 1])
    })

    it('should emit valueChanged on click next button', async () => {
        const wrapper = shallowMount(BngSelect, {
            props: {
                value: 2,
                options: [1, 2, 3]
            }
        })
        const button = wrapper.find(nextButtonId)

        await button.trigger('click')

        expect(wrapper.emitted()).toHaveProperty(valueChangedEventName)
        expect(wrapper.emitted(valueChangedEventName)[0]).toEqual([3, 3, 3])
    })

    it('should not emit valueChanged on click previous button with loop set to false', async () => {
        const wrapper = shallowMount(BngSelect, {
            props: {
                options: [1, 2, 3]
            }
        })
        const button = wrapper.find(previousButtonId)

        await button.trigger('click')

        expect(wrapper.emitted()).not.toHaveProperty(valueChangedEventName)
    })

    it('should emit valueChanged on click previous button with loop set to true', async () => {
        const wrapper = shallowMount(BngSelect, {
            props: {
                options: [1, 2, 3],
                loop: true
            }
        })
        const button = wrapper.find(previousButtonId)

        await button.trigger('click')

        expect(wrapper.emitted(valueChangedEventName)).toHaveLength(1)
        expect(wrapper.emitted(valueChangedEventName)[0]).toEqual([3, 3, 3])
    })

    it('should not emit valueChanged on click next button with loop set to false', async () => {
        const wrapper = shallowMount(BngSelect, {
            props: {
                value: 3,
                options: [1, 2, 3]
            }
        })

        const button = wrapper.find(nextButtonId)

        await button.trigger('click')

        expect(wrapper.emitted()).not.toHaveProperty(valueChangedEventName)
    })

    it('should emit valueChanged on click next button with loop set to true', async () => {
        const wrapper = shallowMount(BngSelect, {
            props: {
                value: 3,
                options: [1, 2, 3],
                loop: true
            }
        })
        const button = wrapper.find(previousButtonId)

        await button.trigger('click')

        expect(wrapper.emitted(valueChangedEventName)).toHaveLength(1)
        expect(wrapper.emitted(valueChangedEventName)[0]).toEqual([2, 2, 2])
    })

    it('should emit valueChanged on click previous button with config set', async () => {
        const options = [
            { l: 'this', v: 'THIS' },
            { l: 'is', v: 'IS' },
            { l: 'looping', v: 'LOOPING' }
        ]
        const wrapper = shallowMount(BngSelect, {
            props: {
                value: options[1].v,
                options: options,
                config: {
                    label: x => x.l,
                    value: x => x.v
                }
            }
        })
        const button = wrapper.find(previousButtonId)

        await button.trigger('click')

        expect(wrapper.emitted()).toHaveProperty(valueChangedEventName)
        expect(wrapper.emitted(valueChangedEventName)[0]).toEqual([options[0].v, options[0].l, options[0]])
    })

    it('should emit valueChanged on click previous button with config set and loop set to true', async () => {
        const options = [
            { l: 'this', v: 'THIS' },
            { l: 'is', v: 'IS' },
            { l: 'looping', v: 'LOOPING' }
        ]
        const wrapper = shallowMount(BngSelect, {
            props: {
                value: options[0].v,
                options: options,
                loop: true,
                config: {
                    label: x => x.l,
                    value: x => x.v
                }
            }
        })
        const button = wrapper.find(previousButtonId)

        await button.trigger('click')

        expect(wrapper.emitted()).toHaveProperty(valueChangedEventName)
        expect(wrapper.emitted(valueChangedEventName)[0]).toEqual([options[2].v, options[2].l, options[2]])
    })

    it('should emit valueChanged on click next button with config set', async () => {
        const options = [
            { l: 'this', v: 'THIS' },
            { l: 'is', v: 'IS' },
            { l: 'looping', v: 'LOOPING' }
        ]
        const wrapper = shallowMount(BngSelect, {
            props: {
                value: options[1].v,
                options: options,
                config: {
                    label: x => x.l,
                    value: x => x.v
                }
            }
        })
        const button = wrapper.find(nextButtonId)

        await button.trigger('click')

        expect(wrapper.emitted()).toHaveProperty(valueChangedEventName)
        expect(wrapper.emitted(valueChangedEventName)[0]).toEqual([options[2].v, options[2].l, options[2]])
    })

    it('should emit valueChanged on click next button with config set and loop set to true', async () => {
        const options = [
            { l: 'this', v: 'THIS' },
            { l: 'is', v: 'IS' },
            { l: 'looping', v: 'LOOPING' }
        ]
        const wrapper = shallowMount(BngSelect, {
            props: {
                value: options[2].v,
                options: options,
                loop: true,
                config: {
                    label: x => x.l,
                    value: x => x.v
                }
            }
        })
        const button = wrapper.find(nextButtonId)

        await button.trigger('click')

        expect(wrapper.emitted()).toHaveProperty(valueChangedEventName)
        expect(wrapper.emitted(valueChangedEventName)[0]).toEqual([options[0].v, options[0].l, options[0]])
    })
})