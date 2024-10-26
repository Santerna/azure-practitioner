import { Product, Stock, ProductWithStock } from "../common/types";
import { productsContainer, stocksContainer } from "./dbClient";

export const getProductsList = async(): Promise<ProductWithStock[]> => {
    try {
        const productsQuery = "SELECT * FROM c";
        const { resources: products } = await productsContainer.items.query<Product>(productsQuery).fetchAll();

        const productsWithStocks: ProductWithStock[] = await Promise.all(products.map(async product => {
            const stockQuery = `SELECT * FROM c WHERE c.product_id = '${product.id}'`;
            const { resources: stockItems } = await stocksContainer.items.query<Stock>(stockQuery).fetchAll();

            return {
                ...product,
                count: stockItems.length > 0 ? stockItems[0].count : 0
            };
        }));

        return productsWithStocks;
    } catch (error) {
        console.error("Error querying products and stocks:", error);
        throw new Error(`Error querying products and stocks: ${JSON.stringify(error)}`);
    }
}

export const getProductsAvailableTotal = async (): Promise<ProductWithStock[] | []> => {
    const products: ProductWithStock[] = await getProductsList();
    let productsAvailable: ProductWithStock[] = [];
    for (let product of products) {
        if (product.count > 0) {
            productsAvailable.push(product)
        }
    }
    return productsAvailable;
}

export const getProductById = async(id: string): Promise<Product | undefined> => {
    const { resource: product } = await productsContainer.item(id, id).read<Product>();
    return product;
}

export const createProduct = async (productData: Product): Promise<Product | undefined> => {
    const { resource: createdProduct } = await productsContainer.items.create(productData);
    return createdProduct;
}
