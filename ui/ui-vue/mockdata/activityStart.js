export default {
  gameContextData: {
    context: "availableMissions",
    repairOptions: [
      { type: "noRepair", notEnoughDisplay: "Repaired vehicle needed", available: false, label: "No" },
      { notEnoughDisplay: "Not enough bonus stars for repair", type: "bonusStarRepair", label: "For 1 bonus star", cost: 1, available: false },
      { notEnoughDisplay: "Not enough money for repair", type: "moneyRepair", label: "For 1000 money", cost: 1000, available: true },
    ],
    isCareerActive: true,
    missions: [
      {
        progress: {
          default: {
            attempts: {},
            aggregate: { bestType: "none", passed: false, completed: false, attemptCount: 0 },
            leaderboards: { recent: {} },
          },
        },
        hasUserSettings: true,
        name: "missions.chase.wcusa.unpaidFines.title",
        userSettings: [
          {
            type: "bool",
            value: true,
            key: "spawnTraffic",
            label: "missions.missions.general.userSettings.trafficEnabled",
          },
        ],
        preview: "/gameplay/missions/west_coast_usa/chase/001-unpaid/preview.jpg",
        description: "missions.chase.wcusa.unpaidFines.description",
        id: "west_coast_usa/chase/001-unpaid",
        currentProgressKey: "default",
        formattedProgress: {
          formattedProgressByKey: {
            default: {
              attempts: {
                rows: {},
                labels: ["#", "", "", "bigMap.progressLabels.time"],
              },
              ownAggregate: {
                rows: [[{ text: "0" }, { text: "-" }]],
                newBestKeys: ["none", "newBestTime"],
                labels: ["Attempts", "bigMap.progressLabels.bestTime"],
              },
            },
          },
          progressKeyTranslations: {
            default: "missions.progressKeyLabels.default",
          },
          defaultProgressKey: "default",
          allProgressKeys: ["default"],
          unlockedStars: {
            stars: [
              {
                rewards: [
                  { rewardAmount: 750, icon: "star", attributeKey: "money" },
                  { rewardAmount: 5, icon: "star", attributeKey: "beamXP" },
                  { rewardAmount: 50, icon: "star", attributeKey: "specialized" },
                ],
                defaultStarIndex: 1,
                unlocked: false,
                isDefaultStar: true,
                key: "complete",
                label: {
                  txt: "missions.missions.stars.justFinish",
                  context: {
                    hideoutScl: "10",
                    timeFailText: "missions.chase.general.timeFail",
                    hideoutFailText: "missions.chase.general.hideoutFail",
                    timeBronze: "180",
                    maxTimeWindow: "60",
                    suspectModel: "midsize",
                    suspectConfigPath: "vehicles/midsize/DX_A.pc",
                    distanceLimit: "250",
                    timeLimit: "120",
                    minTimeWindow: "50",
                    aiAggression: "0.6000000238",
                    suspectConfig: "DX_A",
                    distanceFailText: "missions.chase.general.distanceFail",
                    damageFailText: "missions.chase.general.damageFail",
                    distanceWarnText: "missions.chase.general.distanceWarn",
                    damageLimit: "20000",
                    timeGold: "30",
                    fleeTriggerScl: "10",
                    timeSilver: "60",
                    fleeDelay: "90",
                    startTitle: "missions.chase.wcusa.unpaidFines.title",
                    startText: "missions.chase.wcusa.unpaidFines.start",
                  },
                },
              },
              {
                rewards: [
                  { rewardAmount: 750, icon: "star", attributeKey: "money" },
                  { rewardAmount: 5, icon: "star", attributeKey: "beamXP" },
                  { rewardAmount: 50, icon: "star", attributeKey: "specialized" },
                ],
                defaultStarIndex: 2,
                unlocked: false,
                isDefaultStar: true,
                key: "timeSilver",
                label: {
                  txt: "missions.chase.stars.silver",
                  context: {
                    hideoutScl: "10",
                    timeFailText: "missions.chase.general.timeFail",
                    hideoutFailText: "missions.chase.general.hideoutFail",
                    timeBronze: "180",
                    maxTimeWindow: "60",
                    suspectModel: "midsize",
                    suspectConfigPath: "vehicles/midsize/DX_A.pc",
                    distanceLimit: "250",
                    timeLimit: "120",
                    minTimeWindow: "50",
                    aiAggression: "0.6000000238",
                    suspectConfig: "DX_A",
                    distanceFailText: "missions.chase.general.distanceFail",
                    damageFailText: "missions.chase.general.damageFail",
                    distanceWarnText: "missions.chase.general.distanceWarn",
                    damageLimit: "20000",
                    timeGold: "30",
                    fleeTriggerScl: "10",
                    timeSilver: "60",
                    fleeDelay: "90",
                    startTitle: "missions.chase.wcusa.unpaidFines.title",
                    startText: "missions.chase.wcusa.unpaidFines.start",
                  },
                },
              },
              {
                rewards: [
                  { rewardAmount: 750, icon: "star", attributeKey: "money" },
                  { rewardAmount: 5, icon: "star", attributeKey: "beamXP" },
                  { rewardAmount: 50, icon: "star", attributeKey: "specialized" },
                ],
                defaultStarIndex: 3,
                unlocked: false,
                isDefaultStar: true,
                key: "timeGold",
                label: {
                  txt: "missions.chase.stars.gold",
                  context: {
                    hideoutScl: "10",
                    timeFailText: "missions.chase.general.timeFail",
                    hideoutFailText: "missions.chase.general.hideoutFail",
                    timeBronze: "180",
                    maxTimeWindow: "60",
                    suspectModel: "midsize",
                    suspectConfigPath: "vehicles/midsize/DX_A.pc",
                    distanceLimit: "250",
                    timeLimit: "120",
                    minTimeWindow: "50",
                    aiAggression: "0.6000000238",
                    suspectConfig: "DX_A",
                    distanceFailText: "missions.chase.general.distanceFail",
                    damageFailText: "missions.chase.general.damageFail",
                    distanceWarnText: "missions.chase.general.distanceWarn",
                    damageLimit: "20000",
                    timeGold: "30",
                    fleeTriggerScl: "10",
                    timeSilver: "60",
                    fleeDelay: "90",
                    startTitle: "missions.chase.wcusa.unpaidFines.title",
                    startText: "missions.chase.wcusa.unpaidFines.start",
                  },
                },
              },
              {
                rewards: [{ rewardAmount: 1, icon: "star", attributeKey: "bonusStars" }],
                defaultStarIndex: false,
                unlocked: false,
                isDefaultStar: false,
                key: "lowDamage",
                label: {
                  txt: "missions.chase.stars.lowDamage",
                  context: {
                    hideoutScl: "10",
                    timeFailText: "missions.chase.general.timeFail",
                    hideoutFailText: "missions.chase.general.hideoutFail",
                    timeBronze: "180",
                    maxTimeWindow: "60",
                    suspectModel: "midsize",
                    suspectConfigPath: "vehicles/midsize/DX_A.pc",
                    distanceLimit: "250",
                    timeLimit: "120",
                    minTimeWindow: "50",
                    aiAggression: "0.6000000238",
                    suspectConfig: "DX_A",
                    distanceFailText: "missions.chase.general.distanceFail",
                    damageFailText: "missions.chase.general.damageFail",
                    distanceWarnText: "missions.chase.general.distanceWarn",
                    damageLimit: "20000",
                    timeGold: "30",
                    fleeTriggerScl: "10",
                    timeSilver: "60",
                    fleeDelay: "90",
                    startTitle: "missions.chase.wcusa.unpaidFines.title",
                    startText: "missions.chase.wcusa.unpaidFines.start",
                  },
                },
              },
              {
                rewards: [{ rewardAmount: 1, icon: "star", attributeKey: "bonusStars" }],
                defaultStarIndex: false,
                unlocked: false,
                isDefaultStar: false,
                key: "perfectArrest",
                label: {
                  txt: "missions.chase.stars.perfectArrest",
                  context: {
                    hideoutScl: "10",
                    timeFailText: "missions.chase.general.timeFail",
                    hideoutFailText: "missions.chase.general.hideoutFail",
                    timeBronze: "180",
                    maxTimeWindow: "60",
                    suspectModel: "midsize",
                    suspectConfigPath: "vehicles/midsize/DX_A.pc",
                    distanceLimit: "250",
                    timeLimit: "120",
                    minTimeWindow: "50",
                    aiAggression: "0.6000000238",
                    suspectConfig: "DX_A",
                    distanceFailText: "missions.chase.general.distanceFail",
                    damageFailText: "missions.chase.general.damageFail",
                    distanceWarnText: "missions.chase.general.distanceWarn",
                    damageLimit: "20000",
                    timeGold: "30",
                    fleeTriggerScl: "10",
                    timeSilver: "60",
                    fleeDelay: "90",
                    startTitle: "missions.chase.wcusa.unpaidFines.title",
                    startText: "missions.chase.wcusa.unpaidFines.start",
                  },
                },
              },
            ],
            defaultUnlockedStarCount: 0,
            totalStars: 5,
            totalUnlockedStarCount: 0,
          },
        },
        defaultUserSettings: {
          spawnTraffic: true,
        },
        hasUserSettingsUnlocked: false,
        leaderboardKey: "highscore",
        devMission: false,
        unlocks: {
          visible: true,
          depth: 10,
          startable: true,
          backward: {},
          branchTags: {
            specialized: true,
          },
          maxBranchlevel: 1,
          startableDetails: {
            met: true,
            condition: {
              level: 1,
              branchId: "specialized",
              type: "branchLevel",
            },
            label: {
              txt: "missions.missions.unlock.attributeLevel.atLeast",
              context: { level: 1, branchName: "ui.career.specialized" },
            },
          },
          forward: ["west_coast_usa/chase/002-tamper", "west_coast_usa/chase/004-racer"],
        },
        missionTypeLabel: "bigMap.missionLabels.chase",
        additionalAttributes: [
          { icon: "directions_car", valueKey: "Provided Vehicle", labelKey: "Vehicle Used" },
          { icon: "flag", valueKey: "Low", labelKey: "Difficulty" },
        ],
      },
      {
        progress: {
          default: {
            attempts: {},
            aggregate: { bestType: "none", passed: false, completed: false, attemptCount: 0 },
            leaderboards: { recent: {} },
          },
        },
        hasUserSettings: true,
        name: "missions.evade.wcusa.hideAtHome.title",
        userSettings: [
          {
            type: "bool",
            value: true,
            key: "presetVehicleActive",
            label: "missions.missions.general.userSettings.useProposedCar",
          },
          {
            values: [
              { v: false, l: "ui.common.no" },
              { v: true, l: "ui.common.yes" },
            ],
            value: true,
            type: "select",
            key: "spawnTraffic",
            label: "missions.missions.general.userSettings.trafficEnabled",
          },
          {
            type: "bool",
            value: true,
            key: "useGroundmarkers",
            label: "missions.missions.general.userSettings.navigationMarkers",
          },
        ],
        preview: "/gameplay/missions/west_coast_usa/evade/001-Hide/preview.jpg",
        description: "missions.evade.wcusa.hideAtHome.description",
        id: "west_coast_usa/evade/001-Hide",
        currentProgressKey: "default",
        formattedProgress: {
          formattedProgressByKey: {
            default: {
              attempts: { rows: {}, labels: ["#", "", "", "bigMap.progressLabels.time"] },
              ownAggregate: {
                rows: [[{ text: "0" }, { text: "-" }]],
                newBestKeys: ["none", "newBestTime"],
                labels: ["Attempts", "bigMap.progressLabels.bestTime"],
              },
            },
          },
          progressKeyTranslations: {
            default: "missions.progressKeyLabels.default",
          },
          defaultProgressKey: "default",
          allProgressKeys: ["default"],
          unlockedStars: {
            stars: [
              {
                rewards: [
                  { rewardAmount: 750, icon: "star", attributeKey: "money" },
                  { rewardAmount: 5, icon: "star", attributeKey: "beamXP" },
                  { rewardAmount: 50, icon: "star", attributeKey: "specialized" },
                ],
                defaultStarIndex: 1,
                unlocked: false,
                isDefaultStar: true,
                key: "complete",
                label: {
                  txt: "missions.missions.stars.justFinish",
                  context: {
                    hideoutScl: "7",
                    roadblockChance: "0.5",
                    respawnRateDown: "0.400000006",
                    hideoutFailText: "missions.evade.general.destinationPolice",
                    timeBronze: "200",
                    goalOffenses: "3",
                    damageLimit: "20000",
                    longTime: "200",
                    propConfig: "lights",
                    timeSilver: "120",
                    pursuitMode: "2",
                    startTitle: "missions.evade.wcusa.hideAtHome.title",
                    evadeLimit: "60",
                    propConfigPath: "/vehicles/sawhorse/lights.pc",
                    propModel: "sawhorse",
                    propAmount: "1",
                    startText: "missions.evade.wcusa.hideAtHome.start",
                    arrestFailText: "missions.evade.general.arrestFail",
                    damageFailText: "missions.evade.general.damageFail",
                    arrestLimit: "5",
                    goalScore: "3000",
                    dropOffText: "missions.evade.general.destinationEscape",
                    spawnAmount: "2",
                    hideoutEvadeRadius: "50",
                    timeGold: "80",
                    goalPoliceWrecks: "3",
                    respawnRate: "1.799999952",
                    goalRoadblocks: "3",
                    goalCollisions: "3",
                    policeHeadStart: "0",
                  },
                },
              },
              {
                rewards: [
                  { rewardAmount: 750, icon: "star", attributeKey: "money" },
                  { rewardAmount: 5, icon: "star", attributeKey: "beamXP" },
                  { rewardAmount: 50, icon: "star", attributeKey: "specialized" },
                ],
                defaultStarIndex: 2,
                unlocked: false,
                isDefaultStar: true,
                key: "timeSilver",
                label: {
                  txt: "missions.chase.stars.silver",
                  context: {
                    hideoutScl: "7",
                    roadblockChance: "0.5",

                    respawnRateDown: "0.400000006",
                    hideoutFailText: "missions.evade.general.destinationPolice",
                    timeBronze: "200",
                    goalOffenses: "3",
                    damageLimit: "20000",
                    longTime: "200",
                    propConfig: "lights",
                    timeSilver: "120",
                    pursuitMode: "2",
                    startTitle: "missions.evade.wcusa.hideAtHome.title",
                    evadeLimit: "60",
                    propConfigPath: "/vehicles/sawhorse/lights.pc",
                    propModel: "sawhorse",
                    propAmount: "1",
                    startText: "missions.evade.wcusa.hideAtHome.start",
                    arrestFailText: "missions.evade.general.arrestFail",
                    damageFailText: "missions.evade.general.damageFail",
                    arrestLimit: "5",
                    goalScore: "3000",
                    dropOffText: "missions.evade.general.destinationEscape",
                    spawnAmount: "2",
                    hideoutEvadeRadius: "50",
                    timeGold: "80",
                    goalPoliceWrecks: "3",
                    respawnRate: "1.799999952",
                    goalRoadblocks: "3",
                    goalCollisions: "3",
                    policeHeadStart: "0",
                  },
                },
              },
              {
                rewards: [
                  { rewardAmount: 750, icon: "star", attributeKey: "money" },
                  { rewardAmount: 5, icon: "star", attributeKey: "beamXP" },
                  { rewardAmount: 50, icon: "star", attributeKey: "specialized" },
                ],
                defaultStarIndex: 3,
                unlocked: false,
                isDefaultStar: true,
                key: "timeGold",
                label: {
                  txt: "missions.chase.stars.gold",
                  context: {
                    hideoutScl: "7",
                    roadblockChance: "0.5",
                    respawnRateDown: "0.400000006",
                    hideoutFailText: "missions.evade.general.destinationPolice",
                    timeBronze: "200",
                    goalOffenses: "3",
                    damageLimit: "20000",
                    longTime: "200",
                    propConfig: "lights",
                    timeSilver: "120",
                    pursuitMode: "2",
                    startTitle: "missions.evade.wcusa.hideAtHome.title",
                    evadeLimit: "60",
                    propConfigPath: "/vehicles/sawhorse/lights.pc",
                    propModel: "sawhorse",
                    propAmount: "1",
                    startText: "missions.evade.wcusa.hideAtHome.start",
                    arrestFailText: "missions.evade.general.arrestFail",
                    damageFailText: "missions.evade.general.damageFail",
                    arrestLimit: "5",
                    goalScore: "3000",
                    dropOffText: "missions.evade.general.destinationEscape",
                    spawnAmount: "2",
                    hideoutEvadeRadius: "50",
                    timeGold: "80",
                    goalPoliceWrecks: "3",
                    respawnRate: "1.799999952",
                    goalRoadblocks: "3",
                    goalCollisions: "3",
                    policeHeadStart: "0",
                  },
                },
              },
              {
                rewards: [{ rewardAmount: 1, icon: "star", attributeKey: "bonusStars" }],
                defaultStarIndex: false,
                unlocked: false,
                isDefaultStar: false,
                key: "lowDamage",
                label: {
                  txt: "missions.evade.stars.lowDamage",
                  context: {
                    hideoutScl: "7",
                    roadblockChance: "0.5",
                    respawnRateDown: "0.400000006",
                    hideoutFailText: "missions.evade.general.destinationPolice",
                    timeBronze: "200",
                    goalOffenses: "3",
                    damageLimit: "20000",
                    longTime: "200",
                    propConfig: "lights",
                    timeSilver: "120",
                    pursuitMode: "2",
                    startTitle: "missions.evade.wcusa.hideAtHome.title",
                    evadeLimit: "60",
                    propConfigPath: "/vehicles/sawhorse/lights.pc",
                    propModel: "sawhorse",
                    propAmount: "1",
                    startText: "missions.evade.wcusa.hideAtHome.start",
                    arrestFailText: "missions.evade.general.arrestFail",
                    damageFailText: "missions.evade.general.damageFail",
                    arrestLimit: "5",
                    goalScore: "3000",
                    dropOffText: "missions.evade.general.destinationEscape",
                    spawnAmount: "2",
                    hideoutEvadeRadius: "50",
                    timeGold: "80",
                    goalPoliceWrecks: "3",
                    respawnRate: "1.799999952",
                    goalRoadblocks: "3",
                    goalCollisions: "3",
                    policeHeadStart: "0",
                  },
                },
              },
              {
                rewards: [{ rewardAmount: 1, icon: "star", attributeKey: "bonusStars" }],
                defaultStarIndex: false,
                unlocked: false,
                isDefaultStar: false,
                key: "perfectEscape",
                label: {
                  txt: "missions.evade.stars.perfectEscape",
                  context: {
                    hideoutScl: "7",
                    roadblockChance: "0.5",
                    respawnRateDown: "0.400000006",
                    hideoutFailText: "missions.evade.general.destinationPolice",
                    timeBronze: "200",
                    goalOffenses: "3",
                    damageLimit: "20000",
                    longTime: "200",
                    propConfig: "lights",
                    timeSilver: "120",
                    pursuitMode: "2",
                    startTitle: "missions.evade.wcusa.hideAtHome.title",
                    evadeLimit: "60",
                    propConfigPath: "/vehicles/sawhorse/lights.pc",
                    propModel: "sawhorse",
                    propAmount: "1",
                    startText: "missions.evade.wcusa.hideAtHome.start",
                    arrestFailText: "missions.evade.general.arrestFail",
                    damageFailText: "missions.evade.general.damageFail",
                    arrestLimit: "5",
                    goalScore: "3000",
                    dropOffText: "missions.evade.general.destinationEscape",
                    spawnAmount: "2",
                    hideoutEvadeRadius: "50",
                    timeGold: "80",
                    goalPoliceWrecks: "3",
                    respawnRate: "1.799999952",
                    goalRoadblocks: "3",
                    goalCollisions: "3",
                    policeHeadStart: "0",
                  },
                },
              },
            ],
            defaultUnlockedStarCount: 0,
            totalStars: 5,
            totalUnlockedStarCount: 0,
          },
        },
        defaultUserSettings: {
          spawnTraffic: true,
          useGroundmarkers: true,
          presetVehicleActive: true,
        },
        hasUserSettingsUnlocked: false,
        leaderboardKey: "highscore",
        devMission: false,
        unlocks: {
          visible: true,
          depth: 10,
          startable: true,
          backward: {},
          branchTags: {
            specialized: true,
          },
          maxBranchlevel: 1,
          startableDetails: {
            met: true,
            condition: {
              level: 1,
              branchId: "specialized",
              type: "branchLevel",
            },
            label: {
              txt: "missions.missions.unlock.attributeLevel.atLeast",
              context: { level: 1, branchName: "ui.career.specialized" },
            },
          },
          forward: ["west_coast_usa/evade/002-Money"],
        },
        missionTypeLabel: "bigMap.missionLabels.evade",
        additionalAttributes: [
          { icon: "directions_car", valueKey: "Own or Provided Vehicle", labelKey: "Vehicle Used" },
          { icon: "flag", valueKey: "Low", labelKey: "Difficulty" },
        ],
      },
    ],
    isWalking: false,
  },
}
