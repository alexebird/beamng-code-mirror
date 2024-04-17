export const icons = {
  undefined: 'undefined',
  arrow: {
    large: {
      up: 'arrow/large_up',
      down: 'arrow/large_down',
      left: 'arrow/large_left',
      right: 'arrow/large_right',
    },
    small: {
      up: 'arrow/arrowSmallUp',
      down: 'arrow/arrowSmallDown',
      left: 'arrow/arrowSmallLeft',
      right: 'arrow/arrowSmallRight',
    }
  },
  drive: {
    autobahn: 'drive/autobahn',
    busroutes: 'drive/busroutes',
    campaigns: 'drive/campaigns',
    career: 'drive/career',
    freeroam: 'drive/freeroam',
    garage: 'drive/garage',
    infinity: 'drive/infinity',
    lightrunner: 'drive/lightrunner',
    m_a: 'drive/m_a',
    m_b: 'drive/m_b',
    m_c: 'drive/m_c',
    play: 'drive/play',
    quit: 'drive/quit',
    scenarios: 'drive/scenarios',
    timetrials: 'drive/timetrials',
  },
  general: {
    offbtn: 'general/offbtn',
    unknown: 'general/unknown',
    check: 'general/check',
    recharge: 'general/recharge',
    refuel: 'general/refuel',
    beambuck: 'general/beambuck',
    money: 'general/beambuck',
    beamXP: 'general/beamXP',
    arrow_small_left: 'general/arrow_small-left',
    arrow_small_right: 'general/arrow_small-right',
    fuel_nozzle: "general/fuel-nozzle",
    recharge_connector: "general/recharge-connector",
    star: "general/star",
    star_outlined: "general/star-secondary",
    vehicle: "general/vehicle",
    awd:"general/awd",
    '4wd':"general/4wd",
    fwd:"general/fwd",
    rwd:"general/rwd",
    drivetrain_special:"general/drivetrain-special",
    drivetrain_generic:"general/drivetrain-generic",
    charge:"general/charge",
    fuel:"general/fuel",
    odometer:"general/odometer",
    power_gauge_01:"general/power-gauge-01c",
    power_gauge_02:"general/power-gauge-02c",
    power_gauge_03:"general/power-gauge-03c",
    power_gauge_04:"general/power-gauge-04c",
    power_gauge_05:"general/power-gauge-05c",
    weight:"general/weight",
    transmission_a:"general/transmission-a",
    transmission_m:"general/transmission-m",
  },
  device: {
    keyboard: 'device/keyboard',
    phone_android: 'device/phone_android',
    wheel: 'device/wheel',
    gamepad: 'device/gamepad',
    videogame_asset: 'device/videogame_asset',
    mouse: {
      button0: 'device/mouse/button0',
      button1: 'device/mouse/button1',
      button2: 'device/mouse/button2',
      xaxis: 'device/mouse/xaxis',
      yaxis: 'device/mouse/yaxis',
      zaxis: 'device/mouse/zaxis'
    },
    xbox: {
      btn_a: 'device/xbox/btn_a',
      btn_b: 'device/xbox/btn_b',
      btn_back: 'device/xbox/btn_back',
      btn_lb: 'device/xbox/btn_lb',
      btn_lt: 'device/xbox/btn_lt',
      btn_rb: 'device/xbox/btn_rb',
      btn_rt: 'device/xbox/btn_rt',
      btn_start: 'device/xbox/btn_start',
      btn_x: 'device/xbox/btn_x',
      btn_y: 'device/xbox/btn_y',
      btn_dpad_default_filled: 'device/xbox/btn_dpad_default_filled',
      btn_dpad_default_outline: 'device/xbox/btn_dpad_default_outline',
      btn_dpad_down: 'device/xbox/btn_dpad_down',
      btn_dpad_left: 'device/xbox/btn_dpad_left',
      btn_dpad_right: 'device/xbox/btn_dpad_right',
      btn_dpad_up: 'device/xbox/btn_dpad_up',
      btn_thumb_left: 'device/xbox/btn_thumb_left',
      btn_thumb_left_x: 'device/xbox/btn_thumb_left_x',
      btn_thumb_left_y: 'device/xbox/btn_thumb_left_y',
      btn_thumb_right: 'device/xbox/btn_thumb_right',
      btn_thumb_right_x: 'device/xbox/btn_thumb_right_x',
      btn_thumb_right_y: 'device/xbox/btn_thumb_right_y',
    }
  },
  decals: {
    camera: {
      back: 'decals/camera/back',
      freecam: 'decals/camera/freecam',
      front: 'decals/camera/front',
      left: 'decals/camera/left',
      right: 'decals/camera/right',
      top: 'decals/camera/top',
    },
    general: {
      change_order: 'decals/general/change_order',
      deform: 'decals/general/deform',
      delete: 'decals/general/delete',
      duplicate: 'decals/general/duplicate',
      hide: 'decals/general/hide',
      lock: 'decals/general/lock',
      mirror: 'decals/general/mirror',
      options: 'decals/general/options',
      redo: 'decals/general/redo',
      rename: 'decals/general/rename',
      save: 'decals/general/save',
      transform: 'decals/general/transform',
      undo: 'decals/general/undo',
      unlock: 'decals/general/unlock',
      use_mask: 'decals/general/mask'
    },
    group: {
      group: 'decals/group/group',
      ungroup: 'decals/group/ungroup'
    },
    layer: {
      decal: 'decals/layer/decal',
      material: 'decals/layer/material'
    },
    mirror: {
      copy_mirrored: 'decals/mirror/copy_mirrored',
      copy_straight: 'decals/mirror/copy_straight'
    }
  }
}

export const iconTypesList = makeIconTypesList(icons)

function makeIconTypesList(dict) {
  let key, all = []
  for (key in dict) all = all.concat(typeof dict[key] === 'string' ? dict[key] : makeIconTypesList(dict[key]))
  return all
}
