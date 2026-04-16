import OpenAI from 'openai';
import { AnalysisResult, ClipSegment } from '../types/index.js';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Analyze a video transcript to find viral moments and generate clip segments
 */
export async function analyzeVideoTranscript(
  transcript: string,
  duration: number
): Promise<AnalysisResult> {
  try {
    console.log('🤖 Analyzing transcript with GPT-4o...');

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `You are a viral content expert who identifies the most engaging moments in videos that would make great short-form content for TikTok, Instagram Reels, and YouTube Shorts.

You will analyze a transcript and identify exactly 3 viral clip segments. For each segment, provide:
1. Start time (in seconds)
2. End time (in seconds) 
3. Title (catchy, engagement-focused, max 100 chars)
4. Description (what makes this viral)
5. Viral score (1-10)
6. 5 relevant hashtags

Return a valid JSON object with this structure:
{
  "clipSegments": [
    {
      "startTime": 0,
      "endTime": 30,
      "title": "...",
      "description": "...",
      "viralScore": 9,
      "hashtags": ["#tag1", "#tag2", "#tag3", "#tag4", "#tag5"]
    }
  ]
}`,
        },
        {
          role: 'user',
          content: `Video Duration: ${Math.round(duration)} seconds\n\nTranscript:\n${transcript}`,
        },
      ],
      temperature: 0.8,
      response_format: { type: 'json_object' },
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No response from GPT-4o');
    }

    const parsed = JSON.parse(content);
    const clipSegments: ClipSegment[] = parsed.clipSegments.map(
      (clip: any) => ({
        startTime: clip.startTime,
        endTime: clip.endTime,
        duration: clip.endTime - clip.startTime,
      })
    );

    console.log(`✅ Found ${clipSegments.length} viral moments`);

    return {
      transcript,
      clipSegments,
      clipMetadata: parsed.clipSegments.map((clip: any) => ({
        segment: {
          startTime: clip.startTime,
          endTime: clip.endTime,
          duration: clip.endTime - clip.startTime,
        },
        title: clip.title,
        description: clip.description,
        viralScore: clip.viralScore,
        hashtags: clip.hashtags,
      })),
    };
  } catch (error) {
    console.error('Transcript analysis error:', error);
    throw error;
  }
}

/**
 * Generate captions/hooks for a video segment
 */
export async function generateCaption(
  transcript: string,
  title: string,
  maxLength: number = 150
): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: `Create an engaging, viral-worthy caption for social media. Be concise and compelling. Max ${maxLength} characters.`,
        },
        {
          role: 'user',
          content: `Title: ${title}\nContent: ${transcript}`,
        },
      ],
      temperature: 0.7,
    });

    return response.choices[0]?.message?.content || '';
  } catch (error) {
    console.error('Caption generation error:', error);
    throw error;
  }
}

/**
 * Generate hashtags for social media
 */
export async function generateHashtags(content: string): Promise<string[]> {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content:
            'Generate 5-8 trending, relevant hashtags for viral social media content. Return only hashtags separated by spaces, starting with #.',
        },
        {
          role: 'user',
          content: content,
        },
      ],
      temperature: 0.5,
    });

    const tagsString = response.choices[0]?.message?.content || '';
    return tagsString.split(' ').filter((tag) => tag.startsWith('#'));
  } catch (error) {
    console.error('Hashtag generation error:', error);
    return [];
  }
}

/**
 * Score the virality potential of content (1-10)
 */
export async function scoreVirality(
  transcript: string,
  title: string
): Promise<number> {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content:
            'You are a viral content expert. Rate the viral potential of content on a scale of 1-10. Consider engagement factors like humor, surprise, relatability, and emotional impact. Return ONLY a number between 1 and 10.',
        },
        {
          role: 'user',
          content: `Title: ${title}\nContent: ${transcript}`,
        },
      ],
      temperature: 0.5,
    });

    const scoreStr = response.choices[0]?.message?.content?.trim() || '5';
    let score = parseInt(scoreStr, 10);
    if (isNaN(score)) score = 5;
    return Math.min(10, Math.max(1, score));
  } catch (error) {
    console.error('Virality scoring error:', error);
    return 5; // Default mid-score on error
  }
}
