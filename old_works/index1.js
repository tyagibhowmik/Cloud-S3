const express = require('express');
const multer = require('multer');
const multerS3 = require('multer-s3');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const app = express();
const s3 = new S3Client({
  credentials: {
  accessKeyId: '9bvznd1zdigsT5jF',
  secretAccessKey: 'ODT8QVn4xNtvhjruEXqfwyLFnzrSozIfL5ieubsk',
  },
  endpoint: "https://s3.tebi.io",
  region: "global"
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
const upload = multer({
  storage: multerS3({
    s3,
    bucket: 'cloud-eu1-storage-p0',
    acl: 'private',
    contentType: multerS3.AUTO_CONTENT_TYPE,
    key: function (req, file, cb) {
      cb(null, `${Date.now()}-${file.originalname}`);
    },
    metadata: function (req, file, cb) {
      cb(null, { fieldName: file.fieldname });
    }
  })
});

app.post('/upload', upload.single('file'), async (req, res) => {
  try {
    const file = req.file;
    const command = new PutObjectCommand({
      Bucket: 'cloud-eu1-storage-p0-clds3.playtunes.ml',
      Key: file.key,
      ContentType: file.mimetype
    });
    const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 60 });
    res.send({ uploadUrl });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error uploading file');
  }
});

app.listen(3000, () => {
  console.log('Server listening on port 3000');
});