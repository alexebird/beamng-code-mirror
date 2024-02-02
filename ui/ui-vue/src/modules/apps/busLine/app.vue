<template>
    <div class="bus-line bng-app">
        <div class="content" :style="{ '--routeColor': routeColor }">
            <div class="header">
                <div class="time">{{ navDisplay.time }}</div>
                <div class="logo">
                    <img :src="getAssetURL('images/beamng_logo_50x50.png')" />
                </div>
            </div>
            <div class="route" :class="{'highlight': !stops || stops.length === 0}">
                <div class="route-id">
                    <span class="text">{{ routeId }}</span>
                    <span class="chevron"></span>
                </div>
                <div class="destination">{{ destination }}</div>
            </div>
            <div class="display-stops" v-if="stops">
                <div class="stop" v-for="stop in stops" :key="stop.id">
                    <div class="chevron"></div>
                    <div class="title">{{ stop.name }}</div>
                </div>
            </div>
            <div class="next-stop" v-if="nextStop">
                <div class="chevron"></div>
                <div class="title">
                    {{ nextStop.name }}
                </div>
            </div>
        </div>
        <div class="stop-request" :class="{ 'requested': navDisplay.stopRequested }">
            <div class="text" :class="{ glow: navDisplay.stopRequested }">{{ $t("ui.busRoute.stopRequested") }}
            </div>
        </div>
    </div>
</template>

<script>
const defaultRouteId = '00'
const defaultDestination = 'Not in service'
// const emptyStopMessage = "End of Line"
const defaultRouteColor = '#FFA200'
const totalRoutesDisplayed = 4
</script>

<script setup>
import { onMounted, onUnmounted, computed, ref, reactive, onBeforeMount } from 'vue'
import { useLibStore } from '@/services'
import { getAssetURL } from '@/utils'

const { $game } = useLibStore()

let timerInterval
const navDisplay = reactive({
    time: '',
    stopRequested: false
})

const localBusRoute = ref(null)

const routeId = computed(() => localBusRoute.value && localBusRoute.value.routeId ? localBusRoute.value.routeId.substring(0, 3) : defaultRouteId)
const destination = computed(() => localBusRoute.value && localBusRoute.value.destination ? localBusRoute.value.destination.substring(0, 20) : defaultDestination)
const routeColor = computed(() => localBusRoute.value && localBusRoute.value.routeColor ? localBusRoute.value.routeColor : defaultRouteColor)
const stops = computed(() => {
    if (!localBusRoute.value || !localBusRoute.value.stops)
        return null

    let data = localBusRoute.value.stops
        // remove last item since this is already displayed as destination
        .slice(0, -1)

    if (data.length > totalRoutesDisplayed) {
        // remove first item since this is already displayed as nextStop
        data = data.slice(1).slice(0, totalRoutesDisplayed)
    }

    return data.reverse()
})

const nextStop = computed(() => localBusRoute.value && localBusRoute.value.stops && 
    localBusRoute.value.stops.length - 1 > totalRoutesDisplayed ? localBusRoute.value.stops[0] : null)

onBeforeMount(() => {
    updateTime()

    timerInterval = setInterval(() => {
        updateTime()
    }, 1000)
})

onMounted(() => {
    $game.events.on('BusDisplayUpdate', onBusDisplayUpdate)
    $game.events.on('SetStopRequest', onSetStopRequest)
    $game.api.engineLua('if scenario_busdriver then scenario_busdriver.requestState() end')
})

onUnmounted(() => {
    clearInterval(timerInterval)
    $game.events.off('BusDisplayUpdate', onBusDisplayUpdate)
    $game.events.off('SetStopRequest', onSetStopRequest)
})

function onBusDisplayUpdate(data) {
    console.log('onBusDisplayUpdate', data)
    if (localBusRoute.value) {
        localBusRoute.value.routeId = data.routeId
        localBusRoute.value.stops = localBusRoute.value.stops.filter(x => data.tasklist.find(y => y[0] === x.id))
    } else {
        localBusRoute.value = parseBusData(data)
    }
}

function onSetStopRequest(data) {
    console.log('onSetStopRequest', data)

    if (data && data.stopRequested !== null) {
        navDisplay.stopRequested = data.stopRequested
    }
}

function updateTime() {
    const date = new Date(),
        hours = date.getHours(),
        minutes = date.getMinutes() < 10 ? ('0' + date.getMinutes()) : date.getMinutes()

    navDisplay.time = `${hours}:${minutes}`
}

function parseBusData(data) {
    return {
        destination: data.direction,
        routeId: data.routeId,
        routeColor: data.routeColor,
        stops: data.tasklist.map(x => ({id: x[0], name: x[1]}))
    }
}
</script>

<style scoped lang="scss">
.bus-line {
    display: flex;
    flex-direction: column;

    .chevron {
        position: relative;
        width: 15%;
        height: 100%;

        &::before {
            content: '';
            position: absolute;
            display: inline-block;
            width: 50%;
            height: 1.5em;
            left: 0;
            transform: skew(0, -25deg) translateY(-0.125em);
            background-color: var(--routeColor);
        }

        &::after {
            content: '';
            position: absolute;
            display: inline-block;
            width: 50%;
            height: 1.5em;
            right: 0;
            background: var(--routeColor);
            transform: skew(0, 25deg) translateY(-0.125em);
        }
    }

    >.content {
        display: flex;
        flex-direction: column;
        flex-grow: 1;
        background-color: white;
        color: black;
        font-family: Roboto;
        overflow: hidden;

        >.header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-top: 0;
            width: 100%;
            height: 10%;
            background-color: #393939;
            color: white;
            overflow: hidden;

            >.time {
                margin-left: 2%;
            }

            >.logo {
                width: 8%;

                >img {
                    margin: 0 auto;
                    width: 80%;
                }
            }
        }

        >.route {
            display: flex;
            width: 100%;
            margin-top: 0.125em;
            color: white;
            overflow: hidden;
            height: 15%;
            width: 100%;

            >.route-id {
                position: relative;
                display: flex;
                align-items: flex-start;
                justify-content: center;
                background-color: #393939;
                color: white;
                width: 15%;
                height: 100%;
                margin-left: 2%;

                >.text {
                    font-size: 20px;
                }

                >.chevron {
                    position: absolute;
                    display: inline-block;
                    height: 100%;
                    width: 100px;
                    transform: translateY(2.25em);

                    &::before {
                        content: '';
                        position: absolute;
                        display: inline-block;
                        height: 50px;
                        width: 50%;
                        left: 0;
                        background-color: white;
                        transform: skewY(-25deg);
                    }

                    &::after {
                        content: '';
                        position: absolute;
                        display: inline-block;
                        height: 50px;
                        width: 50%;
                        right: 0;
                        background: white;
                        transform: skewY(25deg);
                    }
                }
            }

            >.destination {
                display: flex;
                align-items: center;
                flex-grow: 1;
                padding: 0 0.5em;
                margin: 0 0.25em 0 0.5em;
                background-color: #393939;
                font-size: 20px;
            }

            &.highlight {
                >.route-id {
                    background: var(--routeColor);
                }

                >.destination {
                    background: var(--routeColor);
                }
            }
        }

        .display-stops {
            display: flex;
            flex-direction: column;
            flex-grow: 1;
            padding: 0.25em;
            padding-top: 0.5em;

            >.stop {
                display: flex;

                >.chevron {
                    width: 15%;
                    background: white;
                }

                >.title {
                    margin-left: 0.6em;
                    font-size: 20px;
                    flex-grow: 1;
                    background: #DFDFDF;
                    padding: 0.125em;
                }
            }
        }

        >.next-stop {
            display: flex;
            align-items: flex-start;
            width: 100%;
            padding: 0.25em;

            >.title {
                margin-left: 0.5em;
                padding: 0 0.5em;
                width: 85%;
                color: black;
                font-weight: bold;
                font-size: 20px;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
                background: var(--routeColor)
            }
        }
    }

    >.stop-request {
        display: flex;
        align-items: center;
        justify-content: center;
        background-color: #393939;
        padding: 1em;

        &.requested {
            animation: flickering 2s ease-in-out forwards;
            -webkit-animation: flickering 2s ease-in-out forwards;
            animation-iteration-count: 3;
            -webkit-animation-iteration-count: 3;
        }

        >.text {
            font-size: 19px;
            text-transform: uppercase;
            color: #4b4b4b;

            &.glow {
                color: #f74242;
                animation: glow 0.1s ease-in-out infinite alternate;
                -webkit-animation: glow 0.1s ease-in-out infinite alternate;
            }
        }
    }
}

@keyframes flickering {
    0% {
        box-shadow: 0px 0px 20px #f74242 inset;
    }

    50% {
        box-shadow: 0px 0px 40px #f74242 inset;
    }

    100% {
        box-shadow: 0px 0px 20px #f74242 inset;
    }
}

@keyframes glow {
    from {
        text-shadow: 0 0 2px #a62d2d, 0 0 4px #a62d2d, 0 0 6px #a62d2d, 0 0 8px #a62d2d, 0 0 10px #a62d2d, 0 0 12px #a62d2d, 0 0 14px #a62d2d;
    }

    to {
        text-shadow: 0 0 4px #a62d2d, 0 0 6px #a62d2d, 0 0 8px #a62d2d, 0 0 10px #a62d2d, 0 0 12px #a62d2d, 0 0 14px #a62d2d, 0 0 16px #a62d2d;
    }
}
</style>