import settings from "../local.settings.json"
import { Product, Stock } from "../common/types";
import { faker } from '@faker-js/faker';
import { CosmosClient } from "@azure/cosmos";

const dbEndpoint = settings.Values.AZURE_DB_ENDPOINT;
const accDbKey = settings.Values.AZURE_DB_KEY;
const databaseId = "products-db";
const productsContainerName = "products";
const stocksContainerName = "stocks";

function createRandomProduct(): Product {
  return {
    id: faker.string.uuid(),
    title: faker.commerce.productName(),
    description: faker.commerce.productDescription(),
    price: faker.commerce.price()
  };
}

function createProducts() {
  const products = [];
  for (let i = 0; i<= 10; i++) {
    products.push(createRandomProduct());
  }
  return products;
}

const products: Product[] = createProducts();

function createRandomStock(product_id: string): Stock {
  return {
    product_id: product_id,
    count: faker.number.int({ min: 0, max: 50 })
  }
}

const stocks: Stock[] = products.map((product) => createRandomStock(product.id));

const generateDbData = async () => {
  try {
    const client = new CosmosClient({ endpoint: dbEndpoint, key: accDbKey });

    const db = client.database(databaseId);
    const productsContainer = db.container(productsContainerName);
    const stocksContainer = db.container(stocksContainerName);
    for (const product of products) {
      await productsContainer.items.upsert(product);
      console.log(`Product item added ${product.id}`);
    }

    for (const stock of stocks) {
      await stocksContainer.items.upsert(stock);
      console.log(`Stock item added ${stock.product_id}`);
    }

    console.log(`Tables populated`);
  } catch (error) {
    console.error(`Failed to populate table `, error)
  }
}

generateDbData();
