const express = require('express');
const app = express();
const CryptoJS = require('crypto-js');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl }  = require("@aws-sdk/s3-request-presigner");
// Set up AWS credentials
const multer = require('multer');
const multerS3 = require('multer-s3');
const credentials = {
  accessKeyId: '9bvznd1zdigsT5jF',
  secretAccessKey: 'ODT8QVn4xNtvhjruEXqfwyLFnzrSozIfL5ieubsk'
};

// Create an S3 client instance
const s3 = new S3Client({
  endpoint: "https://s3.tebi.io",
  region: "global",
  credentials
});
const upload = multer({
  storage: multerS3({
    s3,
    bucket: "cloud-eu1-storage-p0-clds3.playtunes.ml",
    acl: 'public-read',
    contentType: multerS3.AUTO_CONTENT_TYPE,
    key: function (req, file, cb) {
      cb(null, `${CryptoJS.SHA256(Date.now()+'-'+ file.originalname).toString()}`);
    },
    metadata: function (req, file, cb) {
      cb(null, { fieldName: file.fieldname });
    }
  }),
  limits: {
    fileSize: 1000 * 1024 * 1024 // 3GB limit
  }
});

app.get('/', (req, res) => {
    res.send(`
    <html>
    <head>
      <title>File Uploader</title>
    </head>
    <body>
      <form action="/upload" method="post" enctype="multipart/form-data">
        <input type="file" name="file" />
        <input type="text" name="filename" placeholder="Enter filename" />
        <button type="submit">Upload</button>
      </form>
    </body>
  </html>
    `);
  });
  
// Handle file uploads
// Handle file uploads

async function upload_file(file) {
    const s3Client = new S3Client({
        endpoint: "https://s3.tebi.io",
        region: "global",
        credentials
      });
    const { originalname, buffer, mimetype } = file; // Extract necessary information from the file object
    const upload_data = await s3Client.send(
      new PutObjectCommand({
        Bucket: "cloud-eu1-storage-p0-clds3.playtunes.ml",
        Key: originalname, // Use the original file name as the key
        Body: buffer, // Use the file buffer as the body
        ContentType: mimetype, // Set the content type to the file mimetype,
        ACL: 'public-read'
      })
    );
    return upload_data;
  }
  app.post('/upload', upload.single('file'), async (req, res) => {
    try {
      const file = req.file;
      const uploadUrl = `https://s3.tebi.io/cloud-eu1-storage-p0-clds3.playtunes.ml/${file.key}`;
      res.send({ uploadUrl });
    } catch (error) {
      console.error(error);
      res.status(500).send('Error uploading file');
    }
  });
  
app.listen(3000, () => {
  console.log('Server listening on port 3000');
});