import{ GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI('AIzaSyB1ogEwFXB8x7sOqhaxp_v7bvTxM-Qu1RU');

const model = genAI.getGenerativeModel({model: "gemini-1.5-flash"});

const prompt = "Hi.";
const result = await model.generateContent([prompt]);
console.log(result.response.text());