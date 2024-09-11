import { createClient } from '@supabase/supabase-js';
import { TechpackForm, UploadInfo } from '../types';

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY!;
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  
export const saveUploadDescription = async (data: UploadInfo) => {
  const { data: insertedData, error } = await supabase
    .from('uploads')
    .insert([data])
    .select('id, image_path, description')
    .single()
  
  if (error) {
    console.error('Error inserting data:', error);
    throw new Error('Failed to insert data into Uploads table');
  }
  return insertedData;
}

export const getUploadDescription = async (id: string) => {
  const { data: uploadDesc, error } = await supabase
  .from('uploads')
  .select('*')
  .eq('id', id)
  .single()

  if (error) {
    console.error('Error getting techpack:', error);
    throw new Error('Failed to get techpack from Techpacks table');
  }
  return uploadDesc;
}

export const saveTechpack = async (data: TechpackForm) => {
  const { data: insertedData, error } = await supabase
    .from('techpacks')
    .insert([data])
  
  if (error) {
    console.error('Error inserting data:', error);
    throw new Error('Failed to insert data into Techpacks table');
  }
  return insertedData;
}

export const getTechpack = async (id: string) => {
  const { data: techpack, error } = await supabase
    .from('techpacks')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error getting techpack:', error);
    throw new Error('Failed to get techpack from Techpacks table');
  }
  return techpack;
}

export const checkTechpackExists = async(id : string ) => {
  const { data, error } = await supabase
  .from('techpacks')
  .select('*')
  .eq('id', id)

  if (error) {
    console.error('No entry for given techpack id', error);
    throw new Error('Failed to query techpack from Techpacks table')
  }
  console.log(`data: ${data}`)
  return data;
}

export const uploadImageToBucket = async (uploadName: string, file: Express.Multer.File) => {
    const { data: upload, error: uploadError } = await supabase.storage
      .from('images')
      .upload(`public/${uploadName}`, file.buffer, {
        contentType: file.mimetype,
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      console.error(uploadError);
      throw new Error('Failed to upload the file');
    }
    return upload;
}

export const getImagePath = async (uploadName: string) => {
    // Generate a public URL
    const { data: publicURL } = supabase.storage
    .from('images')
    .getPublicUrl(`public/${uploadName}`);

    if (!publicURL) {
      console.error('Failed to get the public URL');
      throw new Error('Failed to get the public signed url');
    }
    return publicURL.publicUrl;
}
