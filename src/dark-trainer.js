import 'dotenv/config';
import { MongoClient, ServerApiVersion } from "mongodb";
import wpTrainer from "./trainers/wp-trainer.js"

const uri = process.env.MONGODB_CONNECTION;

const wiki = process.env.WP_WIKI;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

const clearDatabase = async () => {
  try {
    await client.connect();
    const collection = client.db("dark").collection("trained");
    await collection.deleteMany({});
  } catch (err) {
    console.log(err);
  } finally {
    await client.close();
  }
};

const addItemsToDatabase = async (items) => {
  try {
    await client.connect();
    const collection = client.db("dark").collection("trained");
    await collection.insertMany(items);
    return true;
  } catch (err) {
    console.log(err);
    return false;
  } finally {
    await client.close();
  }
};

const trainFromWP = async (domain, language = "en") => {
  const items = await wpTrainer.getItemsFromWiki(domain);
  console.log(domain, items.length);

  const databaseItems = items.map((item) => {
    return {
      guilid: domain,
      language: language,
      question: item.title,
      answer: item.content,
    };
  });

  addItemsToDatabase(databaseItems);
};

(async () => {
  await clearDatabase();
  await trainFromWP(wiki, "en");
})();
