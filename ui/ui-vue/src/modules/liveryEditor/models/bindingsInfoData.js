export default {
  transform: {
    default: [
      {
        type: "move",
        label: "Move",
        bindings: {
          keyboard: {
            actions: ["translate_y_up", "translate_x_left", "translate_y_down", "translate_x_right"],
          },
          xinput: {
            actions: ["menu_item_radial_x", "menu_item_radial_y"],
          },
        },
      },
      {
        type: "rotate",
        label: "Rotate",
        bindings: {
          keyboard: {
            actions: ["rotate_left", "rotate_right"],
          },
          xinput: {
            actions: ["menu_tab_left", "menu_tab_right"],
          },
        },
      },
      {
        type: "resize",
        label: "Resize",
        bindings: {
          keyboard: {
            actions: ["scale_up", "scale_down"],
          },
          xinput: {
            actions: ["rotate_camera_horizontal", "rotate_camera_vertical"],
          },
        },
      },
      // {
      //   type: "resize_advance",
      //   label: "Advanced Resize",
      //   bindings: {
      //     keyboard: ["scale_y_up", "scale_y_down", "scale_x_up", "scale_x_down"],
      //   },
      // },
      {
        type: "skew",
        label: "Skew",
        bindings: {
          keyboard: {
            actions: ["skew_x_down", "skew_x_up", "skew_y_down", "skew_y_up"],
          },
          xinput: {
            actions: ["menu_item_radial_right_x", "menu_item_radial_right_y"],
            modifiers: ["cui_modifier"],
          },
        },
      },
    ],
    stamp: [
      {
        type: "stamp",
        label: "Stamp",
        bindings: {
          keyboard: {
            actions: ["stamp_decal"],
          },
        },
      },
    ],
  },
}
