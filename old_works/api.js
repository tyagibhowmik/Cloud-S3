const { S3Client, ListBucketsCommand,PutObjectCommand,GetObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl }  = require("@aws-sdk/s3-request-presigner");
// Configure the SDK with your access key ID and secret access key
const credentials = {
    accessKeyId: "V8td0QqC4ul9XQGPNTZh",
    secretAccessKey: "tIATgra7BmH0EqwQfLzUagTqYyAAzVS7Esekr0fM"
  }
async function listBuckets() {
    const s3Client= new S3Client({
        endpoint: "https://w6s4.sg.idrivee2-50.com",
        region: "singapore",
        credentials
      });

  const bucketsData = await s3Client.send(new ListBucketsCommand({}));

  const buckets = bucketsData.Buckets.map((bucket) => bucket.Name);

  console.log("Buckets:", buckets);
}

listBuckets();
const s3Client= new S3Client({
    endpoint: "https://w6s4.sg.idrivee2-50.com",
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
//upload_file()
async function getPresignedUrl() {
  const s3Client = new S3Client({
    endpoint: "https://w6s4.sg.idrivee2-50.com",
    region: "global",
    credentials
  });

  const command = new GetObjectCommand({
    Bucket: "cloudstoragesgp1idrvep0clds3",
    Key: "bunny.mp4",
    ResponseContentDisposition: 'inline; filename="ForBiggerJoyrides.mp4"'
  });

  const url = await getSignedUrl(s3Client, command, { expiresIn: 3600*24 });

  console.log("Presigned URL:", url);
}

getPresignedUrl();