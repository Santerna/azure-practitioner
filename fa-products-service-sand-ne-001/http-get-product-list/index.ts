import { AzureFunction, HttpRequest, Context } from "@azure/functions";
import { ProductWithStock } from "../common/types";
import { getProductsList } from "../dal/productService";

const httpGetProductList: AzureFunction = async (context: Context, request: HttpRequest): Promise<void> =>{
    context.log(`Http function processed request for url "${request.url}"`);

    try {
        const products: ProductWithStock[] = await getProductsList();
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
}

export default httpGetProductList;
