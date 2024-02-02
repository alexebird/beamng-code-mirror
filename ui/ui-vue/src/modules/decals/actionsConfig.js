import { icons } from "@/common/components/base/bngIcon.vue"

export const ActionModes = Object.freeze({
  camera: {
    header: "Camera",
    actions: [
      {
        label: "Front",
        value: "front",
        icon: icons.decals.camera.front,
      },
      {
        label: "Left",
        value: "left",
        icon: icons.decals.camera.left,
      },
      {
        label: "Top",
        value: "top",
        icon: icons.decals.camera.top,
      },
      {
        label: "Right",
        value: "right",
        icon: icons.decals.camera.right,
      },
      {
        label: "Back",
        value: "back",
        icon: icons.decals.camera.back,
      },
      {
        label: "Free cam",
        value: "freecam",
        icon: icons.decals.camera.freecam,
      },
    ],
  },
  group: {
    header: "Group options",
    actions: [
      {
        label: "Use as mask",
        value: "use_mask",
        icon: icons.decals.general.use_mask,
      },
      {
        label: "Hide",
        value: "hide",
        icon: icons.decals.general.hide,
      },
      {
        label: "Lock",
        value: "lock",
        icon: icons.decals.general.lock,
      },
      {
        label: "Rename",
        value: "rename",
        icon: icons.decals.general.rename,
      },
      {
        label: "Change order",
        value: "change_order",
        icon: icons.decals.general.change_order,
      },
      {
        label: "Save",
        value: "save",
        icon: icons.decals.general.save,
      },
    ],
  },
  layer: {
    header: "Layer options",
    actions: [
      {
        label: "Use as mask",
        value: "use_mask",
        icon: icons.decals.general.use_mask,
      },
      {
        label: "Hide",
        value: "hide",
        icon: icons.decals.general.hide,
      },
      {
        label: "Lock",
        value: "lock",
        icon: icons.decals.general.lock,
      },
      {
        label: "Rename",
        value: "rename",
        icon: icons.decals.general.rename,
      },
      {
        label: "Change order",
        value: "change_order",
        icon: icons.decals.general.change_order,
      },
    ],
  },
  locked_layer: {
    header: "Locked Layer actions",
    actions: [
      {
        label: "Hide",
        value: "hide",
        icon: icons.decals.general.hide,
      },
      {
        label: "Unlock",
        value: "unlock",
        icon: icons.decals.general.unlock,
      },
      {
        label: "Rename",
        value: "rename",
        icon: icons.decals.general.rename,
      },
    ],
  },
  mirror: {
    header: "Mirror",
    actions: [
      {
        label: "Copy mirrored",
        value: "copy_mirrored",
        icon: icons.decals.mirror.copy_mirrored,
      },
      {
        label: "Copy straight",
        value: "copy_straight",
        icon: icons.decals.mirror.copy_straight,
      },
    ],
  },
  multi_layer: {
    header: "[4] layers actions",
    actions: [
      {
        label: "Group",
        value: "group",
        icon: icons.decals.group.group,
      },
      {
        label: "Hide",
        value: "hide",
        icon: icons.decals.general.hide,
      },
      {
        label: "Lock",
        value: "lock",
        icon: icons.decals.general.lock,
      },
      {
        label: "Change Order",
        value: "change_order",
        icon: icons.decals.general.change_order,
      },
      {
        label: "Delete",
        value: "delete",
        icon: icons.decals.general.delete,
      },
    ],
  },
  single_group: {
    header: "[Group Name] actions",
    actions: [
      {
        label: "Transform",
        value: "transform",
        icon: icons.decals.general.transform,
      },
      {
        label: "Deform",
        value: "deform",
        icon: icons.decals.general.deform,
      },
      {
        label: "Duplicate",
        value: "duplicate",
        icon: icons.decals.general.duplicate,
      },
      {
        label: "Mirror",
        value: "mirror",
        icon: icons.decals.general.mirror,
      },
      {
        label: "Options",
        value: "options",
        icon: icons.decals.general.options,
      },
      {
        label: "Ungroup",
        value: "ungroup",
        icon: icons.decals.group.ungroup,
      },
      {
        label: "Delete",
        value: "delete",
        icon: icons.decals.general.delete,
      },
    ],
  },
  single_layer: {
    header: "[Layer Name] actions",
    actions: [
      {
        label: "Transform",
        value: "transform",
        icon: icons.decals.general.transform,
      },
      {
        label: "Deform",
        value: "deform",
        icon: icons.decals.general.deform,
      },
      {
        label: "Material",
        value: "material",
        icon: icons.decals.layer.material,
      },
      {
        label: "Duplicate",
        value: "duplicate",
        icon: icons.decals.general.duplicate,
      },
      {
        label: "Mirror",
        value: "mirror",
        icon: icons.decals.general.mirror,
      },
      {
        label: "Options",
        value: "options",
        icon: icons.decals.general.options,
      },
      {
        label: "Delete",
        value: "delete",
        icon: icons.decals.general.delete,
      },
    ],
  },
})
