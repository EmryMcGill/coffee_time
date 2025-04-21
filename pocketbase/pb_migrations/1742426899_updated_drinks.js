/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_3720670791")

  // remove field
  collection.fields.removeById("text2261412156")

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_3720670791")

  // add field
  collection.fields.addAt(10, new Field({
    "autogeneratePattern": "",
    "hidden": false,
    "id": "text2261412156",
    "max": 0,
    "min": 0,
    "name": "createdAt",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": false,
    "system": false,
    "type": "text"
  }))

  return app.save(collection)
})
