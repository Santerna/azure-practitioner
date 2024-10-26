import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { getProductsAvailableTotal } from "../dal/productService";

const httpGetProductsTotal: AzureFunction = async function (context: Context, request: HttpRequest): Promise<void> {
    context.log(`Http function processed request for url "${request.url}"`);
   try {
    const productsTotal = await getProductsAvailableTotal();

    context.res = {
        status: 200,
        body: productsTotal
    }
   } catch (error) {
    context.res = {
        status: 500,
        body: `Failed to fetch available products: ${error}`
    }
   }
};

export default httpGetProductsTotal;