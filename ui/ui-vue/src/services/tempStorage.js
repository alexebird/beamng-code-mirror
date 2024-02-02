const
  tempStore = Object.create(null),
  freeIds = []

let counter = 0

const push = (item, id = freeIds.length ? freeIds.shift() : counter++) => ((tempStore[id] = item), id) 

function pop(id) {
  if (Object.keys(tempStore).includes(''+id)) {
    const toReturn = tempStore[id]
    delete tempStore[id]
    freeIds.push(id)
    return toReturn
  } else {
    console.log("Temporary storage does not contain an item with id: " + id)
  }
}

export default {
  push,
  pop
}
