import { icons } from "@/assets/icons"

export const ActionModes = Object.freeze({
  decalLayer: {
    header: "Decal Layer",
    actions: [
      {
        label: "Move up",
        value: "move_up",
        oldIcon: icons.arrow.large.up,
      },
      {
        label: "Move down",
        value: "move_down",
        oldIcon: icons.arrow.large.down,
      },
      {
        label: "Hide",
        value: "hide",
        oldIcon: icons.decals.general.hide,
      },
      {
        label: "Show",
        value: "show",
        oldIcon: icons.decals.general.hide,
      },
      {
        label: "Highlight",
        value: "highlight",
        oldIcon: icons.decals.layer.material,
      },
      {
        label: "Edit",
        value: "edit",
        oldIcon: icons.decals.general.rename,
      },
      {
        label: "Delete",
        value: "delete",
        oldIcon: icons.decals.general.delete,
      },
    ],
  },
  fillLayer: {
    header: "Fill Layer",
    actions: [
      {
        label: "Move up",
        value: "move_up",
        oldIcon: icons.arrow.large.up,
      },
      {
        label: "Move down",
        value: "move_down",
        oldIcon: icons.arrow.large.down,
      },
      {
        label: "Edit",
        value: "edit",
        oldIcon: icons.decals.general.rename,
      },
      {
        label: "Hide",
        value: "hide",
        oldIcon: icons.decals.general.hide,
      },
      {
        label: "Show",
        value: "show",
        oldIcon: icons.decals.general.hide,
      },
      {
        label: "Delete",
        value: "delete",
        oldIcon: icons.decals.general.delete,
      },
    ],
  },
  groupLayer: {
    header: "Group Layer",
    actions: [
      {
        label: "Decal",
        value: "decal",
        oldIcon: icons.decals.general.decals,
      },
      {
        label: "Fill",
        value: "fill",
        oldIcon: icons.decals.layer.decals,
      },
      {
        label: "Group",
        value: "group",
        oldIcon: icons.decals.group.group,
      },
      {
        label: "Move up",
        value: "move_up",
        oldIcon: icons.arrow.large.up,
      },
      {
        label: "Move down",
        value: "move_down",
        oldIcon: icons.arrow.large.down,
      },
      {
        label: "Edit",
        value: "edit",
        oldIcon: icons.decals.general.rename,
      },
      {
        label: "Hide",
        value: "hide",
        oldIcon: icons.decals.general.hide,
      },
      {
        label: "Show",
        value: "show",
        oldIcon: icons.decals.general.hide,
      },
      {
        label: "Delete",
        value: "delete",
        oldIcon: icons.decals.general.delete,
      },
    ]
  },
  newLayer: {
    header: "New Layer",
    actions: [
      {
        label: "Decal",
        value: "decal",
        oldIcon: icons.decals.layer.decal,
      },
      {
        label: "Fill",
        value: "fill",
        oldIcon: icons.decals.layer.material,
      },
      {
        label: "Group",
        value: "group",
        oldIcon: icons.decals.group.group,
      },
    ],
  },
})
