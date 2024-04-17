import { icons } from "@/assets/icons"

export const ActionModes = Object.freeze({
  camera: {
    header: "Camera",
    actions: [
      {
        label: "Front",
        value: "front",
        oldIcon: icons.decals.camera.front,
      },
      {
        label: "Left",
        value: "left",
        oldIcon: icons.decals.camera.left,
      },
      {
        label: "Top",
        value: "top",
        oldIcon: icons.decals.camera.top,
      },
      {
        label: "Right",
        value: "right",
        oldIcon: icons.decals.camera.right,
      },
      {
        label: "Back",
        value: "back",
        oldIcon: icons.decals.camera.back,
      },
      {
        label: "Free cam",
        value: "freecam",
        oldIcon: icons.decals.camera.freecam,
      },
    ],
  },
  group: {
    header: "Group options",
    actions: [
      {
        label: "Use as mask",
        value: "use_mask",
        oldIcon: icons.decals.general.use_mask,
      },
      {
        label: "Hide",
        value: "hide",
        oldIcon: icons.decals.general.hide,
      },
      {
        label: "Lock",
        value: "lock",
        oldIcon: icons.decals.general.lock,
      },
      {
        label: "Rename",
        value: "rename",
        oldIcon: icons.decals.general.rename,
      },
      {
        label: "Change order",
        value: "change_order",
        oldIcon: icons.decals.general.change_order,
      },
      {
        label: "Save",
        value: "save",
        oldIcon: icons.decals.general.save,
      },
    ],
  },
  layer: {
    header: "Layer options",
    actions: [
      {
        label: "Use as mask",
        value: "use_mask",
        oldIcon: icons.decals.general.use_mask,
      },
      {
        label: "Hide",
        value: "hide",
        oldIcon: icons.decals.general.hide,
      },
      {
        label: "Lock",
        value: "lock",
        oldIcon: icons.decals.general.lock,
      },
      {
        label: "Rename",
        value: "rename",
        oldIcon: icons.decals.general.rename,
      },
      {
        label: "Change order",
        value: "change_order",
        oldIcon: icons.decals.general.change_order,
      },
    ],
  },
  locked_layer: {
    header: "Locked Layer actions",
    actions: [
      {
        label: "Hide",
        value: "hide",
        oldIcon: icons.decals.general.hide,
      },
      {
        label: "Unlock",
        value: "unlock",
        oldIcon: icons.decals.general.unlock,
      },
      {
        label: "Rename",
        value: "rename",
        oldIcon: icons.decals.general.rename,
      },
    ],
  },
  mirror: {
    header: "Mirror",
    actions: [
      {
        label: "Copy mirrored",
        value: "copy_mirrored",
        oldIcon: icons.decals.mirror.copy_mirrored,
      },
      {
        label: "Copy straight",
        value: "copy_straight",
        oldIcon: icons.decals.mirror.copy_straight,
      },
    ],
  },
  multi_layer: {
    header: "[4] layers actions",
    actions: [
      {
        label: "Group",
        value: "group",
        oldIcon: icons.decals.group.group,
      },
      {
        label: "Hide",
        value: "hide",
        oldIcon: icons.decals.general.hide,
      },
      {
        label: "Lock",
        value: "lock",
        oldIcon: icons.decals.general.lock,
      },
      {
        label: "Change Order",
        value: "change_order",
        oldIcon: icons.decals.general.change_order,
      },
      {
        label: "Delete",
        value: "delete",
        oldIcon: icons.decals.general.delete,
      },
    ],
  },
  single_group: {
    header: "[Group Name] actions",
    actions: [
      {
        label: "Transform",
        value: "transform",
        oldIcon: icons.decals.general.transform,
      },
      {
        label: "Deform",
        value: "deform",
        oldIcon: icons.decals.general.deform,
      },
      {
        label: "Duplicate",
        value: "duplicate",
        oldIcon: icons.decals.general.duplicate,
      },
      {
        label: "Mirror",
        value: "mirror",
        oldIcon: icons.decals.general.mirror,
      },
      {
        label: "Options",
        value: "options",
        oldIcon: icons.decals.general.options,
      },
      {
        label: "Ungroup",
        value: "ungroup",
        oldIcon: icons.decals.group.ungroup,
      },
      {
        label: "Delete",
        value: "delete",
        oldIcon: icons.decals.general.delete,
      },
    ],
  },
  single_layer: {
    header: "[Layer Name] actions",
    actions: [
      {
        label: "Transform",
        value: "transform",
        oldIcon: icons.decals.general.transform,
      },
      {
        label: "Deform",
        value: "deform",
        oldIcon: icons.decals.general.deform,
      },
      {
        label: "Material",
        value: "material",
        oldIcon: icons.decals.layer.material,
      },
      {
        label: "Duplicate",
        value: "duplicate",
        oldIcon: icons.decals.general.duplicate,
      },
      {
        label: "Mirror",
        value: "mirror",
        oldIcon: icons.decals.general.mirror,
      },
      {
        label: "Options",
        value: "options",
        oldIcon: icons.decals.general.options,
      },
      {
        label: "Delete",
        value: "delete",
        oldIcon: icons.decals.general.delete,
      },
    ],
  },
})
