import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function POST(req) {
  try {
    const { imageBase64, foodDescription } = await req.json();

    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash",
      generationConfig: { responseMimeType: "application/json" }
    });

    const prompt = `You are an expert nutritionist. 
    ${foodDescription ? `The user is specifically asking for the nutritional values of: "${foodDescription}". Calculate accurately for this exact portion.` : 'Analyze the food in the image.'}
    
    Return ONLY a valid JSON object matching this exact schema:
    {
      "calories": (number, total kcal),
      "protein": (string, e.g., "10g"),
      "carbs": (string, e.g., "45g"),
      "fat": (string, e.g., "15g"),
      "fiber": (string, e.g., "5g"),
      "verdict": (string, either "Bulk Friendly" or "Cut Friendly" depending on macro density)
    }`;

    // We build the request array. If there's an image, we attach it. If not, just text!
    let contentArray = [prompt];

    if (imageBase64) {
      const mimeType = imageBase64.substring(imageBase64.indexOf(":") + 1, imageBase64.indexOf(";"));
      const base64Data = imageBase64.split(",")[1];
      contentArray.push({ inlineData: { data: base64Data, mimeType: mimeType } });
    }

    const result = await model.generateContent(contentArray);
    const response = await result.response;
    const data = JSON.parse(response.text());

    return NextResponse.json(data);
  } catch (error) {
    console.error("API Error Detailed:", error);
    return NextResponse.json({ error: error.message || "Analysis failed" }, { status: 500 });
  }
}