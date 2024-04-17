angular
  .module("beamng.stuff")

  .service("TasklistService", [
    "$state",
    "$rootScope",
    function ($state, $rootScope) {
      let listeningScope

      let listVisible = false

      let taskData = {
        headerLabel: "",
        headersubtext: "",
        tasks: {
          test: {
            /**{
          icon:'check_box',
          //textDecoration:'line-through',
          label:'Test Goal',
          subtext:'Use some other things to do other things. This is just an explanation'
          //textColor: 'gray'
        },
        tes2: {
          icon:'check_box',
          //textDecoration:'line-through',
          label:'Test Goal 2',
          subtext:'Use some other things to do other things222 2  . This is just an explanation'
          //textColor: 'gray'
        }*/
          },
        },
      }

      const inform = (eventName, data = undefined) => listeningScope && listeningScope.$emit(eventName, data),
        setListeningScope = scope => (listeningScope = scope),
        clear = () =>
          (taskData = {
            headerLabel: "",
            headersubtext: "",
            tasks: {},
          }),
        setVisibility = visible => (listVisible = visible)

      $rootScope.$on("ClearTasklist", () => {
        clear()
        inform("taskListCleared")
      })

      $rootScope.$on("HideCareerTasklist", () => {
        setVisibility(false)
        inform("taskListVisibilityChanged", listVisible)
      })

      $rootScope.$on("SetTasklistHeader", (ev, data) => {
        if(data) {
          taskData.headerLabel = data.label
          taskData.headersubtext = data.subtext
        } else {
          taskData.headerLabel = null
          taskData.headersubtext = null
        }
        inform("taskListHeaderChanged", data)
        if (!listVisible) {
          setVisibility(true)
          inform("taskListVisibilityChanged", listVisible)
        }
      })

      $rootScope.$on("SetTasklistTask", function (event, args) {
        if (args.id === null || args.id === undefined) args.id = "default"

        let cat = args.id
        let oldData = taskData.tasks[cat] || {}
        let data = {}

        if (args.clear) {
          delete taskData.tasks[cat]
        } else {
          let data = taskData.tasks[cat]
          let label = args.label
          if (!data) {
            taskData.tasks[cat] = {}
            data = taskData.tasks[cat]
          }
          if (args.label !== undefined) data.label = args.label
          if (args.subtext !== undefined) data.subtext = args.subtext
          if (args.text !== undefined) data.text = args.text
          if (args.type !== undefined) data.type = args.type
          if (args.done !== undefined) data.done = args.done
          if (args.active !== undefined) data.active = args.active
          if (args.fail !== undefined) data.fail = args.fail

          if (args.active !== undefined) data.textColor = args.active ? "white" : "gray"

          data.icon = undefined
          if (args.done !== undefined || args.fail !== undefined) {
            let icon = "check_box_outline_blank"
            //let textDecoration = 'none'
            if (args.done) {
              icon = "check_box"
              //textDecoration = 'line-through';
            }
            if (args.fail) {
              icon = "close"
              //textDecoration = 'line-through';
            }
            data.icon = icon
          }
        }

        if (!listVisible) {
          setVisibility(true)
          inform("taskListVisibilityChanged", listVisible)
        }

        inform("taskListMutated", { old: oldData, new: { ...data, done: args.done } })
      })

      return {
        setListeningScope,
        get taskListVisible() {
          return listVisible
        },
        get data() {
          return taskData
        },
      }
    },
  ])
