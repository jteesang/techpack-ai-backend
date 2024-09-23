import express from 'express'
import { Request, Response } from 'express'
import dotenv from 'dotenv';
import multer from 'multer';
import { generateDescription, generateTechPack, getTechpackPages } from './services/aiService';
import { getImagePath, saveUploadDescription, getUploadDescription, saveTechpackForm, getTechpackForm, uploadImageToBucket, checkTechpackFormExists, getImageUrl, saveTechpackPages, getUserTechpacks, getUserDetails, saveUserDetails, getTechpacksForUser } from './services/dbService';
import { UploadInfo, TechpackForm, UserDetails, TechpackVersion } from './types';

dotenv.config();

const app = express()
const cors = require('cors');

app.use(cors());
app.use(express.json())

// initialize environment vars
export const port = process.env.SERVER_PORT


// for testing locally
app.get('/', (req: Request, res: Response) => {
    res.send('Techpack AI Backend')
  })

// upload multipart file
// Set up multer for file handling
export const storage = multer.memoryStorage();
export const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } }); // 10MB file size limit

// Define the route to handle file uploads and form data
app.post('/upload', upload.single('file'), async (req: Request, res: Response) => {
  try {
  // sign in anonymously
  // export const { data, error } = await supabase.auth.signInAnonymously()
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
    console.log(`output: ${JSON.stringify(description.content)}`);
    // Convert description to UploadInfo type
    let uploadinfo_object: UploadInfo;
    if (description.content) {
      uploadinfo_object = JSON.parse(description.content) as UploadInfo;
      uploadinfo_object.image_path = publicUrl;
      let response = await saveUploadDescription(uploadinfo_object);
      console.log(`RESPONSE: ${JSON.stringify(response)}`)
      if (response) {
        res.status(201).send(response);
      } else {
        res.status(400).send('Failed to process upload information.');
      }
    } 
  }
  catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
}
});

// TODO - delete?
app.get('/upload/:id', async (req: Request, res: Response) => {
  let uploadDesc = await getUploadDescription(req.params.id);
  console.log(`TECHPACK ID: ${req.params.id}`)
  res.status(201).json(uploadDesc)
})

// This endpoint checks whether a techpack has been created, then returns the techpack input form
app.get('/inputform/:id', async (req: Request, res: Response) => {
  // Check if row exists in techpacks
  let techpackCount = await checkTechpackFormExists(req.params.id)
  if (techpackCount.length === 1) {
    let techpackForm = await getTechpackForm(req.params.id);
    res.status(201).json(techpackForm)
  }
  else if (techpackCount.length === 1) {
    res.status(404).json({error: 'Resource not found'});
  } else {
    res.status(500).send('Internal Server Error')
  }
})

export const form = multer();

// This endpoint saves the input form given a techpack id
app.post('/inputform/:id', form.none(), async (req: Request, res: Response) => {
  let techpackForm: TechpackForm = req.body;
  let response = await saveTechpackForm(techpackForm);
  res.status(201).json(response);
})

// This endpoint saves the techpack pages given a techpack id
app.get('/generate/:id', async (req: Request, res: Response) => {
  let techpackForm: TechpackForm = await getTechpackForm(req.params.id);

  let imageUrl = await getImageUrl(req.params.id);

  // check path - determine if image or description exists

  // Assume the image path for now
  let techpackPages = await getTechpackPages(imageUrl.image_path, techpackForm);

  // save to db
  if (techpackPages && typeof techpackPages === 'object') { // Type guard added
    let response = await saveTechpackPages(techpackPages);
    res.status(201).json(techpackPages);
  } else {
    res.status(400).send('Techpack pages not generated');
  }
  res.status(201).json(techpackPages)
})

// This endpoint returns all the related techpacks given a user id
app.get('/techpacks/:id', async (req: Request, res: Response) => {
  let techpackIds = await getTechpacksForUser(req.params.id)
  res.status(201).json(techpackIds);
});

// This endpoint returns the user details for a given user id
app.get('/users/:id', async (req: Request, res: Response) => {
  let profileDetails = await getUserDetails(req.params.id)
  res.status(201).json(profileDetails);
});

// This endpoint updates the user details for a given user id
app.post('/users/:id', form.none(), async (req: Request, res: Response) => {
  let profileDetails: UserDetails = req.body;
  let response = await saveUserDetails(profileDetails);
  
  res.status(201).json(response);
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

export default app;
