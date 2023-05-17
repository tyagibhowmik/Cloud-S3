const { getSignedUrl }  = require( "@aws-sdk/s3-request-presigner");
const { S3Client,PutObjectCommand }  = require( "@aws-sdk/client-s3");
const credentials = {
    accessKeyId: '9bvznd1zdigsT5jF',
    secretAccessKey: 'ODT8QVn4xNtvhjruEXqfwyLFnzrSozIfL5ieubsk'
  };
const s3Client = new S3Client({
    endpoint: "https://s3.tebi.io",
    region: "global",
    credentials
});
async function generatePresignedUrl(bucketName, key, contentType) {
    const credentials = {
        accessKeyId: '9bvznd1zdigsT5jF',
        secretAccessKey: 'ODT8QVn4xNtvhjruEXqfwyLFnzrSozIfL5ieubsk'
      };
    const s3Client = new S3Client({
        endpoint: "https://s3.tebi.io",
        region: "global",
        credentials
    });

    const command = new PutObjectCommand({
        Bucket: bucketName,
        Key: key,
        ContentType: contentType,
        ACL: "public-read"
      });
    
      const signedUrl = await getSignedUrl(s3Client,command, { expiresIn: 3600 });
      return signedUrl;
}
async function main() {
    const presignedUrl = await generatePresignedUrl("cloud-eu1-storage-p0-clds3.playtunes.ml","example.txt","text/plain");
    console.log(presignedUrl);
}
main().catch(console.error);