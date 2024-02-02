import { ref, computed, watch, onUnmounted } from "vue"

const UNIQUE_CLEAN_VALUE = Symbol("Unique 'clean' value from Dirty service code")

/**
 * Sets up `dirty` property and `setDirty(state)` with `markClean()` reset functions for the component.
 *
 * @param      {Proxy}     valueRef       Value reference. If value does not expected to be initialised immediately,
 *                                        please keep valueRef.value as undefined or call `dirty.markClean()` after
 *                                        initialisation.
 * @param      {*}         [emitter]      `defineEmits` return value. If specified, will emit `dirtied` event with
 *                                        `(newVal, initialVal)` arguments when it's `dirty`. Note: Event name must be
 *                                        specified in `defineEmits`.
 * @param      {Function}  [setCallback]  Function to call after `dirty.setDirty()` or `dirty.markClean()` are called as
 *                                        `setCallback(newVal, oldVal)`
 *
 * @example
 *  // Basic
 *  const value = ref();
 *  defineExpose(useDirty(value));
 *
 *  // With `dirtied` event
 *  const value = ref();
 *  const emitter = defineEmits(["dirtied"]);
 *  defineExpose(useDirty(value, emitter));
 *
 *  // With `setDirty`/`markClean` callback
 *  const value = ref();
 *  defineExpose(useDirty(value, null,
 *    (newVal, oldVal) => console.log(`Dirty state cleaned from "${oldVal}" to "${newVal}`)
 *  ));
 *
 *  // With internal access
 *  const value = ref();
 *  const dirty = useDirty(value);
 *  function cleanClick() {
 *    if (dirty.dirty.value)
 *      dirty.markClean();
 *    else
 *      console.log("Was already clean!");
 *  }
 * @return     {Object}    Object containing a 'dirty' ref, a computed value for getting the current 'clean' value, a
 *                         function for setting the dirtiness, a 'markClean' convenience function
 */
export function useDirty(valueRef, emitter = undefined, setCallback = undefined) {
  if (!valueRef) throw new Error("valueRef must be specified")

  let hasInitValue = false // not required to be reactive because valueRef will trigger the change anyway
  const initialValue = ref()

  function init(val) {
    const type = typeof val
    if (type === "undefined" || (type === "number" && isNaN(val))) return // ignore invalid values
    hasInitValue = true
    initialValue.value = val
  }

  init(valueRef.value)

  // setup one-time watcher if there's no value yet
  if (!hasInitValue) {
    const unwatch = watch(valueRef, newVal => {
      init(newVal)
      if (hasInitValue) unwatch()
    })
    onUnmounted(() => !hasInitValue && unwatch())
  }

  const dirty = computed(() => {
    const isDirty = valueRef.value !== initialValue.value
    if (isDirty && hasInitValue && emitter) emitter("dirtied", valueRef.value, initialValue.value)
    return isDirty
  })

  const setDirty = state => {
    const oldVal = initialValue.value
    const newVal = state ? UNIQUE_CLEAN_VALUE : valueRef.value
    initialValue.value = newVal
    typeof setCallback === "function" && setCallback(newVal, oldVal)
  }

  return {
    dirty,
    currentCleanValue: computed(() => initialValue.value),
    setDirty,
    markClean: () => setDirty(false),
  }
}
