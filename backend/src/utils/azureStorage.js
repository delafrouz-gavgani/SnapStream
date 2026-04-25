// =============================================================================
// AZURE BLOB STORAGE UTILITY
// Uncomment this entire file when Azure credentials are available.
//
// Required package (install when ready):
//   npm install @azure/storage-blob
//
// Required environment variables (add to .env):
//   AZURE_STORAGE_CONNECTION_STRING=DefaultEndpointsProtocol=https;AccountName=<name>;AccountKey=<key>;EndpointSuffix=core.windows.net
//   AZURE_STORAGE_CONTAINER_NAME=SnapStream-images
// =============================================================================

// const { BlobServiceClient } = require('@azure/storage-blob');
// const path = require('path');
// const crypto = require('crypto');

// const blobServiceClient = BlobServiceClient.fromConnectionString(
//   process.env.AZURE_STORAGE_CONNECTION_STRING
// );
// const containerClient = blobServiceClient.getContainerClient(
//   process.env.AZURE_STORAGE_CONTAINER_NAME
// );

// /**
//  * Uploads a file buffer to Azure Blob Storage.
//  * @param {Buffer} fileBuffer - The file data in memory (from multer memoryStorage)
//  * @param {string} originalName - Original filename (used to preserve extension)
//  * @param {string} mimeType - MIME type of the file (e.g. 'image/jpeg')
//  * @returns {{ blobName: string, url: string }}
//  */
// async function uploadToAzure(fileBuffer, originalName, mimeType) {
//   const ext = path.extname(originalName);
//   const blobName = crypto.randomBytes(16).toString('hex') + ext;
//   const blockBlobClient = containerClient.getBlockBlobClient(blobName);
//   await blockBlobClient.uploadData(fileBuffer, {
//     blobHTTPHeaders: { blobContentType: mimeType },
//   });
//   return {
//     blobName,
//     url: blockBlobClient.url, // public Azure CDN URL
//   };
// }

// /**
//  * Deletes a blob from Azure Blob Storage by blob name.
//  * @param {string} blobName - The blob name stored in image.storageKey
//  */
// async function deleteFromAzure(blobName) {
//   const blockBlobClient = containerClient.getBlockBlobClient(blobName);
//   await blockBlobClient.deleteIfExists();
// }

// module.exports = { uploadToAzure, deleteFromAzure };
