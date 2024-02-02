import { describe, it, expect } from 'vitest'
import { shallowMount } from '@vue/test-utils'
import MilestoneScoreListCard from '@/modules/milestones/components/MilestoneScoreListCard'
import MilestoneScoreCard from '@/modules/milestones/components/MilestoneScoreCard'
import { MilestoneType } from '@/modules/milestones/milestoneTypes'

describe('MilestoneScoreListCard.vue Test', () => {
    it('empty scores', () => {
        const wrapper = shallowMount(MilestoneScoreListCard, {
            propsData: {
                scores: [],
            }
        })
        expect(wrapper.findComponent(MilestoneScoreCard).exists()).toBe(false)
    })

    it('renders all scores', () => {
        const scores = [{type: MilestoneType.Beambuck, description: 'random1'}]
        const wrapper = shallowMount(MilestoneScoreListCard, {
            propsData: {
                scores: scores,
            }
        })
        expect(wrapper.findAllComponents(MilestoneScoreCard).length).toBe(scores.length)
    })

    it('renders all scores with visibleCard greater than total', () => {
        const scores = [
            {type: MilestoneType.Beambuck, description: 'random1'},
            {type: MilestoneType.BeamXp, description: 'random2'},
            {type: MilestoneType.Beambuck, description: 'random3'},
        ]
        const wrapper = shallowMount(MilestoneScoreListCard, {
            propsData: {
                scores: scores,
                visibleCards: scores.length + 1
            }
        })
        expect(wrapper.findAllComponents(MilestoneScoreCard).length).toBe(scores.length)
    })

    it('renders only specified visibleCard', () => {
        const scores = [
            {type: MilestoneType.Beambuck, description: 'random1'},
            {type: MilestoneType.BeamXp, description: 'random2'},
            {type: MilestoneType.Beambuck, description: 'random3'},
        ]
        const visibleCards = 1
        const wrapper = shallowMount(MilestoneScoreListCard, {
            propsData: {
                scores: scores,
                visibleCards: visibleCards
            }
        })
        expect(wrapper.findAllComponents(MilestoneScoreCard).length).toBe(visibleCards)
    })
})