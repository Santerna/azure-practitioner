import { AzureFunction, HttpRequest, Context } from "@azure/functions";
import { Product } from "../common/types";

const httpGetProductList: AzureFunction = async (context: Context, request: HttpRequest): Promise<void> =>{
    context.log(`Http function processed request for url "${request.url}"`);

    const products: Product[] = [
        {
            id: "1",
            title: "product1",
            description: "product1",
            price: "1"
        },
        {
            id: "2",
            title: "product2",
            description: "product2",
            price: "2"
        },
    ]

    context.res = {
        status: 200,
        body: products
    }
};

export default httpGetProductList;
