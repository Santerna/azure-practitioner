import { AzureFunction, HttpRequest, Context } from "@azure/functions";
import { Product } from "../common/types";

const httpGetProductById: AzureFunction = async (context: Context, request: HttpRequest): Promise<void> =>{
    context.log(`Http function processed request for url "${request.url}"`);
    const productId = request.query.id;

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
    ];

    const product = products.find(i => i.id === productId);

    if (!product) {
        context.res = {
            status: 404,
            body: `No product with id ${productId} found`
        }
    }

    context.res = {
        status: 200,
        body: product
    }
};

export default httpGetProductById;
