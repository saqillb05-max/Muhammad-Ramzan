
import { GoogleGenAI } from "@google/genai";
import { FactoryRecord, Article, RecordType } from "../types";

// Always use the API key from environment variables.
// The initialization is moved inside the function to ensure the most recent key is used.

export async function getFactoryInsights(records: FactoryRecord[], articles: Article[]) {
  // Initialize the GenAI client with the mandatory API key configuration.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  // Using gemini-3-pro-preview as this task involves complex business analysis and reasoning.
  const model = 'gemini-3-pro-preview';
  
  const recordsSummary = records.map(r => {
    // Fix: Handle each record type specifically to ensure type safety.
    // InitialBalanceRecord and ExpenseRecord have different structures than BaseRecord-derived types.
    if (r.type === RecordType.EXPENSE) {
      return {
        date: r.date,
        type: r.type,
        article: r.description,
        qty: 0,
        amount: r.amount
      };
    } else if (r.type === RecordType.INITIAL_BALANCE) {
      return {
        date: r.date,
        type: r.type,
        article: r.name,
        qty: 0,
        amount: r.amount
      };
    } else {
      // For MANUFACTURING, SALE, PURCHASE, and INITIAL_STOCK, we can safely access articleId and quantity.
      // We use type casting to any here to satisfy the union type while accessing shared properties.
      const typedRecord = r as any;
      return {
        date: r.date,
        type: r.type,
        article: articles.find(a => a.id === typedRecord.articleId)?.name || 'Unknown Article',
        qty: typedRecord.quantity || 0,
        amount: typedRecord.totalAmount || typedRecord.totalCost || typedRecord.amount || 0
      };
    }
  });

  const prompt = `
    Analyze the following daily records for a building materials factory in Pakistan.
    All monetary amounts are in Pakistani Rupees (Rs.).
    Records: ${JSON.stringify(recordsSummary)}
    
    Provide a professional summary including:
    1. A brief overview of current business health in PKR terms.
    2. Any noticeable trends in manufacturing vs sales volume and revenue.
    3. Potential inventory risks (e.g., high manufacturing without sales).
    4. Strategic advice for the factory manager.

    Format the response in clean Markdown.
  `;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
    });
    // Use .text property directly as it is a getter, not a method.
    return response.text || "Unable to generate insights at this moment.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "The AI assistant is temporarily unavailable. Please check back later.";
  }
}