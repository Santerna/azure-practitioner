import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";

export async function httpGetImportProductsFiles(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    context.log(`Http function processed request for url "${request.url}"`);

    const fileName = request.query.get('name');

    if (!fileName) {
        context.log(`Filename not found`);

        return {
            status: 400,
            body: `Provide filname`
        }
    }

    

    return { body: `Hello, ${name}!` };
};

app.http('httpGetImportProductsFiles', {
    methods: ['GET', 'POST'],
    authLevel: 'anonymous',
    handler: httpGetImportProductsFiles,
    route: 'import'
});
