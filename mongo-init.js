const appDb = db.getSiblingDB("agromarket");

const collections = ["images", "messages", "notifications", "tickets"];
for (const name of collections) {
  if (!appDb.getCollectionNames().includes(name)) {
    appDb.createCollection(name);
  }
}
