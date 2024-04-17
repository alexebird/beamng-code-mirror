import { isRef, toRaw } from "vue"
import { formatOptions } from "./common"


export default class PartsSearch {
  /** if search is active */
  active = false
  /** input search text */
  text = ""
  /** parsed search query */
  query = {}
  /** result message (no results or invalid validation) */
  message = ""
  /** flat result array */
  result = []

  queryModes = {
    or: (a, b) => a || b,
    and: (a, b) => a && b,
  }

  history = []
  historyPosition = -1
  historyBrowsing = false
  historyKey = "partSearchHistory"

  currentConfig = []
  partsList = []
  opts = { }

  constructor(currentConfig, partsList, opts = null) {
    if (!isRef(currentConfig)) throw new Error("currentConfig must be ref")
    if (!isRef(partsList)) throw new Error("partsList must be ref")
    // note: it becomes a reactive reactive() instead of ref() because the class is wrapped with reactive(), therefore there's no .value on this after the constructor finishes
    this.currentConfig = currentConfig
    this.partsList = partsList
    if (opts) this.opts = opts
  }

  // applies filters against mod info
  filterPartByName(partName, queryArgs) {
    let part = this.currentConfig.availableParts[partName]
    if (!part) return false

    if (queryArgs.mod) {
      // FIXME: those fields are missing from parts data
      for (const key of ["modName", "modTagLine", "modTitle"]) {
        if (typeof part[key] === "string" && part[key].toLowerCase().indexOf(queryArgs.mod) > -1) return true
      }
    }

    if (queryArgs.author && typeof part.authors === "string" && part.authors.toLowerCase().indexOf(queryArgs.author) > -1) return true
  }

  filterTreeNode(searchResults, treeNode, queryArgs) {
    // match this part first
    let matched = false
    if (queryArgs.mode === "or") matched = false
    else if (queryArgs.mode === "and") matched = true

    const match = (part, key, qkey = null) => typeof part[key] === "string" && queryArgs[qkey || key] && (
      matched = this.queryModes[queryArgs.mode](matched, part[key].toLowerCase().indexOf(queryArgs[qkey || key]) > -1)
    )

    for (const [key, qkey] of [
      // key in data, key in queryArgs (optional if same as key)
      ["name", null],
      ["description", null],
      ["name", "slot"],
    ]) {
      if (match(treeNode, key, qkey)) break
    }

    if (!matched) {
      for (const option of treeNode.options) {
        if (!option.isAuxiliary && !this.opts.showAux) continue
        for (const [key, qkey] of [
          // key in data, key in queryArgs (optional if same as key)
          ["name", null],
          ["description", null],
          ["val", "partname"],
        ]) {
          if (match(option, key, qkey)) break
        }
        if (matched) break
      }
    }

    // mod filters
    if (queryArgs.mod || queryArgs.author) {
      this.filterPartByName(treeNode.val, queryArgs)
      for (const option of treeNode.options) {
        if (option.isAuxiliary && !this.opts.showAux) continue
        if ("val" in option) matched = this.queryModes[queryArgs.mode](matched, this.filterPartByName(option.val, queryArgs))
      }
    }

    if (matched) searchResults.push(treeNode)

    // match child parts
    if (treeNode.parts) {
      for (const part of treeNode.parts) {
        this.filterTreeNode(searchResults, part, queryArgs)
      }
    }
  }

  saveSearchHistory() {
    localStorage.setItem(this.historyKey, JSON.stringify(this.history))
  }

  loadSearchHistory() {
    const res = localStorage.getItem(this.historyKey)
    if (res) this.history = JSON.parse(res) || []
  }

  filterTree() {
    const queryString = this.text.toLowerCase()
    const queryArgs = { mode: "or" }
    this.message = ""
    this.result.splice(0)

    if (queryString.indexOf(":") === -1) {
      // default: search all
      queryArgs.description = queryString
    } else {
      // search by fields
      let parsedargs = 0
      const args = queryString.split(/[ ,]+/)
      for (const arg of args) {
        if (arg.indexOf(":") > -1) {
          const args2 = arg.split(/:/)
          if (args2.length === 2 && args2[1].trim() !== "") {
            queryArgs[args2[0]] = args2[1]
            parsedargs++
          } else {
            this.message += `invalid search format: ${arg}\n`
          }
        } else {
          this.message += `unknown search argument: ${arg}\n`
        }
      }
      if (parsedargs > 1) queryArgs.mode = "and"
    }

    if (queryString != "" && queryString.length < 3) {
      this.message = "Search term too short"
      return
    }
    this.query = queryArgs

    // add to search history
    if (queryString.trim() !== "" && !this.historyBrowsing) {
      let lastHistory = this.history[this.history.length - 1] || ""
      if (queryString.indexOf(lastHistory) > -1) {
        this.history[this.history.length - 1] = queryString
      } else if (lastHistory.indexOf(queryString) > -1) {
        // removing chars do not change the last item
      } else {
        this.history.push(queryString)
      }
      this.saveSearchHistory()
      //console.log("Search history: ", this.history)
    }

    // console.log("queryArgs = ", queryArgs)

    let res = []
    for (const part of this.partsList) {
      this.filterTreeNode(res, part, queryArgs)
    }
    if (res.length == 0) {
      this.message = "No results found"
    }
    // console.log("> results: ", [...res])

    // format the result
    this.result.push(...res.filter(entry => entry.options.length > 0).map(entry => ({
      ...toRaw(entry),
      get val() { return entry.val },
      set val(val) { entry.val = val },
      options: formatOptions(entry, this.opts)
    })))
  }

  onKeyDown(event) {
    // console.log("Search onKeyDown: ", event)
    if (this.history.length > 0 && event.key === "ArrowDown") {
      this.historyBrowsing = true
      this.historyPosition++
      if (this.historyPosition >= this.history.length) this.historyPosition = 0
      this.text = this.history[this.historyPosition]
      this.filterTree()
      event.preventDefault()
    } else if (this.history.length > 0 && event.key === "ArrowUp") {
      this.historyBrowsing = true
      this.historyPosition--
      if (this.historyPosition < 0) this.historyPosition = this.history.length - 1
      this.text = this.history[this.historyPosition]
      this.filterTree()
      event.preventDefault()
    } else if (event.ctrlKey === true) {
      if (event.key === "k") {
        console.log("Search history cleaned")
        localStorage.removeItem("partSearchHistory")
        this.history = []
        this.historyPosition = 0
        this.historyBrowsing = false
        event.preventDefault()
      }
    } else {
      this.historyBrowsing = false
    }
  }

  onChange() {
    if (!this.active && this.text) this.startSearch()
    this.filterTree()
  }

  startSearch() {
    this.active = true
  }
  stopSearch() {
    this.active = false
    this.text = ""
    this.query = {}
    this.result = []
  }
}
