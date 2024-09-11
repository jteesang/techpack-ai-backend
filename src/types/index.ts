

export interface UploadInfo {
  description: string;
  silhouette: string;
  neckline: string;
  color: string;
  fabric: string;
  trim: string;
  decoration: string;
  fit: string;
  message: string;
  image_path: string;
}

export interface TechpackForm {
  id: string;
  description: string;
  brand_name: string;
  style_id: string;
  style_name: string;
  fabric: string;
  sizing_preference: string;
  color_style: string;
  colorways?: string;
  additional_details?: string;
}