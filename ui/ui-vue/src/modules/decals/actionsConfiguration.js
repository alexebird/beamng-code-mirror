import { icons } from "@/assets/icons"

export const ActionModes = Object.freeze({
  decalLayer: {
    header: "Decal Layer",
    actions: [
      {
        label: "Move up",
        value: "move_up",
        icon: icons.arrow.large.up,
      },
      {
        label: "Move down",
        value: "move_down",
        icon: icons.arrow.large.down,
      },
      {
        label: "Hide",
        value: "hide",
        icon: icons.decals.general.hide,
      },
      {
        label: "Show",
        value: "show",
        icon: icons.decals.general.hide,
      },
      {
        label: "Highlight",
        value: "highlight",
        icon: icons.decals.layer.material,
      },
      {
        label: "Edit",
        value: "edit",
        icon: icons.decals.general.rename,
      },
      {
        label: "Delete",
        value: "delete",
        icon: icons.decals.general.delete,
      },
    ],
  },
  fillLayer: {
    header: "Fill Layer",
    actions: [
      {
        label: "Move up",
        value: "move_up",
        icon: icons.arrow.large.up,
      },
      {
        label: "Move down",
        value: "move_down",
        icon: icons.arrow.large.down,
      },
      {
        label: "Edit",
        value: "edit",
        icon: icons.decals.general.rename,
      },
      {
        label: "Hide",
        value: "hide",
        icon: icons.decals.general.hide,
      },
      {
        label: "Show",
        value: "show",
        icon: icons.decals.general.hide,
      },
      {
        label: "Delete",
        value: "delete",
        icon: icons.decals.general.delete,
      },
    ],
  },
  groupLayer: {
    header: "Group Layer",
    actions: [
      {
        label: "Decal",
        value: "decal",
        icon: icons.decals.general.decals,
      },
      {
        label: "Fill",
        value: "fill",
        icon: icons.decals.layer.decals,
      },
      {
        label: "Group",
        value: "group",
        icon: icons.decals.group.group,
      },
      {
        label: "Move up",
        value: "move_up",
        icon: icons.arrow.large.up,
      },
      {
        label: "Move down",
        value: "move_down",
        icon: icons.arrow.large.down,
      },
      {
        label: "Edit",
        value: "edit",
        icon: icons.decals.general.rename,
      },
      {
        label: "Hide",
        value: "hide",
        icon: icons.decals.general.hide,
      },
      {
        label: "Show",
        value: "show",
        icon: icons.decals.general.hide,
      },
      {
        label: "Delete",
        value: "delete",
        icon: icons.decals.general.delete,
      },
    ]
  },
  newLayer: {
    header: "New Layer",
    actions: [
      {
        label: "Decal",
        value: "decal",
        icon: icons.decals.layer.decal,
      },
      {
        label: "Fill",
        value: "fill",
        icon: icons.decals.layer.material,
      },
      {
        label: "Group",
        value: "group",
        icon: icons.decals.group.group,
      },
    ],
  },
})
