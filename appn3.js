const express = require('express');
const app = express();
const CryptoJS = require('crypto-js');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl }  = require("@aws-sdk/s3-request-presigner");
const multer = require('multer');
const multerS3 = require('multer-s3');
const sharp = require('sharp');

// Set up AWS credentials
const credentials = {
  accessKeyId: '9bvznd1zdigsT5jF',
  secretAccessKey: 'ODT8QVn4xNtvhjruEXqfwyLFnzrSozIfL5ieubsk'
};

// Create an S3 client instance
const s3 = new S3Client({
  region: "sgp",
  endpoint: "https://s3.tebi.io",
  credentials

});

const upload = multer({
  storage: multerS3({
    s3,
    bucket: "cloud-eu1-storage-p0-clds3.playtunes.ml",
    acl: 'public-read',
    contentType: multerS3.AUTO_CONTENT_TYPE,
    key: function (req, file, cb) {
      const ext = file.originalname.split('.').pop();
      cb(null, `${CryptoJS.SHA256(Date.now()+'-'+ file.originalname).toString()}-${file.originalname}.${ext}}`);
    },
    metadata: function (req, file, cb) {
      cb(null, { fieldName: file.fieldname });
    },
    shouldTransform: function (req, file, cb) {
      cb(null, /^image/i.test(file.mimetype));
    },
    transforms: [{
      id: 'original',
      key: function (req, file, cb) {
        const ext = file.originalname.split('.').pop();
        cb(null, `${CryptoJS.SHA256(Date.now()+'-'+ file.originalname).toString()}-${file.originalname}.${ext}`);
      },
      transform: function (req, file, cb) {
        cb(null, sharp().resize(800, 800));
      }
    }]
  }),
  limits: {
    fieldSize: 1000 * 1024 * 1024, // 1GB limit
    fileSize: 5000 * 1024 * 1024 // 5GB limit
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
      const form = document.querySelector("form"),
fileInput = document.querySelector(".file-input"),
progressArea = document.querySelector(".progress-area"),
uploadedArea = document.querySelector(".uploaded-area");

form.addEventListener("click", () =>{
  fileInput.click();
});

fileInput.onchange = ({target})=>{
  let file = target.files[0];
  if(file){
    let fileName = file.name;
    if(fileName.length >= 12){
      let splitName = fileName.split('.');
      fileName = splitName[0].substring(0, 13) + "... ." + splitName[1];
    }
    uploadFile(fileName);
  }
}

function uploadFile(name){
  let xhr = new XMLHttpRequest();
  xhr.upload.addEventListener("progress", ({loaded, total}) =>{
    let fileLoaded = Math.floor((loaded / total) * 100);
    let fileTotal = Math.floor(total / 1000);
    let fileSize;
    (fileTotal < 1024) ? fileSize = fileTotal + " KB" : fileSize = (loaded / (1024*1024)).toFixed(2) + " MB";
    let progressHTML = '<li class="row"><i class="fas fa-file-alt"/><div class="content"><div class="details"><span class="name">${name} • Uploading</span><span class="percent">${fileLoaded}%</span></div><div class="progress-bar"><div class="progress" style="width: ${fileLoaded}%"/></div></div></li>';
    uploadedArea.classList.add("onprogress");
    progressArea.innerHTML = progressHTML;
    if(loaded == total){
      progressArea.innerHTML = "";
      let uploadedHTML = '<li class="row"><div class="content upload"><i class="fas fa-file-alt"></i><div class="details"><span class="name">${name} • Uploaded</span><span class="size">${fileSize}</span></div></div><i class="fas fa-check"></i></li>';
      uploadedArea.classList.remove("onprogress");
      uploadedArea.insertAdjacentHTML("afterbegin", uploadedHTML);
    }
  });
  xhr.open("POST", "/upload");
  let data = new FormData(form);
  xhr.send(data);
}
      </script>
    </body>
    </html>
  `);
});

app.post('/upload', upload.single('file'), async (req, res) => {
  const command = new PutObjectCommand({
    Bucket: "cloud-eu1-storage-p0-clds3.playtunes.ml",
    Key: req.file.filename,
    ContentType: req.file.mimetype,
    Body: req.file.buffer,
    ACL: 'public-read'
  });
  try {
    const signedUrl = await getSignedUrl(s3, command, { expiresIn: 3600 });
    res.send({ signedUrl });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error generating pre-signed URL');
  }
});

app.listen(3000, () => {
  console.log('Server listening on port 3000');
});