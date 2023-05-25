const https = require('http');
const { S3Client, GetObjectCommand, PutObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl }  = require("@aws-sdk/s3-request-presigner");
async function uploadImageFromUrl(url, bucketName, keyName) {
  const s3Client = new S3Client({
    endpoint: "https://s3.ap-southeast-1.wasabisys.com/",
    region: "ap-southeast-1",
    credentials: {
    
      accessKeyId: "XPYWJV6KVEOXBYSY1QBB",
      secretAccessKey: "QPHiI4vBoVRP4BkwQyvtOPJv6N5q2tcneBsY2r18"
    }
  });

  
  const request = https.get(url, (response) => {
    s3Client.send(new PutObjectCommand({
      Bucket: bucketName,
      Key: keyName,
      Body: response,
      ContentType: response.headers['content-type'],
      ContentLength: response.headers['content-length']
    })).then(() => {
      console.log(`Image uploaded successfully to ${bucketName}/${keyName}`);
    }).catch((err) => {
      console.error(err, err.stack);
    });
  });
}
async function getPresignedUrl() {
  const s3Client = new S3Client({
    endpoint: "https://s3.ap-southeast-1.wasabisys.com/",
    region: "ap-southeast-1",
    credentials: {
    
      accessKeyId: "XPYWJV6KVEOXBYSY1QBB",
      secretAccessKey: "QPHiI4vBoVRP4BkwQyvtOPJv6N5q2tcneBsY2r18"
    }
  });

  const command = new GetObjectCommand({
    Bucket: "clouds3-tier-one",
    Key: "x.mp4",
    ACL: 'public-read',
    ResponseContentDisposition: 'inline; filename="ForBiggerJoyrides.mp4"'
  });

  const url = await getSignedUrl(s3Client, command, { expiresIn: 3600*24 });

  console.log("Presigned URL:", url);
}

getPresignedUrl();
// uploadImageFromUrl('http://s3.tebi.io/cloud-eu1-storage-p0-clds3.playtunes.ml/6e073a7a5a7ecc781e95cea1e73721df0c10f5b050799dacd40373b09eb6dfd9-VID20230514071843.mp4', 'clouds3-tier-one', 'x.mp4');