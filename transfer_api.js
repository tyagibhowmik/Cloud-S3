const https = require('http');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');

async function uploadImageFromUrl(url, bucketName, keyName) {
  const s3Client = new S3Client({
    endpoint: "https://w6s4.sg.idrivee2-50.com",
    region: "singapore",
    credentials: {
      accessKeyId: "V8td0QqC4ul9XQGPNTZh",
      secretAccessKey: "tIATgra7BmH0EqwQfLzUagTqYyAAzVS7Esekr0fM"
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

uploadImageFromUrl('http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', 'cloudstoragesgp1idrvep0clds3', 'bunny.mp4');