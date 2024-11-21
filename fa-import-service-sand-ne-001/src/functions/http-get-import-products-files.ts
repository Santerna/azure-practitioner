import { app, HttpRequest, HttpResponseInit, InvocationContext, output  } from '@azure/functions';
import { BlobSASPermissions, generateBlobSASQueryParameters, StorageSharedKeyCredential, BlobServiceClient } from '@azure/storage-blob';

const blobOutput = output.storageBlob({
    connection: "AzureWebJobsStorage",
    path: "subfolder/{DateTime:MM-dd-yyyy H:mm:ss}.json",
  });

export async function httpGetImportProductsFiles(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    context.log(`Http function processed request for url "${request.url}"`);

    const containerName = 'uploaded';
    const storageAccountName =  process.env.STORAGE_ACCOUNT_NAME;
    const storageAccountKey = process.env.STORAGE_ACCOUNT_KEY;
    const blobName = request.query.get('name');
    if (!blobName) {
        context.log(`Filename not found`);

        return {
            status: 400,
            body: `Provide filname`
        }
    }

    const sharedKeyCredential = new StorageSharedKeyCredential(storageAccountName, storageAccountKey);
    const  blobServiceClient = new BlobServiceClient(
        `https://${storageAccountName}.blob.core.windows.net`,
        sharedKeyCredential
    );
    const containerClient = blobServiceClient.getContainerClient(containerName);
    const blobClient = containerClient.getBlobClient(blobName);

    const sasToken = generateBlobSASQueryParameters({
        containerName,
        blobName,
        permissions: BlobSASPermissions.parse('cw'),
        startsOn: new Date(),
        expiresOn: new Date(new Date().valueOf() + 3600 + 1000),
    }, sharedKeyCredential).toString();

    context.log(`sas token ${blobClient.url}?${sasToken}`);
    return { 
        status: 200,
        body: `${blobClient.url}?${sasToken}`
    };
};

app.http('httpGetImportProductsFiles', {
    methods: ['GET'],
    extraOutputs: [blobOutput],
    authLevel: 'anonymous',
    handler: httpGetImportProductsFiles,
    route: 'import'
});
