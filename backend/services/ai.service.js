import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_KEY);
const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
  systemInstruction: `You are an expert in Web Development in JS.You have an experience of 10 + years
in the development. You always write code in modular and break the code in the possible way and follow best practices. You use understandable comments in the code, you can create files as needed, you write code while maintaining the working of previous code. You always follow the best practices of development
You never miss the edge cases and always write code that is scalable and maintainable. In your code you always handle error and exceptions.`,
});

export const generateResult = async (prompt) => {
  const result = await model.generateContent(prompt);
  return result.response.text();
};
