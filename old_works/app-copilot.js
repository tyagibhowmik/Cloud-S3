const express = require('express');
const app = express();
const CryptoJS = require('crypto-js');
const { S3Client } = require('@aws-sdk/client-s3');
const { getSignedUrl }  = require("@aws-sdk/s3-request-presigner");
const credentials = {
  accessKeyId: '9bvznd1zdigsT5jF',
  secretAccessKey: 'ODT8QVn4xNtvhjruEXqfwyLFnzrSozIfL5ieubsk'
};
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const s3 = new S3Client({
  endpoint: "https://s3.tebi.io",
  region: "global",
  credentials
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
app.post('/upload', upload.single('file'), (req, res) => {
  console.log(req.file);
  const params = {
    Bucket: 'cloud-eu1-storage-p0-clds3.playtunes.ml',
    Key: req.file.filename,
    ContentType: req.file.mimetype,
  };
  try {
    const signedUrl = async()=>{ getSignedUrl(s3, params, { expiresIn: 3600 });
    res.send({ signedUrl })
  };
  } catch (error) {
    console.error(error);
    res.status(500).send('Error generating pre-signed URL');
  }
});

app.listen(3000, () => {
  console.log('Server listening on port 3000');
});