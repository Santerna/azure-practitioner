import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import Joi, { ValidationError } from 'joi';
import { v4 as uuidv4 } from "uuid";
import { createProduct } from "../dal/productService";
import { createStock } from "../dal/stockService";

// Define the product schema using Joi for validation
const productSchema = Joi.object({
    description: Joi.string().required(),
    title: Joi.string().required(),
    count: Joi.number().integer().min(0).required(),
    price: Joi.number().precision(2).positive().required()
});

const httpPostProduct: AzureFunction = async function (context: Context, request: HttpRequest): Promise<void> {
    context.log(`Http function processed request for url "${request.url}"`);
    
    try {
        await productSchema.validateAsync(request.body);

        const { title, description, price, count } = request.body;

        const newProduct = {
            id: uuidv4(),
            title,
            description,
            price,
            count
        };

        const createdProduct = await createProduct(newProduct);
        
        const createdStock = await createStock({ product_id: createdProduct.id, count });

        context.res = {
            status: 201,
            body: {
                ...createdProduct,
                count: createdStock.count
            }
        };
    } catch (error) {
        context.log(`Error processing request: ${error.name}`);
       
        if (error && error.name === 'ValidationError') {
            context.res = {
                status: 400,
                body: `Product data is invalid: ${error}`
            };
        } else {
            context.res = {
                status: 500,
                body: "Internal Server Error"
            };
        }
    }
};

export default httpPostProduct;