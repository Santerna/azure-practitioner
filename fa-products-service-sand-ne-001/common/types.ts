export type Product ={
    id: string;
    title: string;
    description: string;
    price: string;
}

export type Stock = {
    product_id: string;
    count: number;
}