export default {
  status: {
    "bonusStars": 42,
    "money": 10000,
    "beamXP": 123
  },
  initialFuelingData: {
    "energyTypes": ["gasoline"],
    "fuelData": [{
      "unit": "L",
      "pricePerUnit": 1.9,
      "maxEnergy": 35,
      "energyType": "gasoline",
      "currentEnergy": 5.1773834987952,
      "fueledEnergy": 0,
      "price": 0
    }]
  },
  simpleStats: {
    "saveSlotName": "Beam Person",
    "branches": [{
      "title":"Motorsports",
      "levelLabel": {"context":{"lvl":2}, "txt":"ui.career.lvlLabel"},
      "min":150,
      "value":225,
      "max": 350,
    }, {
      "title":"Adventurer",
      "levelLabel": {"context":{"lvl":123}, "txt":"ui.career.lvlLabel"},
      "min":100,
      "value":225,
      "max": 250,
    }]
  },
}
