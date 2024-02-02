export default {
    sample: [{
        "time": 1696397240,
        "entryId": "playerAttributeFinancials",
        "hideInRecent": true,
        "type": "progress",
        "cardTypeLabel": "ui.career.poiCard.generic",
        "text": "<span>Below is an overview of how you spent and earned money.<ul><li><b>Earn money</b> by playing Challenges and completing new Objectives, or by selling Vehicles and Parts.</li><li><b>Spend your Money</b> on new Vehicles and Parts, Insurances and Repairs, or by taking a Taxi.</li></ul><span><i>Disclaimer: Financial values are not balanced yet across the whole of career mode. So you might end up with too much or too little money in the long run.</i></span></span><table style=\"text-align:left; width:100%; margin-top:1.5em;\"><tr style=\"background-color:rgba(0,0,0,0.5)\"><th>Reason</th><th>Change</th><th>Time</th></tr><tr style=\"background-color:rgba(0,0,0,0.2)\"><td>Starting Capital</td><td><span><b>money</b>: +13500.00</span></td><td><div>Wed Oct  4 12:26:15 2023</div></td></tr></table>",
        "title": "Financial History",
        "_ready": true
    }, {
        "time": 1696397239,
        "entryId": "playerAttributeGameplay",
        "hideInRecent": true,
        "type": "progress",
        "cardTypeLabel": "ui.career.poiCard.generic",
        "text": "<span style=\"margin-bottom:0.5em\">Below is an overview of rewards you earned from Challenges and Milestones.<ul><li><b>Money</b> can be used to make purchases.</li><li><b>Beam XP</b> is a measure of your overall general progress, but has no use in game currently.</li><li><b>Branch XP</b> for the four branches will let you reach the next tier of that branch, unlocking new missions.</li><li><b>Bonus Stars</b> can currently only be used for fast repairs.</li></ul></span><br><table style=\"text-align:left; width:100%\"><tr style=\"background-color:rgba(0,0,0,0.5)\"><th>Reason</th><th>Change</th><th>Time</th></tr></table>",
        "title": "Rewards History",
        "_ready": true
    }, {
        "claimed": false,
        "claimable": false,
        "text": "Play challenges from the Adventurer branch to earn <em>Branch XP</em> and reach the next level. Each new level will unlock some <em>new challenges</em> for you to play!<br><br>From daring stunt jumps, to speed traps and other highly-reckless activities, the Adventurer Branch offers that menacing intensity, drama, and innate danger that keeps players coming back for more.",
        "progress": [{
            "done": false,
            "label": {
                "txt": "quest.type.reachBranchLevel.progressBarLabel",
                "context": {
                    "currentXp": 0,
                    "branch": "ui.career.adventurer",
                    "maxXp": 650
                }
            },
            "type": "progressBar",
            "maxValue": 650,
            "minValue": 0,
            "currValue": 0
        }],
        "time": 1696397197,
        "rewards": [{
            "rewardAmount": "1000",
            "attributeKey": "money"
        }, {
            "rewardAmount": "10",
            "attributeKey": "beamXP"
        }],
        "cover": "/gameplay/branches/adventurer/questCover.jpg",
        "questId": "/gameplay/quests/milestones/reachBranchLevel/001-adventurerBranch2",
        "type": "quest",
        "isNew": true,
        "cardTypeLabel": "ui.career.poiCard.milestone",
        "entryId": "/gameplay/quests/milestones/reachBranchLevel/001-adventurerBranch2",
        "title": {
            "txt": "quest.type.reachBranchLevel.title",
            "context": {
                "branch": "ui.career.adventurer",
                "goal": 2
            }
        },
        "_ready": true
    }, {
        "claimed": false,
        "claimable": false,
        "text": "There are numerous quicktravel points all over the map, but they are hidden until you drive close to them! Once discovered, you will be able to teleport there from the <em>map screen</em>.",
        "progress": [{
            "done": false,
            "percentage": 0,
            "label": {
                "txt": "quest.type.discoverQuicktravelPoints.progressBarLabel",
                "context": {
                    "goal": 11,
                    "count": 0
                }
            },
            "type": "progressBar",
            "maxValue": 11,
            "minValue": 0,
            "currValue": 0
        }],
        "time": 1696397196,
        "rewards": [{
            "rewardAmount": "1000",
            "attributeKey": "money"
        }, {
            "rewardAmount": "10",
            "attributeKey": "beamXP"
        }],
        "cover": "/gameplay/quests/west_coast_usa/spawnpoints/logbookEntry.jpg",
        "questId": "/gameplay/quests/west_coast_usa/spawnpoints",
        "type": "quest",
        "isNew": true,
        "cardTypeLabel": "ui.career.poiCard.milestone",
        "entryId": "/gameplay/quests/west_coast_usa/spawnpoints",
        "title": {
            "txt": "quest.type.discoverQuicktravelPoints.title",
            "context": {
                "goal": 11
            }
        },
        "_ready": true
    }, {
        "claimed": false,
        "claimable": false,
        "text": "Spend some time in the game! Your progress for this milestone will come from any type of gameplay in career mode, like <em>challenges</em> or <em>freeroaming</em>.",
        "progress": [{
            "done": false,
            "label": {
                "txt": "quest.type.timePlayed.progressBarLabel2",
                "context": {
                    "countMinutes": 0,
                    "hoursGoal": 1
                }
            },
            "type": "progressBar",
            "maxValue": 3600,
            "minValue": 0,
            "currValue": 40.617926811182
        }],
        "time": 1696397196,
        "rewards": [{
            "rewardAmount": "1000",
            "attributeKey": "money"
        }, {
            "rewardAmount": "10",
            "attributeKey": "beamXP"
        }],
        "cover": "/gameplay/quests/milestones/timePlayed/cover.jpg",
        "questId": "/gameplay/quests/milestones/timePlayed/001-play1hour",
        "type": "quest",
        "isNew": true,
        "cardTypeLabel": "ui.career.poiCard.milestone",
        "entryId": "/gameplay/quests/milestones/timePlayed/001-play1hour",
        "title": {
            "txt": "quest.type.timePlayed.title",
            "context": {
                "goal": 1
            }
        },
        "_ready": true
    }, {
        "claimed": false,
        "claimable": false,
        "text": "Complete challenges to earn <em>stars</em>. Every star can only be earned once.",
        "progress": [{
            "done": false,
            "label": {
                "txt": "quest.type.starsEarned.progressBarLabel",
                "context": {
                    "goal": 5,
                    "count": 0
                }
            },
            "type": "progressBar",
            "maxValue": 5,
            "minValue": 0,
            "currValue": 0
        }],
        "time": 1696397196,
        "rewards": [{
            "rewardAmount": "1000",
            "attributeKey": "money"
        }, {
            "rewardAmount": "10",
            "attributeKey": "beamXP"
        }],
        "cover": "/gameplay/quests/milestones/starsEarned/cover.jpg",
        "questId": "/gameplay/quests/milestones/starsEarned/001-earn5stars",
        "type": "quest",
        "isNew": true,
        "cardTypeLabel": "ui.career.poiCard.milestone",
        "entryId": "/gameplay/quests/milestones/starsEarned/001-earn5stars",
        "title": {
            "txt": "quest.type.starsEarned.title",
            "context": {
                "goal": 5
            }
        },
        "_ready": true
    }, {
        "claimed": false,
        "claimable": false,
        "text": "Play challenges from the Specialized branch to earn <em>Branch XP</em> and reach the next level. Each new level will unlock some <em>new challenges</em> for you to play!<br><br>From action-packed police operations and emergency rescues to highly specialized and exclusive deliveries and escorts, the Specialized Branch offers players a chance to step into the big leagues and thrive.",
        "progress": [{
            "done": false,
            "label": {
                "txt": "quest.type.reachBranchLevel.progressBarLabel",
                "context": {
                    "currentXp": 0,
                    "branch": "ui.career.specialized",
                    "maxXp": 1500
                }
            },
            "type": "progressBar",
            "maxValue": 1500,
            "minValue": 0,
            "currValue": 0
        }],
        "time": 1696397196,
        "rewards": [{
            "rewardAmount": "1000",
            "attributeKey": "money"
        }, {
            "rewardAmount": "10",
            "attributeKey": "beamXP"
        }],
        "cover": "/gameplay/branches/specialized/questCover.jpg",
        "questId": "/gameplay/quests/milestones/reachBranchLevel/007-specializedBranch2",
        "type": "quest",
        "isNew": true,
        "cardTypeLabel": "ui.career.poiCard.milestone",
        "entryId": "/gameplay/quests/milestones/reachBranchLevel/007-specializedBranch2",
        "title": {
            "txt": "quest.type.reachBranchLevel.title",
            "context": {
                "branch": "ui.career.specialized",
                "goal": 2
            }
        },
        "_ready": true
    }, {
        "claimed": false,
        "claimable": false,
        "text": "Play challenges from the Motorsport Translation branch to earn <em>Branch XP</em> and reach the next level. Each new level will unlock some <em>new challenges</em> for you to play!<br><br>Motor Descripton",
        "progress": [{
            "done": false,
            "label": {
                "txt": "quest.type.reachBranchLevel.progressBarLabel",
                "context": {
                    "currentXp": 0,
                    "branch": "Motorsport Translation",
                    "maxXp": 1700
                }
            },
            "type": "progressBar",
            "maxValue": 1700,
            "minValue": 0,
            "currValue": 0
        }],
        "time": 1696397196,
        "rewards": [{
            "rewardAmount": "1000",
            "attributeKey": "money"
        }, {
            "rewardAmount": "10",
            "attributeKey": "beamXP"
        }],
        "cover": "/gameplay/branches/motorsport/questCover.jpg",
        "questId": "/gameplay/quests/milestones/reachBranchLevel/005-motorsportBranch2",
        "type": "quest",
        "isNew": true,
        "cardTypeLabel": "ui.career.poiCard.milestone",
        "entryId": "/gameplay/quests/milestones/reachBranchLevel/005-motorsportBranch2",
        "title": {
            "txt": "quest.type.reachBranchLevel.title",
            "context": {
                "branch": "Motorsport Translation",
                "goal": 2
            }
        },
        "_ready": true
    }, {
        "claimed": false,
        "claimable": false,
        "text": "Play challenges from the Labourer branch to earn <em>Branch XP</em> and reach the next level. Each new level will unlock some <em>new challenges</em> for you to play!<br><br>Whether you’re interested in vehicle recovery, delivering heavy machinery, cargo, or people; the Labourer Branch offers a wide variety of fulfilling-yet-daunting task-oriented challenges to overcome.",
        "progress": [{
            "done": false,
            "label": {
                "txt": "quest.type.reachBranchLevel.progressBarLabel",
                "context": {
                    "currentXp": 0,
                    "branch": "ui.career.labourer",
                    "maxXp": 900
                }
            },
            "type": "progressBar",
            "maxValue": 900,
            "minValue": 0,
            "currValue": 0
        }],
        "time": 1696397196,
        "rewards": [{
            "rewardAmount": "1000",
            "attributeKey": "money"
        }, {
            "rewardAmount": "10",
            "attributeKey": "beamXP"
        }],
        "cover": "/gameplay/branches/labourer/questCover.jpg",
        "questId": "/gameplay/quests/milestones/reachBranchLevel/003-labourerBranch2",
        "type": "quest",
        "isNew": true,
        "cardTypeLabel": "ui.career.poiCard.milestone",
        "entryId": "/gameplay/quests/milestones/reachBranchLevel/003-labourerBranch2",
        "title": {
            "txt": "quest.type.reachBranchLevel.title",
            "context": {
                "branch": "ui.career.labourer",
                "goal": 2
            }
        },
        "_ready": true
    }, {
        "claimed": false,
        "claimable": false,
        "text": "Explore the world by <em>driving around</em>. Your progress for this milestone will come from any type of gameplay in career mode, like <em>challenges</em> or <em>freeroaming</em>.",
        "progress": [{
            "done": false,
            "label": {
                "txt": "quest.type.distanceDriven.progressBarLabel",
                "context": {
                    "goal": 5000,
                    "count": 0
                }
            },
            "type": "progressBar",
            "maxValue": 5000,
            "minValue": 0,
            "currValue": 0
        }],
        "time": 1696397196,
        "rewards": [{
            "rewardAmount": "1000",
            "attributeKey": "money"
        }, {
            "rewardAmount": "10",
            "attributeKey": "beamXP"
        }],
        "cover": "/gameplay/quests/milestones/distanceDriven/cover.jpg",
        "questId": "/gameplay/quests/milestones/distanceDriven/001-drive5km",
        "type": "quest",
        "isNew": true,
        "cardTypeLabel": "ui.career.poiCard.milestone",
        "entryId": "/gameplay/quests/milestones/distanceDriven/001-drive5km",
        "title": {
            "txt": "quest.type.distanceDriven.title",
            "context": {
                "goal": 5000
            }
        },
        "_ready": true
    }, {
        "claimed": false,
        "claimable": false,
        "text": "<h2>I'm level two, boyo!</h2><h3>I was supposed to be the only one heading here, but meeh (also testing br)</h3> <h4>That's too much, y do u need 4 headers?</h4> <h5>U mad bro?</h5> <ul> <li>I'm a list element</li> <li>I'm a list element</li> <li>I'm a list element containing some <ul><li>additional list inside</li></ul></li> <li>I'm a list element</li> </ul> <ol> <li>I'm a list element</li> <li>I'm a list element</li> <li>I'm a list element</li> <li>I'm a list element</li> </ol> Lorem <em>ehm-phasize a part of the text, use &lt;em&gt; </em> ipsum <code>Monospace stuff goes here with &lt;code&gt; </code> If you have a <strong>strong</strong> opinion on something, use <strong>this → &lt;strong&gt;</strong> <b>bold tex will be simply bold</b> Some testing quest description asiuh iug kjhgv kjhg kjhg kjhg kjh bkjhg kjh gkj hgkj hgkj hgkj hgkj hgkj hgk jhg kj",
        "progress": [{
            "done": false,
            "label": {
                "txt": "quest.type.distanceDriven.progess",
                "context": {
                    "goal": 128,
                    "count": 50
                }
            },
            "type": "progressBar",
            "maxValue": 128,
            "minValue": 0,
            "currValue": 0
        }, {
            "done": false,
            "label": {
                "txt": "quest.type.distanceDriven.progess",
                "context": {
                    "goal": 128,
                    "count": 50
                }
            },
            "type": "progressBar",
            "maxValue": 128,
            "minValue": 0,
            "currValue": 50
        }, {
            "done": true,
            "label": {
                "txt": "quest.type.distanceDriven.progess",
                "context": {
                    "goal": 128,
                    "count": 50
                }
            },
            "type": "progressBar",
            "maxValue": 128,
            "minValue": 0,
            "currValue": 128
        }, {
            "type": "checkbox",
            "done": true,
            "label": "Some Demo Text"
        }, {
            "type": "checkbox",
            "done": false,
            "label": "Some Demo Text asdf as"
        }, {
            "type": "checkbox",
            "done": true,
            "label": "Some"
        }, {
            "type": "checkbox",
            "done": false,
            "label": "Some Demo Textdddddddddddddddddd"
        }],
        "time": 1696397196,
        "rewards": [{
            "rewardAmount": "1000",
            "attributeKey": "money"
        }, {
            "rewardAmount": "10",
            "attributeKey": "beamXP"
        }],
        "cover": "/ui/modules/gameContext/noPreview.jpg",
        "questId": "/gameplay/quests/debug/001-debug",
        "type": "quest",
        "isNew": true,
        "cardTypeLabel": "ui.career.poiCard.milestone",
        "entryId": "/gameplay/quests/debug/001-debug",
        "title": {
            "txt": "quest.type.distanceDriven.goal",
            "context": {}
        },
        "_ready": true
    }, {
        "text": "<h3>Welcome to BeamNG's Career mode!</h3><p>Please note that this is an <em>early version</em>, and as the game evolves, save files will not be compatible with updates. While you can freely try out different gameplay elements, keep in mind that systems might change in the future.</p><h4>Two New Features</h4><ul>  <li><strong>Onboarding Tutorial</strong></li>  <li><strong>Updated Logbook</strong>: More functional and better integrated. Keep track of new information, progress and unlocks like before, and now see an overview of your financial rewards history!</li>  <li><strong>Bonus Stars</strong>: Accumulate and redeem Bonus Stars in place of money for Quick Repairs to your vehicle, many more uses are in the works.</li>  <li><strong>Vehicle Insurance</strong>: You're now in charge of your vehicle's repairs. If you crash or damage it, you'll only need to cover a reduced repair cost through insurance.</li></ul>",
        "isNew": false,
        "entryId": 14,
        "time": 1696397175,
        "title": "ui.introPopup.welcome.title",
        "ratio": "16x9",
        "type": "info",
        "showMessage": true,
        "cardTypeLabel": "ui.career.poiCard.generic",
        "cover": "/ui/modules/careerLogbook/pages/welcome/header.jpg",
        "_ready": true
    }, {
        "text": "<h3>Gameplay Information and Overview</h3><p>You can find <em>detailed information</em> about gameplay elements within this Logbook. Access it through the pause menu. In here, you will find information about various topics:</p><ul>  <li><strong>General Information</strong>: Texts like these, with information about things you can find and do in Career Mode.</li>  <li><strong>Milestones</strong>: Similar to Achievements in other games, Milestones are background objectives that track your progress.</li>  <li><strong>Unlocks</strong>: Newly unlocked challenges, quicktravel points and more.</li></ul><p>In future updates, you can find additional information here, so stay tuned!</p>",
        "isNew": true,
        "entryId": 13,
        "time": 1696397175,
        "title": "ui.introPopup.logbook.title",
        "ratio": "16x9",
        "type": "info",
        "showMessage": true,
        "cardTypeLabel": "ui.career.poiCard.generic",
        "cover": "/ui/modules/careerLogbook/pages/logbook/header.jpg",
        "_ready": true
    }, {
        "text": "<p>In BeamNG.drive, you can not only drive cars, but also walk around outside of them and explore the gameworld.</p><ul>  <li>Use <BngBinding action=\"unicycle__walkUpDown\" :show-unassigned=\"false\"/><BngBinding action=\"unicycle__walkLeftRight\" :show-unassigned=\"false\"/> <BngBinding action=\"unicycle__walkUp\" :show-unassigned=\"false\"/><BngBinding action=\"unicycle__walkLeft\" :show-unassigned=\"false\"/><BngBinding action=\"unicycle__walkDown\" :show-unassigned=\"false\"/><BngBinding action=\"unicycle__walkRight\" :show-unassigned=\"false\"/> to walk around.</li>  <li>Press <BngBinding action=\"unicycle__jump\" :show-unassigned=\"false\"/> to jump and <BngBinding action=\"unicycle__crouchToggle\" :show-unassigned=\"false\"/> to crouch.</li>  <li>Hold <BngBinding action=\"unicycle__sprintHold\" :show-unassigned=\"false\"/> to sprint.</li>  <li>Use <BngBinding action=\"rotate_camera_vertical\" :show-unassigned=\"false\"/><BngBinding action=\"rotate_camera_horizontal\" :show-unassigned=\"false\"/> <BngBinding action=\"rotate_camera_vt_mouse\" :show-unassigned=\"false\"/><BngBinding action=\"rotate_camera_hz_mouse\" :show-unassigned=\"false\"/><BngBinding action=\"rotate_camera_up\" :show-unassigned=\"false\"/><BngBinding action=\"rotate_camera_left\" :show-unassigned=\"false\"/><BngBinding action=\"rotate_camera_down\" :show-unassigned=\"false\"/><BngBinding action=\"rotate_camera_right\" :show-unassigned=\"false\"/> to look around.</li><li>Press <BngBinding action=\"toggleWalkingMode\" :show-unassigned=\"false\"/> to enter or exit vehicles.</li></ul><p>Use these controls get in and out of vehicles. Sometimes, it is required to be in walking mode to interact with objects such as doors or computers.</p>",
        "isNew": true,
        "entryId": 12,
        "time": 1696397175,
        "title": "ui.introPopup.walkingMode.title",
        "ratio": "16x9",
        "type": "info",
        "showMessage": true,
        "cardTypeLabel": "ui.career.poiCard.generic",
        "cover": "/ui/modules/careerLogbook/pages/walkingMode/header.jpg",
        "_ready": true
    }, {
        "text": "<p>While seated inside a vehicle, there are multiple cameras you can chose from. The three most commonly used ones are:</p><ul>  <li>Orbit Cam: View your vehicle from the outside, usually behind the vehicle. Good for knowing where your vehicle is in relation to the surroundings.</li>  <li>Driver Cam: View your vehicle and the road from the driver seat position. The most immersive one!</li>  <li>Hood Cam: View the road from the hood of the vehicle. Gives you a good sense of speed while not obstructing your view with the inside of the vehicle.</li></ul><p>This is how you control the camera:</p><ul>  <li>Press <BngBinding action=\"switch_camera_next\" :show-unassigned=\"false\"/> to cycle through available cameras.</li>  <li>Press <BngBinding action=\"center_camera\" :show-unassigned=\"false\"/> to reset the camera orientation.</li>  <li>Hold <BngBinding action=\"look_back\" :show-unassigned=\"false\"/> to look back.</li>  <li>Use <BngBinding action=\"rotate_camera_vertical\" :show-unassigned=\"false\"/><BngBinding action=\"rotate_camera_horizontal\" :show-unassigned=\"false\"/> <BngBinding action=\"rotate_camera_vt_mouse\" :show-unassigned=\"false\"/><BngBinding action=\"rotate_camera_hz_mouse\" :show-unassigned=\"false\"/><BngBinding action=\"rotate_camera_up\" :show-unassigned=\"false\"/><BngBinding action=\"rotate_camera_left\" :show-unassigned=\"false\"/><BngBinding action=\"rotate_camera_down\" :show-unassigned=\"false\"/><BngBinding action=\"rotate_camera_right\" :show-unassigned=\"false\"/> to rotate the camera.</li></ul><p>There are also shortcut and additional camera controls. You can find more in the Settings.</p>",
        "isNew": true,
        "entryId": 11,
        "time": 1696397175,
        "title": "ui.introPopup.cameras.title",
        "ratio": "16x9",
        "type": "info",
        "showMessage": true,
        "cardTypeLabel": "ui.career.poiCard.generic",
        "cover": "/ui/modules/careerLogbook/pages/cameras/header.jpg",
        "_ready": true
    }, {
        "text": "<h3>Basic Driving Controls</h3><p>Coming soon: <strong>Driving Fundamentals</strong>. Master essential driving skills and progress to intermediate and expert techniques.</p>",
        "isNew": true,
        "entryId": 10,
        "time": 1696397175,
        "title": "ui.introPopup.driving.title",
        "ratio": "16x9",
        "type": "info",
        "showMessage": true,
        "cardTypeLabel": "ui.career.poiCard.generic",
        "cover": "/ui/modules/careerLogbook/pages/driving/header.jpg",
        "_ready": true
    }, {
        "text": "<p>This text explains what to do when youn crashed.</p><p>Open the <strong>Recovery Menu</strong> using <BngBinding action=\"reset_physics\" :show-unassigned=\"true\"/> and help yourself.</p><ul>  <li><strong>Accidents 101</strong>: Flip, recover, tow and more.</li>  <li><strong>Vehicle Insurance</strong>: Great news, drivers! You can now breathe easy knowing that a single crash won't send you into immediate financial turmoil. Drive with confidence!</li><p>Open the <strong>Recovery Menu</strong> using <BngBinding action=\"reset_physics\" :show-unassigned=\"true\"/> and help yourself.</p></ul>",
        "isNew": true,
        "entryId": 9,
        "time": 1696397175,
        "title": "ui.introPopup.crashRecover.title",
        "ratio": "16x9",
        "type": "info",
        "showMessage": true,
        "cardTypeLabel": "ui.career.poiCard.generic",
        "cover": "/ui/modules/careerLogbook/pages/crashRecover/header.jpg",
        "_ready": true
    }, {
        "text": "<p>The Map View gives you an overview of the level you&#39;re currently in and you can see various Point of Interest (POIs): Challenges, Quicktravel Points, Garages, Fuel Stations. You can select and filter these POIs using the controls on the left. On the right, you can see details of the POI and set a route or teleport to some of them. You can also set a route to a custom destination by clicking anywhere on the map.</p><ul>  <li>Press <BngBinding action=\"toggleBigMap\" :show-unassigned=\"false\"/> to open and close the map.</li>  <li>Press <BngBinding action=\"bigMapControllerSelect\" :show-unassigned=\"false\"/> <BngBinding action=\"bigMapMouseClick\" :show-unassigned=\"false\"/> to select a POI from the map.</li>  <li>Press <BngBinding action=\"bigMapNextFilter\" :show-unassigned=\"false\"/><BngBinding action=\"bigMapPreviousFilter\" :show-unassigned=\"false\"/> to cycle through the filters.</li>  <li>Use <BngBinding action=\"bigMapMoveForwardBackward\" :show-unassigned=\"false\"/><BngBinding action=\"bigMapMoveLeftRight\" :show-unassigned=\"false\"/> <BngBinding action=\"bigMapMoveForward\" :show-unassigned=\"false\"/><BngBinding action=\"bigMapMoveLeft\" :show-unassigned=\"false\"/><BngBinding action=\"bigMapMoveBackward\" :show-unassigned=\"false\"/><BngBinding action=\"bigMapMoveRight\" :show-unassigned=\"false\"/> to move the camera in the map view.</li>  <li>Use <BngBinding action=\"bigMapControllerZoom\" :show-unassigned=\"false\"/> <BngBinding action=\"bigMapZoom\" :show-unassigned=\"false\"/> <BngBinding action=\"bigMapZoomIn\" :show-unassigned=\"false\"/><BngBinding action=\"bigMapZoomOut\" :show-unassigned=\"false\"/> to zoom in and out.</li></ul><p>Use these controls to open the map and set a route to any desired POI.</p>",
        "isNew": true,
        "entryId": 8,
        "time": 1696397175,
        "title": "ui.introPopup.bigmap.title",
        "ratio": "16x9",
        "type": "info",
        "showMessage": true,
        "cardTypeLabel": "ui.career.poiCard.generic",
        "cover": "/ui/modules/careerLogbook/pages/bigmap/header.jpg",
        "_ready": true
    }, {
        "text": "<p>Fuel Stations let you refuel your car.</p><ul>  <li>Stop your car next to a fuel pump or an electric charging station.</li>  <li>Open the <strong>Refueling Menu</strong> using the prompt at the top of the screen.</li></ul><p>Keep in mind that fuel costs money!</p>",
        "isNew": true,
        "entryId": 7,
        "time": 1696397175,
        "title": "ui.introPopup.refueling.title",
        "ratio": "16x9",
        "type": "info",
        "showMessage": true,
        "cardTypeLabel": "ui.career.poiCard.generic",
        "cover": "/ui/modules/careerLogbook/pages/refueling/header.jpg",
        "_ready": true
    }, {
        "text": "<p>While exploring the world, you will discover all sorts of different gameplay <strong>Challenges</strong>; These are self-contained segments of gameplay that come in different forms. Here is a few examples of challenges:</p><ul>  <li>Time Trials: Race against the clock.</li>  <li>Chases: Stop an escaping vehicle.</li>  <li>Deliveries: Deliver cargo to a destination</li>  <li>Knockaway: Score points by knocking over obstacles.</li></ul><p>Challenges present specific goals for players to achieve. These goals can range from beating a specific time to scoring a number of points and more. These goals are represented by <strong>Stars</strong> and come in two types:</p><ul>  <li>Objective Stars: These are the main objectives of the challenge. There are usually three Objective Stars.</li>  <li>Bonus Stars: These are optional objectives for challenges and they reward a type of secondary currency. Accumulate Bonus Stars and redeem them for Quick Repairs to your vehicle for now, with many much-more exciting uses in development.</li></ul><p>Beating the goal and getting the star will give you a one-time reward, usually money, BeamXP or Branch XP, but more about that later. Some challenges will also let you modify their settings after you've beaten them.</p><p>Drive to a challenge and follow the instructions to complete it.</p>",
        "isNew": true,
        "entryId": 6,
        "time": 1696397175,
        "title": "ui.introPopup.missions.title",
        "ratio": "16x9",
        "type": "info",
        "showMessage": true,
        "cardTypeLabel": "ui.career.poiCard.generic",
        "cover": "/ui/modules/careerLogbook/pages/missions/header.jpg",
        "_ready": true
    }, {
        "text": "<p>Use <strong>Dealerships</strong>to purchase new and used vehicles.</p><ul>  <li>Park near a dealership and get out of your car.</li>  <li>Walk towards the entry of the dealership, marked with a door icon.</li>  <li>Open the <strong>Dealership Menu</strong> using the prompt at the top of the screen.</li>  <li><strong>Private Sales</strong>: Browse the computer inside of the garage to view all available inventory, some vehicles are sold privately and require you to check them out in various locations that are not dealerships!</li></ul><p>You will see a selection of vehicles to chose from. You can purchase them directly or check them out in person before you make a decision. You can also take them for a test drive. Keep in mind there are various fees and taxes to pay when purchasing!</p><p>The selection of cars will change periodically, so check in from time to time to see what is in store.</p>",
        "isNew": true,
        "entryId": 5,
        "time": 1696397175,
        "title": "ui.introPopup.dealership.title",
        "ratio": "16x9",
        "type": "info",
        "showMessage": true,
        "cardTypeLabel": "ui.career.poiCard.generic",
        "cover": "/ui/modules/careerLogbook/pages/dealership/header.jpg",
        "_ready": true
    }, {
        "text": "<p>Test drives let you experience a vehicle before making the purchase.</p><ul>  <li>While inspecting a vehicle, you can start the test drive.</li>  <li>Make sure to not damage the vehicle!</li>  <li>After some time, the test drive will end. You can also end it early.</li></ul><p>Remember, each vehicle offers a one-time test drive. Experience a vehicle before deciding whether to purchase it or explore other options.</p>",
        "isNew": true,
        "entryId": 4,
        "time": 1696397175,
        "title": "ui.introPopup.testdrive.title",
        "ratio": "16x9",
        "type": "info",
        "showMessage": true,
        "cardTypeLabel": "ui.career.poiCard.generic",
        "cover": "/ui/modules/careerLogbook/pages/testdrive/header.jpg",
        "_ready": true
    }, {
        "text": "<p>The <strong>Computer</strong> lets you access various menues to modify your vehicle, or browse vehicles for sale online.</p><ul>  <li>Parts Management</li>  <li>Vehicle Inventory</li>  <li>Tuning</li></ul><p>The computer interface is under heavy WIP at the moment and will function as the primary vehicle management hub within Career Mode. For now it has limited functionality but can be used to purchase vehicles and parts, manage your inventory and repairs, and can be used to tune your vehicle.</p>",
        "isNew": true,
        "entryId": 3,
        "time": 1696397175,
        "title": "ui.introPopup.computer.title",
        "ratio": "16x9",
        "type": "info",
        "showMessage": true,
        "cardTypeLabel": "ui.career.poiCard.generic",
        "cover": "/ui/modules/careerLogbook/pages/computer/header.jpg",
        "_ready": true
    }, {
        "text": "<p>In the <strong>Part Shopping</strong>, you can purchase and switch out parts of your vehicle with new ones, or remove them from your vehicle altogether.</p><ul>  <li>This functionality is under <strong>heavy</strong> development and is planned be changed significantly in future updates.</li></ul><p>Keep in mind parts cost money!</p>",
        "isNew": true,
        "entryId": 2,
        "time": 1696397175,
        "title": "ui.introPopup.partShopping.title",
        "ratio": "16x9",
        "type": "info",
        "showMessage": true,
        "cardTypeLabel": "ui.career.poiCard.generic",
        "cover": "/ui/modules/careerLogbook/pages/partShopping/header.jpg",
        "_ready": true
    }, {
        "text": "<p>In the <strong>Tuning Menu</strong>, you can modify individual tuning values for your vehicles, such as tire pressure or camber. </p><ul><li>This functionality is under <strong>heavy</strong> development and is planned be changed significantly in future updates.</li></ul>",
        "isNew": true,
        "entryId": 1,
        "time": 1696397175,
        "title": "ui.introPopup.tuning.title",
        "ratio": "16x9",
        "type": "info",
        "showMessage": true,
        "cardTypeLabel": "ui.career.poiCard.generic",
        "cover": "/ui/modules/careerLogbook/pages/tuning/header.jpg",
        "_ready": true
    }, {
        "text": "<h3>The Player Garage</h3>Using the the garage, you can <em>upgrade and personalize</em> your vehicle. Overall pricing balancing is under <strong>heavy</strong> development at the moment.  Costs associated with purchasing and modifing vehicles is not thoroughly tested and only serves to expose the basic functionality.To use the garage functionality simply park your small to medium sized vehicle within the yellow lines and follow the on-screen prompt, larger vehicles can be parked on the concrete pad located just outside of the garage and activate the garage mode from there. Feel free to enter Walking Mode and approach the laptop inside the garage and manage your vehicles from there as well.",
        "isNew": true,
        "entryId": 0,
        "time": 1696397175,
        "title": "ui.introPopup.milestones.title",
        "ratio": "16x9",
        "type": "info",
        "showMessage": true,
        "cardTypeLabel": "ui.career.poiCard.generic",
        "cover": "/ui/modules/careerLogbook/pages/milestones/header.jpg",
        "_ready": true
    }]
}