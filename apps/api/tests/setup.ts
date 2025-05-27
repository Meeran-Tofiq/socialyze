import { MongoMemoryServer } from "mongodb-memory-server";
import { MongoClient } from "mongodb";

let mongoServer: MongoMemoryServer;
let client: MongoClient;

export async function setupDB() {
	mongoServer = await MongoMemoryServer.create();
	const uri = mongoServer.getUri();

	client = new MongoClient(uri);
	await client.connect();

	return client.db();
}

export async function teardownDB() {
	if (client) await client.close();
	if (mongoServer) await mongoServer.stop();
}
