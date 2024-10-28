import { CosmosClient, CosmosClientOptions } from '@azure/cosmos'
import { TokenCredential, DefaultAzureCredential } from '@azure/identity'

const endpoint = process.env.COSMOS_DB_ENDPOINT || "https://cosmosdb-products-service-sand-ne.documents.azure.com:443/";

let credential: TokenCredential = new DefaultAzureCredential();

let options: CosmosClientOptions = {
  endpoint: endpoint,
  aadCredentials: credential
};

const client: CosmosClient = new CosmosClient(options);
// import dotenv from "dotenv";

// dotenv.config();
const databaseId = "products-db";

export const database = client.database(databaseId);
export const productsContainer = database.container("products");
export const stocksContainer= database.container("stocks");