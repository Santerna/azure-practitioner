import { app, InvocationContext, HttpResponseInit } from "@azure/functions";
import { BlobServiceClient } from "@azure/storage-blob";
import { Readable } from 'stream';
import { parse } from 'csv-parse';

export async function blobImportProductsFromFile(blob: Buffer, context: InvocationContext): Promise<HttpResponseInit> {
    context.log(`Storage blob function processed blob "${JSON.stringify(context.triggerMetadata)}" with size ${blob.length} bytes`);
    const AZURE_STORAGE_CONNECTION_STRING = process.env['AzureWebJobsStorage'];
    const blobServiceClient = BlobServiceClient.fromConnectionString(AZURE_STORAGE_CONNECTION_STRING);
    context.log(`blob ${blob}`);

    const inputContainerName = 'uploaded';
    const outputContainerName = 'parsed';

    const blobName = `${context.triggerMetadata.blobname}.${context.triggerMetadata.blobextension}`;
    context.log(`blob name ${blobName}`);

    const containerClient = blobServiceClient.getContainerClient(outputContainerName);
    await containerClient.createIfNotExists();
    context.log(`output container obtained`);

    const blobStream = Readable.from(blob);

    const parser = blobStream.pipe(parse({
        columns: true,
        trim: true
    }));

    const records = [];
    for await (const record of parser) {
        context.log(`CSV record: ${JSON.stringify(record)}`);
        records.push(record);
    }

    try {
        const inputBlobClient = blobServiceClient.getContainerClient(inputContainerName).getBlobClient(blobName);
        const outputBlobClient = containerClient.getBlobClient(blobName);

        const copyPoller = await outputBlobClient.beginCopyFromURL(inputBlobClient.url);
        await copyPoller.pollUntilDone();

        await inputBlobClient.delete();

        context.log(`Moved ${blobName} to ${outputContainerName}`);
    } catch (error) {
        context.log(`Error processing blob: ${JSON.stringify(error)}`);
    }

    parser.on('error', function(error) {
        context.error(`Error while parsing ${JSON.stringify(error)}`);
    });

    parser.write(blobName);
    parser.end();

    return {
        status: 204,
        body: 'Data processed successfully'
    }
}

app.storageBlob('blobImportProductsFromFile', {
    path: 'uploaded/{blobname}.{blobextension}',
    connection: 'AzureWebJobsStorage',
    handler: blobImportProductsFromFile
});
