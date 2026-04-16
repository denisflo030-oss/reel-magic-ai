import OpenAI from 'openai';
import fs from 'fs/promises';
import path from 'path';
import { createReadStream } from 'fs';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface Subtitle {
  startTime: number;
  endTime: number;
  text: string;
}

/**
 * Transcribe audio using OpenAI Whisper API
 */
export async function transcribeAudio(audioFilePath: string): Promise<string> {
  try {
    console.log(`🎤 Transcribing audio: ${audioFilePath}`);

    const fileStream = createReadStream(audioFilePath);
    const file = new File([await fs.readFile(audioFilePath)], path.basename(audioFilePath), {
      type: 'audio/mpeg',
    });

    const transcript = await openai.audio.transcriptions.create({
      file,
      model: 'whisper-1',
      language: 'en',
    });

    console.log(`✅ Transcription complete: ${transcript.text.substring(0, 50)}...`);
    return transcript.text;
  } catch (error) {
    console.error('Transcription error:', error);
    throw error;
  }
}

/**
 * Generate SRT subtitle file from transcript
 */
export async function generateSRT(
  transcript: string,
  duration: number,
  outputPath: string
): Promise<string> {
  try {
    console.log(`📝 Generating SRT subtitles: ${outputPath}`);

    // Simple approach: break transcript into 15-second chunks
    const words = transcript.split(' ');
    const wordsPerChunk = Math.max(1, Math.floor((words.length * 15) / duration));

    let srtContent = '';
    let index = 1;
    let startTime = 0;

    for (let i = 0; i < words.length; i += wordsPerChunk) {
      const chunk = words.slice(i, i + wordsPerChunk).join(' ');
      const endTime = Math.min(startTime + 15, duration);

      srtContent += `${index}\n`;
      srtContent += `${formatSRTTime(startTime)} --> ${formatSRTTime(endTime)}\n`;
      srtContent += `${chunk}\n\n`;

      startTime = endTime;
      index++;

      if (startTime >= duration) break;
    }

    await fs.writeFile(outputPath, srtContent);
    console.log(`✅ SRT generated: ${outputPath}`);
    return outputPath;
  } catch (error) {
    console.error('SRT generation error:', error);
    throw error;
  }
}

/**
 * Generate VTT subtitle file from transcript
 */
export async function generateVTT(
  transcript: string,
  duration: number,
  outputPath: string
): Promise<string> {
  try {
    console.log(`📝 Generating VTT subtitles: ${outputPath}`);

    const words = transcript.split(' ');
    const wordsPerChunk = Math.max(1, Math.floor((words.length * 15) / duration));

    let vttContent = 'WEBVTT\n\n';
    let startTime = 0;

    for (let i = 0; i < words.length; i += wordsPerChunk) {
      const chunk = words.slice(i, i + wordsPerChunk).join(' ');
      const endTime = Math.min(startTime + 15, duration);

      vttContent += `${formatVTTTime(startTime)} --> ${formatVTTTime(endTime)}\n`;
      vttContent += `${chunk}\n\n`;

      startTime = endTime;

      if (startTime >= duration) break;
    }

    await fs.writeFile(outputPath, vttContent);
    console.log(`✅ VTT generated: ${outputPath}`);
    return outputPath;
  } catch (error) {
    console.error('VTT generation error:', error);
    throw error;
  }
}

/**
 * Parse timestamps and create subtitle objects
 */
export function parseSubtitles(srtContent: string): Subtitle[] {
  const subtitles: Subtitle[] = [];
  const regex =
    /(\d+)\n(\d{2}):(\d{2}):(\d{2}),(\d{3}) --> (\d{2}):(\d{2}):(\d{2}),(\d{3})\n([\s\S]*?)(?=\n\n|$)/g;

  let match;
  while ((match = regex.exec(srtContent)) !== null) {
    const startTime =
      parseInt(match[2]) * 3600 +
      parseInt(match[3]) * 60 +
      parseInt(match[4]) +
      parseInt(match[5]) / 1000;
    const endTime =
      parseInt(match[6]) * 3600 +
      parseInt(match[7]) * 60 +
      parseInt(match[8]) +
      parseInt(match[9]) / 1000;

    subtitles.push({
      startTime,
      endTime,
      text: match[10].trim(),
    });
  }

  return subtitles;
}

/**
 * Format seconds to SRT timestamp
 */
export function formatSRTTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  const millis = Math.floor((seconds % 1) * 1000);

  return `${hours.toString().padStart(2, '0')}:${minutes
    .toString()
    .padStart(2, '0')}:${secs.toString().padStart(2, '0')},${millis
    .toString()
    .padStart(3, '0')}`;
}

/**
 * Format seconds to VTT timestamp
 */
export function formatVTTTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  const millis = Math.floor((seconds % 1) * 1000);

  return `${hours.toString().padStart(2, '0')}:${minutes
    .toString()
    .padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${millis
    .toString()
    .padStart(3, '0')}`;
}
