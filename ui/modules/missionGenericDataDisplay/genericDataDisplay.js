angular
  .module("beamng.stuff")

  .service("GenericMissionDataDisplayService", [
    "$state",
    "$rootScope",
    function ($state, $rootScope) {
      let listeningScope

      let data = {
        sortedKeys : [],
        elements : []
      }

      const inform = (eventName, data = undefined) => listeningScope && listeningScope.$emit(eventName, data),
        setListeningScope = scope => (listeningScope = scope),
        clear = () => (data = {sortedKeys:[],elements:[]})

      $rootScope.$on("SetGenericMissionDataResetAll", () => {
        clear()
        inform("genericMissionDataChanged")
      })

      $rootScope.$on("SetGenericMissionData", function (event, args) {
        if(args.category === undefined) args.category = 'default';
        if(args.order === undefined) args.order = -(1+data.length);

        let matchedCategories = []

        // try to match the category as a regexp. for example, match all "^damage\." categories, and set an empty message to them all
        let re = new RegExp(args.category)
        for (let i in data.elements) {
          if (re.test(i)) {
            matchedCategories.push(i)
          }
        }

        // if no category was found, assume this is not a regexp but an actual category name
        if (matchedCategories.length == 0) matchedCategories.push(args.category)

        // go through all categories, removing previous messages and adding new messages
        for (let i in matchedCategories) {
          let cat = matchedCategories[i]
          if (args.clear) {
            delete data.elements[cat]
          } else {
            // this is not how it is supposed to be, but it breaks messages for whatever reason
            if (args.msg === "") {
              continue
            }
            data.elements[cat] = {
              title: args.title,
              txt: args.txt,
              order: args.order,
              style:args.style,
            }
          }
        }
        data.sortedKeys = Object.keys(data.elements)
        if(data.sortedKeys !== undefined)
          data.sortedKeys.sort((a, b) => (data.elements[a].order < data.elements[b].order) ? 1 : -1)
        inform("genericMissionDataChanged")
      })

      return {
        setListeningScope,
        get data() {
          return data
        },
      }
    },
  ])
