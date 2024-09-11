import OpenAI from 'openai';
import dotenv from 'dotenv';
import { z } from "zod";
import { zodResponseFormat } from "openai/helpers/zod";

dotenv.config();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const ImageDescription = z.object({
  description: z.string(),
  silhouette: z.string(),
  neckline: z.string(),
  color: z.string(),
  fabric: z.string(),
  trim: z.string(),
  decoration: z.string(),
  fit: z.string(),
});

export const generateTechPack = async (description: string) => {
  const completion = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [
      {
        role: "system",
        content: "systemPrompt",
      },
      {
        role: "user",
        content: "Generate the tech pack based on the above information.",
      },
    ],
  })

  return completion.choices[0].message.content
}

export const generateImage = async (prompt: string) => {
  const response = await openai.images.generate({
    model: "dall-e-3",
    prompt: prompt,
    n: 1,
    size: "1024x1024",
  })

  return response.data[0].url
}

export const getDescription = async (imageUrl: string) => {
  // console.log(`before GPT call: ${Date.now()}`)
  const response = await openai.beta.chat.completions.parse({
    model: "gpt-4o-2024-08-06",
    messages: [
      {
        role: "system",
        content: [
          {
            type: "text",
            text: "Analyze the garment sketch and provide a description using the specified structure output. If no specified description, return 'None' as the value for the field.",
          },
        ],
      },
      {
        role: "user",
        content: [
          {
            type: "image_url",
            image_url: {
              url: imageUrl,
              detail: "high",
            },
          },
        ],
      },
    ],
    response_format: zodResponseFormat(ImageDescription, 'imageDescription'),
    max_tokens: 3500,
  });
  return response.choices[0]?.message;
}

export const generateDescription = async (imageUrl: string) => {
  try {
    const completion = await getDescription(imageUrl);

    if (completion?.parsed) {
      console.log(`completion: ${completion.parsed}`)
      return completion.parsed;
    } else {
      console.log(`completion: ${completion.refusal}`)
      return completion.refusal;
    }
  } catch (error) {
    console.error('Error in analyzeGarmentSketch:', error);
    throw error;
  }
}
