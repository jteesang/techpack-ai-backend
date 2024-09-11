import express from 'express'
import { Request, Response } from 'express'
import dotenv from 'dotenv';
import multer from 'multer';
import { generateDescription } from './services/aiService';
import { getImagePath, saveUploadDescription, getUploadDescription, saveTechpack, getTechpack, uploadImageToBucket, checkTechpackExists } from './services/dbService';
import { UploadInfo, TechpackForm } from './types';

dotenv.config();

const app = express()
const cors = require('cors');

app.use(cors());
app.use(express.json())

// initialize environment vars
const port = process.env.SERVER_PORT


// for testing locally
app.get('/', (req: Request, res: Response) => {
    res.send('Techpack AI Backend')
  })

// upload multipart file
// Set up multer for file handling
const storage = multer.memoryStorage();
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } }); // 10MB file size limit

// Define the route to handle file uploads and form data
app.post('/upload', upload.single('file'), async (req: Request, res: Response) => {
  try {
  // sign in anonymously
  // const { data, error } = await supabase.auth.signInAnonymously()
  // console.log(`signed in anonymously: ${data.session}`)

    if (!req.file) {
      return res.status(400).send('Missing file');
    }

    // File handling
    const file = req.file;
    const timestamp = Date.now();
    const uploadName = `${file.originalname}-${timestamp}`;

    // Upload Image to Bucket
    uploadImageToBucket(uploadName, file);

    // Get Public Signed URL
    const message = req.body.message || '';

    const imageUrl = getImagePath(uploadName);
    const publicUrl = await imageUrl;
    console.log(`imageUrl: ${publicUrl}`)

    // Call AI service to generate description
    const description = await generateDescription(publicUrl);
    console.log(`output: ${JSON.stringify(description)}`);


    // Convert description to UploadInfo type
    let uploadinfo_object: UploadInfo = description as UploadInfo;
    uploadinfo_object.message = message
    uploadinfo_object.image_path = publicUrl

    if (description && typeof description === 'object') {
      let response = await saveUploadDescription(uploadinfo_object);
      console.log(`object: ${JSON.stringify(response)}`)
      console.log(`uploadinfo_object: ${JSON.stringify(uploadinfo_object)}`)
      res.status(201).json(response);
    } else {
      res.status(400).send('Invalid description generated');
    }    
    // res.status(201).send(description);

    // return description;
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

app.get('/upload/:id', async (req: Request, res: Response) => {
  let uploadDesc = await getUploadDescription(req.params.id);
  console.log(`TECHPACK ID: ${req.params.id}`)
  res.status(201).json(uploadDesc)
})

app.get('/inputform/:id', async (req: Request, res: Response) => {
  // Check if row exists in techpacks
  let techpackCount = await checkTechpackExists(req.params.id)
  if (techpackCount.length === 1) {
    let techpack = await getTechpack(req.params.id);
    res.status(201).json(techpack)
  }
  else if (techpackCount.length === 1) {
    res.status(404).json({error: 'Resource not found'});
  } else {
    res.status(500).send('Internal Server Error')
  }
})

const form = multer();

app.post('/inputform/:id', form.none(), async (req: Request, res: Response) => {
  let techpack: TechpackForm = req.body;
  let response = await saveTechpack(techpack);
  res.status(201).json(response)
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
