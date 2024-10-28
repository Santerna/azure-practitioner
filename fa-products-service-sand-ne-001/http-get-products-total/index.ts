import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { getProductsAvailableTotal } from "../dal/productService";
import { ProductWithStock } from "../common/types";

const httpGetProductsTotal: AzureFunction = async function (context: Context, request: HttpRequest): Promise<void> {
    context.log(`Http function processed request for url "${request.url}"`);
    try {
        const products: ProductWithStock[] = await getProductsAvailableTotal(context);
        context.log(`products ${JSON.stringify(products)}`);
        context.res = {
            status: 200,
            body: products
        }
    } catch (error) {
        context.log(`Error fetching products list`, error);
        context.res = {
            status: 500,
            body: error
        }
    }
};

export default httpGetProductsTotal;