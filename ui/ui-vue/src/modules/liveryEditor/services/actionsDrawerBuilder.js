import { icons } from "@/common/components/base"

const FIRST_LAYER_ACTIONS = [
  {
    value: "transform",
    label: "Transform",
    icon: icons.transform,
    order: 1,
  },
  {
    value: "ungroup",
    label: "Ungroup",
    icon: icons.group,
    order: 1,
  },
  {
    value: "group",
    label: "Group",
    icon: icons.group,
    order: 1,
  },
  {
    value: "material",
    label: "Material",
    icon: icons.material,
    order: 2,
  },
  {
    value: "order",
    label: "Change Order",
    icon: icons.order,
    order: 3,
    items: [
      {
        value: "order_up",
        label: "Move up",
        order: 1,
        icon: icons.arrowLargeUp,
      },
      {
        value: "order_down",
        label: "Move down",
        order: 2,
        icon: icons.arrowLargeDown,
      },
    ],
  },
  {
    value: "duplicate",
    label: "Duplicate",
    icon: icons.copy,
    order: 4,
  },
  {
    value: "mirror",
    label: "Mirror",
    icon: icons.reflect,
    order: 5,
  },
  {
    value: "delete",
    label: "Delete",
    icon: icons.trashBin2,
    order: 7,
  },
]

const OPTIONS_LAYER_ACTION = {
  value: "options",
  label: "Options",
  icon: icons.reconfigure,
  order: 6,
}

const OPTIONS_CHILDREN_ACTIONS = [
  {
    value: "rename",
    label: "Rename",
    icon: icons.rename,
    order: 1,
  },
  {
    value: "visibility",
    label: "Hide",
    icon: icons.eyeOutlineClosed,
    order: 2,
    toggleAction: true,
    inactiveLabel: "Show",
    inactiveIcon: icons.eyeOutlineOpened,
  },
  {
    value: "lock",
    label: "Unlock",
    icon: icons.lockOpened,
    order: 3,
    toggleAction: true,
    inactiveLabel: "Lock",
    inactiveIcon: icons.lockClosed,
  },
]

const COMMON_ACTIONS = [
  {
    value: "camera",
    label: "Camera",
    icon: icons.movieCamera,
    items: [
      {
        value: "camera_left",
        label: "Left",
        icon: icons.cameraSideLeft,
        order: 6,
      },
      {
        value: "camera_right",
        label: "Right",
        icon: icons.cameraSideRight,
        order: 6,
      },
      {
        value: "camera_front",
        label: "Front",
        icon: icons.cameraFront1,
        order: 6,
      },
      {
        value: "camera_back",
        label: "Back",
        icon: icons.cameraBack1,
        order: 6,
      },
      {
        value: "camera_top",
        label: "Top",
        icon: icons.cameraTop1,
        order: 6,
      },
    ],
    order: 1,
  },
]

export const buildActionsDrawer = actions => {
  const builtActions = []

  for (let i = 0; i < actions.length; i++) {
    const currentActionKey = actions[i]
    const firstLayerAction = FIRST_LAYER_ACTIONS.find(x => x.value === currentActionKey)

    if (firstLayerAction) {
      builtActions.push(firstLayerAction)
    } else {
      const optionAction = OPTIONS_CHILDREN_ACTIONS.find(x => x.value === currentActionKey)

      if (!optionAction) {
        console.log(`Unknown action ${currentActionKey}`)
        continue
      }

      // check if option action is already in builtActions
      let optionsActionIndex = builtActions.findIndex(x => x.value === "options")

      if (optionsActionIndex === -1) {
        builtActions.push({ ...OPTIONS_LAYER_ACTION, items: [] })
        optionsActionIndex = builtActions.length - 1
      }

      builtActions[optionsActionIndex].items.push(optionAction)
    }
  }

  // Add common actions
  COMMON_ACTIONS.forEach(x => builtActions.push(x))

  return builtActions
}
