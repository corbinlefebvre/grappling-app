import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

export async function POST(req: Request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error('ERROR: GEMINI_API_KEY is not defined in .env.local');
      return NextResponse.json(
        { error: 'GEMINI_API_KEY is missing from environment variables' },
        { status: 500 }
      );
    }

    const body = await req.json();
    const { concept, ageGroup, beltRank, totalDurationMinutes } = body;

    const ai = new GoogleGenAI({ apiKey });

    const systemInstruction = `
You are a high-level Brazilian Jiu-Jitsu Black Belt coach and expert instructor specializing in the Constraints-Led Approach and dynamic motor learning.
You design training sessions using representative task designs, clear win conditions, and explicit invariant rules that afford emergence without static demonstration drilling.

Guidelines:
- Tone: Technical, realistic, and mat-ready.
- Age Appropriateness: If youth (ages 3-6 or 7-12), make games intuitive, safety-oriented, and active. If adults, focus on leverage, posture battles, and dilemma creation.
- Drills: Provide 1 to 2 sequential positional mini-games.
- Output Format: You must output ONLY a valid JSON object matching the requested schema. No markdown formatting, no code backticks, no explanations.
`;

    const prompt = `
Create a complete lesson plan for:
- Core Concept: "${concept || 'Half Guard Bottom'}"
- Age Group: "${ageGroup || 'Adults'}"
- Target Belt Rank: "${beltRank || 'White Belt'}"
- Total Class Time: ${totalDurationMinutes || 60} minutes

Return ONLY a JSON object with this exact shape:
{
  "className": "string (descriptive, professional)",
  "tags": ["string", "string", "string"],
  "drills": [
    {
      "drillName": "string",
      "drillConstraints": "string (what is forbidden or mandatory for top/bottom)",
      "primaryGoal": "string (clear win condition for top and bottom)",
      "immediateReset": "string (specific events that trigger an instant restart)",
      "roundCount": 4,
      "roundTimeSeconds": 120,
      "restTimeSeconds": 30
    }
  ],
  "liveRounds": {
    "roundCount": 4,
    "roundTimeSeconds": 300,
    "restTimeSeconds": 60
  }
}
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
      },
    });

    const responseText = response.text?.trim() || '{}';
    const parsedData = JSON.parse(responseText);

    return NextResponse.json(parsedData);
  } catch (error: any) {
    console.error('SERVER ROUTE ERROR:', error);
    return NextResponse.json(
      { error: error?.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}