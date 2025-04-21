/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_3720670791")

  // update collection data
  unmarshal({
    "listRule": "",
    "viewRule": ""
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_3720670791")

  // update collection data
  unmarshal({
    "listRule": "@request.auth.id = user",
    "viewRule": "@request.auth.id = user"
  }, collection)

  return app.save(collection)
})
