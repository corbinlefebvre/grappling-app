import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

export async function POST(req: Request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'GEMINI_API_KEY is missing from environment variables' },
        { status: 500 }
      );
    }

    const { messages, activeConcepts } = await req.json();
    const ai = new GoogleGenAI({ apiKey });

    const systemInstruction = `
You are an elite Brazilian Jiu-Jitsu Black Belt instructor, head coach, and constraints-led pedagogy specialist.
You provide technical advice, solve positional dilemmas, and actively manage the academy curriculum.

Existing Core Concepts available in this academy:
${JSON.stringify(activeConcepts || [])}

You have two execution actions you can perform when the user asks you to build or create something:
1. "CREATE_CONCEPT": Use when the user asks to create or add a new core concept to the curriculum hub.
2. "POPULATE_LESSON": Use when the user asks you to build/create a lesson in the lesson builder for a specific concept or position discussed.

You must respond in valid JSON with this exact schema:
{
  "reply": "string (conversational explanation, mat advice, or confirmation)",
  "action": null | "CREATE_CONCEPT" | "POPULATE_LESSON",
  "conceptData": null | {
    "conceptName": "string"
  },
  "lessonData": null | {
    "className": "string",
    "concept": "string",
    "ageGroup": "Ages 3-6" | "Ages 7-12" | "Teens" | "Adults" | "Masters",
    "beltRank": "White Belt" | "White / Gray Belt" | "Yellow / Orange / Green" | "Blue Belt" | "Purple Belt +" | "All Ranks",
    "totalDurationMinutes": number,
    "tags": ["string", "string"],
    "drills": [
      {
        "drillName": "string",
        "drillConstraints": "string (explicit rules for top/bottom)",
        "primaryGoal": "string (win condition for both)",
        "immediateReset": "string (instant reset conditions)",
        "roundCount": number,
        "roundTimeSeconds": number,
        "restTimeSeconds": number
      }
    ],
    "liveRounds": {
      "roundCount": number,
      "roundTimeSeconds": number,
      "restTimeSeconds": number
    }
  }
}

Do not include markdown code ticks (\`\`\`json). Output raw parseable JSON only.
`;

    const contents = (messages || []).map((m: { role: string; content: string }) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text?.trim() || '{}');
    return NextResponse.json(parsed);
  } catch (error: any) {
    console.error('CHAT ROUTE ERROR:', error);
    return NextResponse.json(
      { error: error?.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}