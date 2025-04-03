import { MongoClient } from "mongodb";

export async function connectToDatabase() {
  const client = await MongoClient.connect(
    "mongodb+srv://jiyoung:BiQBMoXfPBntKoub@cluster0.okykg.mongodb.net/urang-market?retryWrites=true&w=majority&appName=Cluster0"
  );

  return client;
}
