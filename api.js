const { S3Client, ListBucketsCommand,PutObjectCommand,GetObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl }  = require("@aws-sdk/s3-request-presigner");
// Configure the SDK with your access key ID and secret access key
const credentials = {
    accessKeyId: "9bvznd1zdigsT5jF",
    secretAccessKey: "ODT8QVn4xNtvhjruEXqfwyLFnzrSozIfL5ieubsk"
  }
async function listBuckets() {
    const s3Client= new S3Client({
        endpoint: "https://s3.tebi.io",
        region: "global",
        credentials
      });

  const bucketsData = await s3Client.send(new ListBucketsCommand({}));

  const buckets = bucketsData.Buckets.map((bucket) => bucket.Name);

  console.log("Buckets:", buckets);
}

listBuckets();
const s3Client= new S3Client({
    endpoint: "https://s3.tebi.io",
    region: "global",
    credentials
  });

async function upload_file(){ 
    const upload_data = await s3Client.send(
        new PutObjectCommand({
                Bucket: "cloud-eu1-storage-p0-clds3.playtunes.ml",
                Key: "node-js.txt",
                Body: "some data"
        })
    );

}
upload_file()
async function get_file_signed_URL(){ 
    const s3Client= new S3Client({
      endpoint: "https://s3.tebi.io",
      region: "global",
      credentials
    });
    const get_command = new GetObjectCommand({
      Bucket: "cloud-eu1-storage-p0-clds3.playtunes.ml",
      Key: "node-js.txt",
      ResponseContentDisposition: 'attachment; filename="YOUR_FILENAME.txt"'
    });
    const url = await getSignedUrl(s3Client, get_command, { expiresIn: 3600 });
    console.log(url);
    };
get_file_signed_URL();
module.exports = {
  get_file_signed_URL
};