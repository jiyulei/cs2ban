import { MongoClient } from "mongodb";

const uri = process.env.MONGO_URI as string;

if (!uri) {
  throw new Error(
    "Please define the MONGO_URI environment variable in .env.local"
  );
}

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === "development") {
  // In development, use a global variable to preserve the client across hot reloads
  if (!(global as any)._mongoClientPromise) {
    client = new MongoClient(uri);
    (global as any)._mongoClientPromise = client.connect();
  }
  clientPromise = (global as any)._mongoClientPromise;
} else {
  // In production, always create a new client
  client = new MongoClient(uri);
  clientPromise = client.connect();
}

export default clientPromise;
