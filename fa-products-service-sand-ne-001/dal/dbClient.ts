import { CosmosClient } from "@azure/cosmos";
import { DefaultAzureCredential } from "@azure/identity";
// import dotenv from "dotenv";

// dotenv.config();

const endpoint = process.env.COSMOS_DB_ENDPOINT || "https://cosmosdb-products-service-sand-ne.documents.azure.com:443/";

let client: CosmosClient;
const databaseId = "products-db";
try {
    const credentials = new DefaultAzureCredential();

   client = new CosmosClient({ endpoint, aadCredentials: credentials });

} catch (error) {
    console.log(`Error accessing Cosmos DB: ${error.message}`);
    throw error;
}

export const database = client.database(databaseId);
export const productsContainer = database.container("products");
export const stocksContainer= database.container("stocks");