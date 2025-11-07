import { MongoClient, ServerApiVersion, type Document, type Collection } from "mongodb";

declare global {
  // eslint-disable-next-line no-var
  var _mongoClient: MongoClient | undefined;
}

const uri = process.env.MONGODB_URI || "";

export async function getMongoClient() {
  if (global._mongoClient && (global._mongoClient as any).topology?.isConnected?.()) {
    return global._mongoClient;
  }
  if (global._mongoClient) return global._mongoClient; // During dev/hot-reload

  const client = new MongoClient(uri, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    },
  });
  global._mongoClient = client;
  return client;
}

export async function getDb() {
  const client = await getMongoClient();
  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI is not configured");
  }
  const dbName = process.env.MONGODB_DB || "xo-game";
  await client.connect();
  return client.db(dbName);
}

export async function getCollection<T extends Document = Document>(name: string): Promise<Collection<T>> {
  const db = await getDb();
  return db.collection<T>(name);
}
