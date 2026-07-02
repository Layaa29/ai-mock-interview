import { GoogleGenerativeAI } from "@google/generative-ai";

if (!process.env.GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY is not defined in environment variables");
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
// Using gemini-1.5-flash as the highly performant and stable model
export const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

function cleanJsonString(raw: string): string {
  let cleaned = raw.trim();
  // Match code blocks like ```json [JSON content] ``` or ``` [JSON content] ```
  const regex = /^```(?:json)?\s*([\s\S]*?)\s*```$/;
  const match = cleaned.match(regex);
  if (match) {
    cleaned = match[1];
  }
  return cleaned.trim();
}

export async function generateQuestions(
  jobRole: string,
  jobExperience: string,
  techStack: string,
  companyName?: string,
  resumeText?: string,
  difficulty?: string,
  interviewType?: string,
  numQuestions?: number
): Promise<string[]> {
  const count = numQuestions || 5;
  const prompt = `You are a professional ${interviewType || "Technical"} interviewer at ${companyName || "a top tech company"}.
Generate exactly ${count} ${difficulty || "Medium"} difficulty ${interviewType || "Technical"} interview questions for a candidate with the following details:
- Target Job Role: ${jobRole}
- Experience Level: ${jobExperience}
- Core Tech Stack: ${techStack}
${companyName ? `- Target Company Style: ${companyName}` : ""}
${resumeText ? `- Candidate Resume Text: ${resumeText}` : ""}

Ensure the questions are highly relevant, practical, challenging enough for the experience level, and cover coding patterns, architecture, or system design depending on the role.
${resumeText ? "CRITICAL: Pick up actual projects, experiences, and technologies listed in the candidate's resume (e.g. details of specific projects, tech stack) and ask questions directly about them instead of generic ones." : ""}

Return the result ONLY as a JSON array of strings containing exactly ${count} questions.
Do NOT wrap in markdown backticks (such as \`\`\`json) in your final response if possible, just return the raw JSON array.
Example format:
[
  "Explain how you would design a scalable notification system in AWS.",
  "What is the difference between UseState and UseRef in React, and when would you use each?",
  "..."
]`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const cleanJson = cleanJsonString(text);
    const parsed = JSON.parse(cleanJson);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    throw new Error("Invalid format returned by Gemini");
  } catch (error) {
    console.error("Error generating questions with Gemini:", error);
    // Fallback default questions in case of API failure
    return [
      `Can you explain your experience working with ${techStack || "web technologies"}?`,
      `How do you handle state management in a large-scale project?`,
      `What are some optimization techniques you use to improve performance?`,
      `Describe a challenging bug you faced recently and how you resolved it.`,
      `What is your approach to testing and ensuring code quality?`,
    ];
  }
}

export interface EvaluationResult {
  score: number; // 1-10
  feedback: string;
  strengths: string;
  weaknesses: string;
  suggestedAnswer: string;
  technicalScore: number;
  communicationScore: number;
  grammarScore: number;
  confidenceScore: number;
  problemSolvingScore: number;
  professionalismScore: number;
  improvementSuggestions: string;
  learningRecommendations: string;
}

export async function evaluateAnswer(
  question: string,
  userAnswer: string
): Promise<EvaluationResult> {
  const prompt = `You are an expert technical interviewer.
Evaluate the candidate's answer to the interview question:
Question: "${question}"
Candidate Answer: "${userAnswer || "[No answer provided]"}"

Analyze the answer for technical accuracy, completeness, and clarity.
Provide constructive feedback, highlight their strengths and weaknesses in this response, and provide a detailed suggested model answer.
Also, assign integer scores out of 10 for the following categories:
- score (overall score out of 10)
- technicalScore (understanding of concepts, tech details)
- communicationScore (articulation, structure, pacing)
- grammarScore (correctness, syntax)
- confidenceScore (assertiveness, phrasing strength)
- problemSolvingScore (analytical thinking, edge-case checks)
- professionalismScore (clarity, professional tone)

Provide detailed action items:
- improvementSuggestions (concrete steps to improve this response)
- learningRecommendations (topics or documentations to study)

Return the result ONLY as a JSON object with the following fields:
{
  "score": number,
  "feedback": "string",
  "strengths": "string",
  "weaknesses": "string",
  "suggestedAnswer": "string",
  "technicalScore": number,
  "communicationScore": number,
  "grammarScore": number,
  "confidenceScore": number,
  "problemSolvingScore": number,
  "professionalismScore": number,
  "improvementSuggestions": "string",
  "learningRecommendations": "string"
}
Do NOT wrap in markdown backticks, just return the raw JSON object.`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const cleanJson = cleanJsonString(text);
    const parsed = JSON.parse(cleanJson) as EvaluationResult;
    if (typeof parsed.score === "number") {
      return parsed;
    }
    throw new Error("Invalid score returned by Gemini");
  } catch (error) {
    console.error("Error evaluating answer with Gemini:", error);
    return {
      score: userAnswer ? 5 : 1,
      feedback: "Failed to generate AI feedback. Please review manually.",
      strengths: userAnswer ? "Attempted to answer the question." : "None",
      weaknesses: userAnswer ? "Evaluation service was temporarily unavailable." : "No answer was recorded.",
      suggestedAnswer: "A standard model answer would detail the architectural patterns, code examples, or definitions corresponding to the question asked.",
      technicalScore: userAnswer ? 5 : 1,
      communicationScore: userAnswer ? 5 : 1,
      grammarScore: userAnswer ? 5 : 1,
      confidenceScore: userAnswer ? 5 : 1,
      problemSolvingScore: userAnswer ? 5 : 1,
      professionalismScore: userAnswer ? 5 : 1,
      improvementSuggestions: "Study the standard documentation of the target tech stack.",
      learningRecommendations: "Review advanced courses on system design and algorithms.",
    };
  }
}

export async function analyzeResume(resumeText: string): Promise<string> {
  const prompt = `You are an AI resume parser. Extract structured details from the following resume text:
"${resumeText}"

Extract and format exactly as a JSON object containing:
- skills: array of strings
- projects: array of strings
- experience: array of strings
- education: array of strings

Return ONLY this JSON structure. Do NOT include markdown backticks or extra formatting.`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    return cleanJsonString(text);
  } catch (error) {
    console.error("Failed to parse resume text:", error);
    return JSON.stringify({
      skills: [],
      projects: [],
      experience: [],
      education: []
    });
  }
}
