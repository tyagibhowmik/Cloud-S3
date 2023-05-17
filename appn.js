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
    fieldSize: 25 * 1024 * 1024, // 1MB limit
    fileSize: 3000 * 1024 * 1024 // 3GB limit
  }
});

app.get('/', (req, res) => {
    res.send(`
<!DOCTYPE html>
<html>
<head>
  <title>File Uploader</title>
  <style>
  </style>
</head>
<body>
  <form action="/upload" method="post" enctype="multipart/form-data" id="upload-form">
    <input type="file" name="file" id="file-input" />
    <input type="text" name="filename" placeholder="Enter filename" />
    <button type="submit" id="upload-button">Upload</button>
  </form>

  <progress value="0" max="100" id="progress-bar"></progress>

  <script>
    document.getElementById("upload-form").addEventListener("submit", function(event) {
      event.preventDefault();

      const progressBar = document.getElementById("progress-bar");
      progressBar.value = 0;

      const fileInput = document.getElementById("file-input");
      const file = fileInput.files[0];
      const formData = new FormData();

      formData.append("file", file);

      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener("progress", function(event) {
        if (event.lengthComputable) {
          const percentComplete = (event.loaded / event.total) * 100;
          progressBar.value = percentComplete;
        }
      });

      xhr.addEventListener("load", function() {
        // Upload completed
        progressBar.value = 100;
      });

      xhr.addEventListener("error", function() {
        // Error occurred during upload
        progressBar.value = 0;
        alert("Error uploading file.");
      });

      xhr.open("POST", "/upload");
      xhr.send(formData);
    });
  </script>
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
  app.post("/upload", upload.single("file"), async (req, res) => {
    try {
      if (!req.file) {
        throw new Error("No file uploaded");
      }
  
      const file = req.file;
      const file_extension = file.originalname.split(".").pop();
      const uploadUrl = `https://s3.tebi.io/cloud-eu1-storage-p0-clds3.playtunes.ml/${file.key}.${file_extension}`;
      res.send({ uploadUrl });
    } catch (error) {
      console.log('"Sorry Man Problem Occured"');
      console.error(error);
      res.status(500).send("Error uploading file");
    }
  });
  
app.listen(3000, () => {
  console.log('Server listening on port 3000');
});