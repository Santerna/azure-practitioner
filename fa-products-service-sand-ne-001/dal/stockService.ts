import { Stock } from "../common/types";
import { stocksContainer } from "./dbClient";

export const createStock = async (stock: Stock): Promise<Stock | undefined> => {
    const { resource: createdStock } = await stocksContainer.items.create(stock);
    return createdStock;
}

export const getStockById = async (id: string): Promise<Stock | undefined> => {
    const query = {
        query: 'SELECT * FROM c WHERE c.product_id = @id',
        parameters: [{ name: "@id", value: id }]
    };

    const { resources } = await stocksContainer.items.query<Stock>(query).fetchAll();
    return resources[0];
}
