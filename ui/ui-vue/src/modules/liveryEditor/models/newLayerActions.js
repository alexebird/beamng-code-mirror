import { icons } from "@/common/components/base"

export default {
  label: "New Layer",
  items: [
    {
      value: "fill",
      label: "Fill",
      icon: icons.material,
      lazyLoadItems: true,
    },
    {
      value: "decal",
      label: "Decal",
      icon: icons.material,
      lazyLoadItems: true,
      allowOpenDrawer: true,
    },
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
    },
  ],
  allowOpenDrawer: false,
  flattenChildren: false,
}
