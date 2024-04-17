// this directive focuses on an element
import { nextTick } from "vue"

export default (el, { value }) => value && nextTick(() => el.focus())
