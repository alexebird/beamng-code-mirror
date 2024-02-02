angular.module('beamng.stuff')
.controller('QuestOverviewController', ['$state', '$stateParams', '$scope', '$rootScope', 'gamepadNav', 'translateService', function ($state, $stateParams, $scope, $rootScope, gamepadNav, translateService) {


  $scope.selectedQuest = null;
  $scope.isMilestone = true;
  $scope.orderBy = "progress";

  $scope.showActive = true;
  $scope.showLocked = false;
  $scope.showCompleted = true;
  $scope.hideClaimedQuests = true;

  $scope.$on('$destroy', function() {
    //bngApi.engineLua("career_career.requestPause(false)");
  })
  $scope.$on('QuestsChanged', function () {
    $scope.updateQuests()
  })

  $scope.goToQuestDetails = function(quest) {
    $scope.selectedQuest = quest
  }
  $scope.hideQuestDetails = function() {
    $scope.selectedQuest = null
  }
  $scope.trackQuest = function(questId, tracked) {
    bngApi.engineLua("career_modules_questManager.setQuestAsTracked('"+questId+"', "+tracked+")")
  }
  $scope.setQuestAsNotNew = function(questId) {
    bngApi.engineLua("career_modules_questManager.setQuestAsNotNew('"+questId+"')")
  }
  
  $scope.claimQuestRewards = function(questId) {
    bngApi.engineLua("career_modules_questManager.UIClaimRewards('"+questId+"')")
  }

  //FILTERS
  $scope.showQuests = function(value) {
    $scope.isMilestone = value
  }

  function scoreRewards(quest){
    let rewardsScore = 0;
    quest.rewards.forEach(function(reward){
      rewardsScore += reward.rewardAmount
    });
    return rewardsScore
  }

  function scoreProgress(quest){
    let progressScore = 0;
    if(!quest.progress){
      return 0;
    }
    quest.progress.forEach(function(progress){
      if(progress.type === "checkBox"){
        progressScore += progress.done ? 100 : 0;
      }
      if(progress.type === "progressBar"){
        progressScore += progress.percentage;
      }
    });
    return progressScore / quest.progress.length
  }

  $scope.updateQuests = function() {
    bngApi.engineLua('career_modules_questManager and career_modules_questManager.getUIFormattedQuests()', function(res) {
    $scope.quests = res

    //---------ORDER BY---------//
    if($scope.orderBy === "rewards"){
      $scope.quests.sort(function(x, y) {
        return scoreRewards(x) > scoreRewards(y)? -1 : 1;
      });
    }
    if($scope.orderBy === "progress"){
      $scope.quests.sort(function(x, y) {
        return scoreProgress(x) > scoreProgress(y)? -1 : 1;
      });
    }
    $scope.quests.sort(function(x, y) {
        return (x === y)? 0 : x.claimable? -1 : 1;
    });
    $scope.quests.sort(function(x, y) {
        return (x === y)? 0 : x.isNew? -1 : 1;
    });


    if($stateParams.questId !== undefined) {
       $scope.quests.forEach(function(q){
        if(q.id == $stateParams.questId) {
            $scope.goToQuestDetails(q);
        }
      })
    }
    })
  }
  $scope.updateQuests()
 
}])

