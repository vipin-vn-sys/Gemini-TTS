
import { GoogleGenAI, Modality } from "@google/genai";
import { createWavBlob, decodeBase64 } from '../utils/audioUtils';

/**
 * Generates speech from text using the Gemini API.
 * @param text The text to convert to speech.
 * @param voiceName The name of the voice to use.
 * @returns A promise that resolves to an object URL for the generated audio.
 */
export const generateSpeech = async (text: string, voiceName: string): Promise<string> => {
    // A new GoogleGenAI instance is created for each call to ensure it uses the
    // most up-to-date API key from the environment.
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text }] }],
        config: {
            responseModalities: [Modality.AUDIO],
            speechConfig: {
                voiceConfig: {
                    prebuiltVoiceConfig: { voiceName },
                },
            },
        },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

    if (!base64Audio) {
        throw new Error("API did not return audio data. The response may have been blocked.");
    }

    const pcmData = decodeBase64(base64Audio);
    const wavBlob = createWavBlob(pcmData);
    const url = URL.createObjectURL(wavBlob);
    
    return url;
};
