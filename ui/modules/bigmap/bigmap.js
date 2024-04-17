angular.module('beamng.stuff')
  .controller('BigMapController', ['$state', '$stateParams','$scope', 'Utils', 'gamepadNav', 'translateService', 'CareerStyles', 'InputCapturer', 'IntroPopup', function ($state, $stateParams, $scope, Utils, gamepadNav, translateService, CareerStyles, InputCapturer, IntroPopup) {
    //var crossfireEnabled = gamepadNav.crossfireEnabled()
    //var gamepadNavEnabled = gamepadNav.gamepadNavEnabled()
    //var spatialNavEnabled = gamepadNav.spatialNavEnabled()
    // gamepadNav.enableCrossfire(true)
    // gamepadNav.enableGamepadNav(false)

    $scope.filterData = {}
    $scope.selectedFilter = 0;
    $scope.reducedPois = []

    $scope.reducePoisToSelected = false
    $scope.reducedPoisIds = {}

    // mission details view
    $scope.selectedMission = null
    $scope.selectedMissionForwardUnlocks = false
    $scope.selectedMissionBackwardUnlocks = false
    $scope.selectedMissionHasStartableDetails = false



    $scope.$on('BigmapMissionData', (event, data) => {
      $scope.$evalAsync(() => {
        $scope.levelData = data.levelData
        $scope.poiData = data.poiData
        $scope.rules = data.rules
        $scope.reducedPois = Object.assign({}, $scope.filterData)
        if (Array.isArray(data.filterData)) {
          let first = true;
          for (let itm of data.filterData) {
            // if (itm.key === "branchTag") { // bugged, but should be used in future
            if (itm.branchIcon) {
              if (first) {
                first = false;
                itm.delim = true;
              }
              itm.iconStyle = CareerStyles.style(itm.branchIcon).icon;
            } else if (itm.icon) {
              itm.iconStyle = `-webkit-mask-image: url('/ui/modules/bigmap/icons/mission_system/${itm.icon}.svg');`;
            }
          }
        }
        $scope.filterData = data.filterData
        sendFilterDataToLua()

        if ($stateParams.missionId) {
          for(let f of data.filterData) {
            for (let g of f.groups) {
              if (g.elements && Array.isArray(g.elements)) {
                for (let id of g.elements) { // this property can be something else but an array?
                  let m = data.poiData[id]
                  if (m.type == 'mission' && m.id == $stateParams.missionId) {
                    $scope.setSelectedFilter(data.filterData.indexOf(f))
                    $scope.navigateTo($stateParams.missionId)
                    $scope.poiOnClick(m)
                    return
                  }
                }
              }
            }
          }
          $stateParams.missionId = null
        }

        if (data.selectedFilterKey) {
          for (let f of data.filterData) {
            if (f.key == data.selectedFilterKey) {
              $scope.setSelectedFilter(data.filterData.indexOf(f))
            }
          }
        }
      })
    })

    $scope.$on('onChangeBigmapFilterIndex', (event, data) => {
      $scope.$evalAsync(() => {
        if (data.change === -1) {
          $scope.selectPreviousFilter()
        } else {
          $scope.selectNextFilter()
        }
      })
    })

    $scope.navigateTo = function (poiId) {
      bngApi.engineLua(`if freeroam_bigMapMode then freeroam_bigMapMode.navigateToMission("${poiId}") end`);
    };

    $scope.selectPoi = function (poiId) {
      bngApi.engineLua(`if freeroam_bigMapMode then freeroam_bigMapMode.selectPoi("${poiId}") end`);
    };

    $scope.onHover = function (poiId, active) {
      bngApi.engineLua(`if freeroam_bigMapMode then freeroam_bigMapMode.poiHovered("${poiId}",${active}) end`);
    };

    let prevElement, curContainer;
    function saveBack(selectElementID=null, fromContainerID=null) {
      prevElement = document.activeElement;
      curContainer = fromContainerID;
      if (selectElementID) {
        const btn = document.getElementById(selectElementID);
        if (btn)
          try { btn.focus(); } catch (fire) {}
      }
    }
    function returnBack() {
      // return focus to poi and prevent going back in menu
      try { prevElement.focus(); } catch (fire) {}
      prevElement = null;
      curContainer = null;
      // $scope.selectPoi(); // ???
      $scope.selectedMission = null;
    }
    const captureInput = InputCapturer({
      backAction() { // action on Esc/B
        if ($scope.modalMission || $scope.modalGarage) {
          $scope.teleportToSpawnPoint();
          return true;
        }
        if ($scope.modalMission) {
          const btn = document.getElementById("bigmap-popup-cancel");
          if (btn)
            try { btn.click(); } catch (fire) {}
          if (!prevElement)
            return true;
        }
        if (prevElement) {
          if (curContainer) {
            // check if we're inside bigmap details
            let elm = document.activeElement;
            while (elm.nodeType === Node.ELEMENT_NODE) {
              if (elm.id === curContainer) {
                returnBack();
                return true;
              }
              elm = elm.parentNode;
            }
          } else {
            returnBack();
            return true;
          }
        }
        return false;
      }
    });
    captureInput(true);


    $scope.teleportToPoi = function (data) {
      if (data.id) {
        bngApi.engineLua(`if freeroam_bigMapMode then freeroam_bigMapMode.teleportToPoi("${data.id}") end`);
      }
    };

    $scope.inCareer = false;
    bngApi.engineLua("career_career.isActive()", data => $scope.inCareer = !!data);

    function rows2cols(data) {
      return data.labels.map((label, i) => [
        { label },
        ...(Array.isArray(data.rows) ? data.rows : []).map(arr => arr[i])
      ]);
    }
    /// test code:
    // console.log(rows2cols({
    //   labels: ["aaa", "bbb"],
    //   rows: [[{a:1}, {b:1}], [{a:2}, {b:2}]]
    // }));
    // should return [ [{label:"aaa"}, {a:1}, {a:2}], [{label:"bbb"}, {b:1}, {b:2}] ]

    $scope.poiOnClick = function(data) {

      if ($scope.selectedMission && $scope.selectedMission.id === data.id) {
        return;
      }
      $scope.selectedMission = null
      $scope.selectedMissionForwardUnlocks = null
      $scope.selectedMissionBackwardUnlocks = null
      $scope.selectedMissionHasStartableDetails = null
      $scope.unlockList = null
      $scope.selectPoi(data.id)
      $scope.selectedMission = data

      if (data.type === "mission") {

        $scope.selectedMissionForwardUnlocks = Object.keys($scope.selectedMission.unlocks.forward).length > 0
        $scope.selectedMissionBackwardUnlocks = Object.keys($scope.selectedMission.unlocks.backward).length > 0
        $scope.selectedMissionHasStartableDetails = Object.keys($scope.selectedMission.unlocks.startableDetails).length > 0
        $scope.unlockList = $scope.buildUnlockList(data.unlocks.startableDetails)

        if (Array.isArray($scope.selectedMission.formattedProgress.unlockedStars.stars) && $scope.selectedMission.formattedProgress.unlockedStars.totalStars > 0) {
          $scope.selectedMission._totals = {
            stars: [0, 0],
            bonusstars: [0, 0],
            money: [0, 0],
            beamXP: [0, 0],
            branches: {}
          };
          for (let star of $scope.selectedMission.formattedProgress.unlockedStars.stars) {
            if (star.isDefaultStar) {
              if (star.unlocked)
                $scope.selectedMission._totals.stars[0]++;
              $scope.selectedMission._totals.stars[1]++;
            } else {
              if (star.unlocked)
                $scope.selectedMission._totals.bonusstars[0]++;
              $scope.selectedMission._totals.bonusstars[1]++;
            }
            if (Array.isArray(star.rewards)) {
              for (let reward of star.rewards) {
                const type = reward.attributeKey;
                let node = $scope.selectedMission._totals;
                if (!node.hasOwnProperty(type)) { // if not in root, create in a branch
                  node = node.branches;
                  if (!node.hasOwnProperty(type))
                    node[type] = [0, 0];
                }
                if (star.unlocked)
                  node[type][0] += reward.rewardAmount;
                node[type][1] += reward.rewardAmount;
              }
            }
          }
        } else {
          $scope.selectedMission._totals = null
        }

        const progress = $scope.selectedMission.formattedProgress.formattedProgressByKey;
        for (let key in progress) {
          progress[key].ownAggregateCols = rows2cols(progress[key].ownAggregate);
          progress[key].attemptsCols = rows2cols(progress[key].attempts);
        }

      /**} else if (data.type === "spawnPoint") {
        $scope.openBigmapTeleportModal(data);
      } else if (data.type === "garage") {
        $scope.openGarageTeleportModal(data);*/
      } else {
      }
      setTimeout(() => saveBack("bigmap-details-default", "bigmap-details"), 100);
    }

    $scope.openBigmapTeleportModal = function (data) {
      saveBack();
      $scope.modalMission = data.id;
      bngApi.engineLua("if freeroam_bigMapMode then freeroam_bigMapMode.openPopupCallback() end");
    };

    $scope.openGarageTeleportModal = function (data) {
      saveBack();
      $scope.modalGarage = data.id;
      bngApi.engineLua("if freeroam_bigMapMode then freeroam_bigMapMode.openPopupCallback() end");
    };

    $scope.buildUnlockList = function(details) {
      let label = `<li>
            ${translateService.contextTranslate(details.label, true)}
            ${details.met ? '(DONE)' : ''}
      `

      if (details.nested && details.nested.length > 0) {
        label += '<ul>'
        details.nested.forEach(function(detail) {
          label += $scope.buildUnlockList(detail)
        })
        label += '</ul>'
      }
      label += '</li>'
      return label;
    }

    $scope.setRoute = function(data) {
      $scope.navigateTo(data.id)
    }

    function sendFilterDataToLua() {
      let filter = $scope.filterData[$scope.selectedFilter]
      if(filter && filter.groups && filter.groups[0]) {
        let shownIdSet = new Set()
        for(const gr of filter.groups) {
          if(gr.elements && gr.elements[0]) {
            for(const poiId of gr.elements) {
              shownIdSet.add(poiId)
            }
          }
        }

        bngApi.engineLua(`if freeroam_bigMapMode then freeroam_bigMapMode.setOnlyIdsVisible(${bngApi.serializeToLua(Array.from(shownIdSet))}) end`)
      }
      bngApi.engineLua(`if freeroam_bigMapMode then freeroam_bigMapMode.deselect() end`)
    }

    $scope.selectPreviousFilter = function() {
      $scope.selectedFilter = $scope.selectedFilter === 0 ?
        $scope.filterData.length - 1 : $scope.selectedFilter - 1
      sendFilterDataToLua()
    }

    $scope.selectNextFilter = function() {
      $scope.selectedFilter = $scope.selectedFilter !== $scope.filterData.length - 1
        ? $scope.selectedFilter + 1 : 0
      sendFilterDataToLua()
    }

    $scope.setSelectedFilter = function(filter) {
      $scope.$evalAsync(() => {
        $scope.selectedFilter = filter
        sendFilterDataToLua()
      })
    }

    $scope.$on('onReducedPoiList', (event, data) => {
      $scope.$evalAsync(() => {
        $scope.reducedPoisIds = data.missionIds
        $scope.reducePoisToSelected = Object.keys($scope.reducedPoisIds).length > 0
        if (!$stateParams.missionId) {
          $scope.selectedMission = null
        }
        $scope.reducePoiGroups()

         // select first element in current filter
        if(data.selectOrder && data.selectOrder.length > 0 && Object.keys($scope.reducedPoisIds).length > 0) {
          let id = data.selectOrder[0]
          let groups = $scope.filterData[$scope.selectedFilter].groups
          for (let g of groups) {
            if (g.elements && Array.isArray(g.elements)) {
              for (let poiId of g.elements) { // this property can be something else but an array?
                let m = $scope.poiData[poiId]
                if (m.id == id) { // select the first element we find
                  $scope.poiOnClick(m)
                  return
                }
              }
            }
          }
        }
      })
    })

    $scope.reducePoiGroups = function() {
      if ($scope.reducePoisToSelected === true) {
        $scope.reducedPois = []
        let hasSetFirstNonEmptyGroup;
        for(let filterIndex=0; filterIndex<$scope.filterData.length; filterIndex++) {
          $scope.reducedPois[filterIndex] = {'groups': [] }
          hasSetFirstNonEmptyGroup = false;
          for(let groupIndex=0; groupIndex<$scope.filterData[filterIndex].groups.length; groupIndex++) {
            $scope.reducedPois[filterIndex].groups[groupIndex] = {'elements': []}

            for(let elementIndex=0; elementIndex<$scope.filterData[filterIndex].groups[groupIndex].elements.length; elementIndex++) {
              let poiId = $scope.filterData[filterIndex].groups[groupIndex].elements[elementIndex];
              let isInReducedPoiIds = $scope.reducedPoisIds[poiId] !== undefined

              if (isInReducedPoiIds) {
                $scope.reducedPois[filterIndex].groups[groupIndex].elements.push(poiId)
              }
            }

            if(hasSetFirstNonEmptyGroup === true) {
              $scope.reducedPois[filterIndex].groups[groupIndex].isFirstNonEmptyGroup = false;
            } else if($scope.reducedPois[filterIndex].groups[groupIndex].elements.length > 0) {
              $scope.reducedPois[filterIndex].groups[groupIndex].isFirstNonEmptyGroup = true;
              hasSetFirstNonEmptyGroup = true;
            }
          }
        }
      } else {
        $scope.reducedPois = Object.assign({}, $scope.filterData)
      }
    }


    // observe what's showing to set the title
    $scope.topGroupIndex = -1;
    let topEntries = {};
    function intersecting(entries) {
      for (let entry of entries) {
        if (entry.target.hasOwnProperty("__observed"))
          topEntries[entry.target.__observed].ratio = entry.intersectionRatio;
      }
      let idx = -1, first = -1;
      for (let index in topEntries) {
        if (first === -1)
          first = topEntries[index].index;
        if (topEntries[index].ratio > 0 && (idx === -1 || idx > topEntries[index].index))
          idx = topEntries[index].index;
      }
      // console.log(idx, entries.map(itm => `${itm.target.__observed} ${itm.intersectionRatio}`), idx > -1 ? topEntries[idx] : "");
      if (idx === -1 && first > -1)
        idx = first;
      $scope.topGroupIndex = idx;
    }
    function topGroupsUpdate() {
      $scope.topGroupName = "";
      topEntries = {};
      $scope.$evalAsync(() => {
        for (let i = 0; i < groupRoot.children.length; i++) {
          const elm = groupRoot.children[i];
          if (!elm.hasOwnProperty("__observed"))
            observer.observe(elm);
          elm.__observed = elm.dataset.groupIndex;
          topEntries[elm.__observed] = {
            index: +elm.__observed,
            ratio: 0
          };
        }
      });
    }
    const groupRoot = document.getElementById("bigmap-pois");
    const observer = new IntersectionObserver(intersecting, {
      // root: groupRoot,
      rootMargin: "0px",
      threshold: 0
    });
    // $scope.$watch("filterData", topGroupsUpdate);
    $scope.$watch("selectedFilter", topGroupsUpdate);
    $scope.$watch("reducedPois", topGroupsUpdate);

    IntroPopup.close("welcome"); // just in case
    $scope.$on('$destroy', function() {
      captureInput(false);
      bngApi.engineLua("if freeroam_bigMapMode then freeroam_bigMapMode.exitBigMap(true) end")
      // gamepadNav.enableCrossfire(crossfireEnabled); // use old value from before opening the menu here
      // gamepadNav.enableGamepadNav(gamepadNavEnabled); // use old value here
      observer.disconnect();
      IntroPopup.close("welcome"); // this should have flavour "bigmap" or something...
    })

    bngApi.engineLua("if freeroam_bigMapPoiProvider then freeroam_bigMapPoiProvider.sendMissionLocationsToMinimap() end");
    bngApi.engineLua("if freeroam_bigMapPoiProvider then freeroam_bigMapPoiProvider.sendCurrentLevelMissionsToBigmap() end");
    bngApi.engineLua("if freeroam_bigMapMode then freeroam_bigMapMode.enterBigMap({instant = true}) end");

}]);
