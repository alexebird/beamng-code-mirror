<template>
    <div class="computer-mainmenu">
        <div v-for="menuList in menuItems" :key="menuList.key" class="mainmenu-list">
            <div class="label">
                <b>{{ menuList.label }}</b>
            </div>
            <div class="content">
                <div v-for="menuListItem in menuList.items" :key="menuListItem.key" class="mainmenu-item"
                    :class="{ disabled: menuList.disabled || menuListItem.disabled }"
                    @click="() => !menuList.disabled ? emits('menuItemClick', menuListItem.key) : null">
                    <div class="item-icon">
                        <bng-icon class="icon" span :type="icons.drive.career" />
                    </div>
                    <div class="item-label">
                        {{ menuListItem.label }}
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { BngIcon } from "@/common/components/base"
import { icons } from "@/common/components/base/bngIcon.vue"

const props = defineProps({
    menuItems: {
        type: Array,
        required: true
    }
})
const emits = defineEmits(['menuItemClick'])
</script>

<style scoped lang="scss">
.computer-mainmenu {
    user-select: none;
    
    >.mainmenu-list {
        >.content {
            display: flex;
            align-items: center;
            padding: 0.5em 0;

            &:not(:last-child) {
                margin-bottom: 0.25em;
            }

            >.mainmenu-item {
                &:not(:last-child) {
                    margin-right: 0.75em;
                }
            }
        }
    }
}

.mainmenu-item {
    display: flex;
    flex-direction: column;
    height: 8em;
    width: 8em;
    padding: 0.5em;
    border-radius: 0.25em;
    background: rgba(0, 0, 0, 0.5);
    cursor: pointer;
    user-select: none;
    color: white;

    >.item-icon {
        flex-grow: 1;
        text-align: center;

        >.icon {
            width: 5em;
            height: 5em;
        }
    }

    >.item-label {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        text-align: center;
    }

    &.disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }
}
</style>