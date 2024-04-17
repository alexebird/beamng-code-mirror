import { onMounted } from "vue"
import { BNG_DRAGGABLE_NAME, DRAG_EVENTS } from "@/common/directives/BngDraggable"

export const INTERSECTION_TYPES = Object.freeze({
  top: "top",
  bottom: "bottom",
  sub: "sub",
  topLeft: "topLeft",
  topRight: "topRight",
  bottomLeft: "bottomLeft",
  bottomRight: "bottomRight",
})

export function useSortable(el, config) {
  const dragOverCallback = config.ondragover
  const dragStartCallback = config.ondragstart
  const dragEndCallback = config.ondragend
  const canSort = config.canSort
  const getIntersection = config.getIntersection
  const getIntersectionOffsets = config.getIntersectionOffsets

  let targetElementSrc
  let closestElement

  onMounted(() => {
    el.value.addEventListener(DRAG_EVENTS.dragStart, onItemDragStart)
    el.value.addEventListener(DRAG_EVENTS.dragOver, onItemDragOver)
    el.value.addEventListener(DRAG_EVENTS.dragEnd, onItemDragEnd)
  })

  function onItemDragStart(event) {
    // console.log("sortable drag start", event)
    targetElementSrc = event.target
    const data = { dragElement: event.detail.data }
    if (dragStartCallback) dragStartCallback(data)
  }

  function onItemDragOver(event) {
    // console.log("sortable drag over", event)
    const sortableItems = getSortableItems()
    let smallestDistance = Infinity

    if (closestElement) resetTargetElementStyles(closestElement)

    sortableItems.forEach(element => {
      const draggable = event.detail.ghostEl
      if (targetElementSrc !== element && isIntersecting(draggable, element)) {
        let distance = calculateDistance(draggable, element)
        if (distance < smallestDistance) {
          smallestDistance = distance
          closestElement = element
        }
      }
    })

    // console.log("closestElement", closestElement)

    if (!closestElement) return

    const draggableRect = event.detail.ghostEl.getBoundingClientRect()
    const targetRect = closestElement.getBoundingClientRect()
    const topLeftPoint = { x: draggableRect.left, y: draggableRect.top }
    const intersectionType = getSectionForPoint(targetRect, topLeftPoint)

    if (!intersectionType) return

    const sortableData = buildSortableData(event.detail.el.dataset, closestElement.dataset, intersectionType)
    const enabled = !canSort || (canSort && canSort(sortableData))

    // console.log("enabled", enabled)

    if (enabled) {
      closestElement.classList.add("draggable-target")

      closestElement.classList.add(`target-${intersectionType}`)

      if (dragOverCallback) dragOverCallback(sortableData)
    }
  }

  function onItemDragEnd(event) {
    // console.log("sortable drag end", event)
    resetTargetElementStyles(closestElement)

    const draggableRect = event.detail.ghostEl.getBoundingClientRect()
    const targetRect = closestElement.getBoundingClientRect()
    const topLeftPoint = { x: draggableRect.left, y: draggableRect.top }
    const sectionIntersection = getSectionForPoint(targetRect, topLeftPoint)

    const sortData = buildSortableData(event.detail.el.dataset, closestElement.dataset, sectionIntersection)

    if (canSort && !canSort(sortData)) return

    if (dragEndCallback) dragEndCallback(sortData)
  }

  function getSectionForPoint(targetRect, point) {
    let sections
    if (getIntersectionOffsets) {
      sections = getIntersectionOffsets(targetRect, point)
    } else {
      sections = {
        [INTERSECTION_TYPES.top]: {
          x: targetRect.left - 8,
          y: targetRect.top,
          width: targetRect.width,
          height: (targetRect.height / 2) + 8,
        },
        [INTERSECTION_TYPES.bottom]: {
          x: targetRect.left,
          y: targetRect.bottom - 8,
          width: 24,
          height: (targetRect.height / 2) + 8,
        },
        [INTERSECTION_TYPES.sub]: {
          x: targetRect.left + 24,
          y: targetRect.bottom - 8,
          width: targetRect.width - 24,
          height: (targetRect.height / 2) + 8,
        },
        // [INTERSECTION_TYPES.topLeft]: {
        //   x: targetRect.left,
        //   y: targetRect.top,
        //   width: targetRect.width / 2,
        //   height: targetRect.height / 2,
        // },
        // [INTERSECTION_TYPES.topRight]: {
        //   x: targetRect.right - targetRect.width / 2,
        //   y: targetRect.top,
        //   width: targetRect.width / 2,
        //   height: targetRect.height / 2,
        // },
        // [INTERSECTION_TYPES.bottomLeft]: {
        //   x: targetRect.left,
        //   y: targetRect.bottom - targetRect.height / 2,
        //   width: targetRect.width / 2,
        //   height: targetRect.height / 2,
        // },
        // [INTERSECTION_TYPES.bottomRight]: {
        //   x: targetRect.right - targetRect.width / 2,
        //   y: targetRect.bottom - targetRect.height / 2,
        //   width: targetRect.width / 2,
        //   height: targetRect.height / 2,
        // },
      }
    }

    let intersectingSection
    for (let section in sections) {
      const sec = sections[section]
      if (point.x >= sec.x && point.x <= sec.x + sec.width && point.y >= sec.y && point.y <= sec.y + sec.height) {
        intersectingSection = section
        break
      }
    }

    return intersectingSection
  }

  function isIntersecting(element1, element2) {
    const rect1 = element1.getBoundingClientRect()
    const rect2 = element2.getBoundingClientRect()

    return !(rect1.top > rect2.bottom || rect1.right < rect2.left || rect1.bottom < rect2.top || rect1.left > rect2.right)
  }

  function calculateDistance(element1, element2) {
    const rect1 = element1.getBoundingClientRect()
    const rect2 = element2.getBoundingClientRect()

    const centerX1 = rect1.left
    const centerY1 = rect1.top
    const centerX2 = rect2.left + rect2.width / 2
    const centerY2 = rect2.top + rect2.height / 2

    const distance = Math.sqrt(Math.pow(centerX2 - centerX1, 2) + Math.pow(centerY2 - centerY1, 2))
    return distance
  }

  function resetTargetElementStyles(targetElement) {
    targetElement.classList.remove("draggable-target")
    Object.keys(INTERSECTION_TYPES).forEach(type => targetElement.classList.remove(`target-${type}`))
  }

  function getSortableItems() {
    const items = el.value.querySelectorAll(`[${BNG_DRAGGABLE_NAME}]`)
    return items
  }

  function buildSortableData(drag, target, intersection) {
    return {
      key: drag.draggableKey,
      oldIndex: parseInt(drag.draggableIndex),
      oldParentKey: drag.draggableParentKey,
      newIndex: parseInt(target.draggableIndex),
      newParentKey: intersection === INTERSECTION_TYPES.sub ? target.draggableKey : target.draggableParentKey,
      intersectionType: intersection,
      draggableDataset: { ...drag },
      targetDataset: { ...target },
    }
  }
}
