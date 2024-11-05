import { AzureFunction, HttpRequest, Context } from "@azure/functions";
import { Product, ProductWithStock, Stock } from "../common/types";
import { getProductById } from "../dal/productService";
import { getStockById } from "../dal/stockService";

const httpGetProductById: AzureFunction = async (context: Context, request: HttpRequest): Promise<void> =>{
    context.log(`Http function processed request for url "${request.url}"`);
    const productId = request.params.productId;

    try {
        const product: Product = await getProductById(productId);
        const stock: Stock = await getStockById(productId);

        if (!product) {
            context.res = {
                status: 404,
                body: `No product with id ${productId} found`
            }
        }
    
        context.res = {
            status: 200,
            body: { ...product, count: stock ? stock.count : 0 }
        }
    } catch (error) {
        context.res = {
            status: 500,
            body: error
        }
    }
};

export default httpGetProductById;
