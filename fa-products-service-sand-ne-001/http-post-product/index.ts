import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import Joi from "joi";
import { v4 as uuidv4 } from "uuid";
import { createProduct } from "../dal/productService";
import { createStock } from "../dal/stockService";

const httpPostProduct: AzureFunction = async function (context: Context, request: HttpRequest): Promise<void> {
    context.log(`Http function processed request for url "${request.url}"`);
    try {
        const record = request.body;
        
        const schema = Joi.object({
            description: Joi.string().required(),
            title: Joi.string().required(),
            count: Joi.number().required(),
            price: Joi.number().required()
        });

        const { error, value } = await schema.validateAsync(record);

        if (error) {
            context.res = {
                status: 400,
                body: `Product data invalid ${error}`
            }
        }

        const { title, description, price, count } = record;
        const newProduct = {
            id: uuidv4(),
            title,
            description,
            price,
            count
        };

        const createdProduct = await createProduct(newProduct);

        if (!createdProduct) {
            context.res = {
                status: 500,
                body: `Failed to create product`
            }
        }

        const createdStock = await createStock({ product_id: createdProduct!.id, count: count })
        context.res = {
            status: 200,
            body: {
                ...createdProduct,
                count: createdStock?.count
            }
        }
    } catch (error) {
        context.res = {
            status: 500,
            body: error
        }
    }
};

export default httpPostProduct;