
import { GoogleGenAI, Modality, GenerateContentResponse } from "@google/genai";
import { MODELS } from "../constants";

export const getAI = () => {
  if (!process.env.API_KEY) {
    throw new Error("API Key is missing");
  }
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

// --- Chat Helpers ---
export const startChat = (systemInstruction?: string) => {
  const ai = getAI();
  return ai.chats.create({
    model: MODELS.TEXT,
    config: { systemInstruction }
  });
};

// --- Image Generation ---
export const generateImage = async (prompt: string): Promise<string> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: MODELS.IMAGE,
    contents: { parts: [{ text: prompt }] },
    config: {
      imageConfig: { aspectRatio: "1:1" }
    }
  });

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  throw new Error("No image data found in response");
};

// --- Video Generation ---
export const generateVideo = async (prompt: string, onProgress?: (msg: string) => void) => {
  const ai = getAI();
  
  onProgress?.("Initiating video generation...");
  let operation = await ai.models.generateVideos({
    model: MODELS.VIDEO,
    prompt,
    config: {
      numberOfVideos: 1,
      resolution: '720p',
      aspectRatio: '16:9'
    }
  });

  onProgress?.("Processing video frames (this can take a few minutes)...");
  while (!operation.done) {
    await new Promise(resolve => setTimeout(resolve, 10000));
    operation = await ai.operations.getVideosOperation({ operation: operation });
  }

  const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
  if (!downloadLink) throw new Error("Video generation failed");

  onProgress?.("Downloading final video file...");
  const response = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
  const blob = await response.blob();
  return URL.createObjectURL(blob);
};

// --- Speech Generation ---
export const generateSpeech = async (text: string): Promise<string> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: MODELS.SPEECH,
    contents: [{ parts: [{ text: `Say clearly: ${text}` }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName: 'Kore' },
        },
      },
    },
  });

  const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  if (!base64Audio) {
    throw new Error("No audio data found in response");
  }
  
  // Return the base64 encoded raw PCM audio data
  return base64Audio;
};
