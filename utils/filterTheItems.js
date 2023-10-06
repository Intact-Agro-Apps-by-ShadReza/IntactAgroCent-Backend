const filterTheItems = async (startingItemIndex = 0, normalGivingCount = 6, totalItemsCount = 0, items = [], fieldForSearching = "", searchables = "") => {


  let filteredItems = []
  const projectsCount = items.length
  if (normalGivingCount >= projectsCount) {
      normalGivingCount = projectsCount
      startingItemIndex = 0
  } else {
      if (normalGivingCount < 1) {
          normalGivingCount = 1
      }
      if ((startingItemIndex >= projectsCount)) {
          startingItemIndex = projectsCount - 1
      } else if (startingItemIndex < 0) {
          startingItemIndex = 0
      }
  }

  if (fieldForSearching && items.length && (fieldForSearching in items[0]) && searchables && searchables.length) {
    filteredItems = items.map((item) => {
      const fieldInItem = item[fieldForSearching].toString().toLowerCase()
      if (fieldInItem.includes(searchables.toLowerCase())) {
        return item
      }
    })
  } else {
    filteredItems = items
  }
  const resultedItems = []
  totalItemsCount = filteredItems.length
  let lastIndex = startingItemIndex + normalGivingCount
  if (lastIndex > totalItemsCount) {
      lastIndex = totalItemsCount
  }

  
  for (let i = startingItemIndex; i < lastIndex; i++) {
      if (filteredItems[i]) {
          resultedItems.push(filteredItems[i])
      }
  }
  return [resultedItems, totalItemsCount]
}

module.exports = {filterTheItems}