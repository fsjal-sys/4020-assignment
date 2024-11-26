// chatGPT_Evaluation.js

import { MongoClient } from "mongodb";
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: "sk-OqemR8KRPQPzuw2V28Mo-MUivgwbmm_j9Qt4oF787ST3BlbkFJeS8H9aLvWGoKCtQDXgDAoZe8Kk1Aafl5Zz9TgQdtAA"
});

const uri = "mongodb+srv://farhanaliahmed325:yourpassword@cluster0.l5tff.mongodb.net/?retryWrites=true&w=majority";
const client = new MongoClient(uri);

async function getRandomQuestions(client, collectionName, count) {
    const database = client.db("ChatGPT_Evaluation");
    const collection = database.collection(collectionName);
    const result = await collection.aggregate([{ $sample: { size: count } }]).toArray();

    if (result.length === 0) {
        console.error("No documents found in the collection.");
        return null;
    }

    return result;
}

async function updateCHATGPT(client, document, answer, collectionName) {
    try {
        const database = client.db("ChatGPT_Evaluation");
        const collection = database.collection(collectionName);

        // Update the CHATGPT field with the new answer
        await collection.updateOne(
            { _id: document._id },
            { $set: { CHATGPT: answer } }
        );
    } catch (err) {
        console.error("Error:", err);
    }
}

async function getChatGPTAnswer(question, A, B, C, D) {
    const question_block = `${question}\nA: ${A}\nB: ${B}\nC: ${C}\nD: ${D}`;
    const completion = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
            { role: 'system', content: "You are a professional test taker. Please provide the answers to questions by only replying with the letter corresponding to your choice (A, B, C, or D). Do not provide any explanations." },
            { role: "user", content: question_block }
        ],
        max_tokens: 5,
        temperature: 0.0
    });

    return completion.choices[0].message.content;
}

export { getRandomQuestions, updateCHATGPT, getChatGPTAnswer };
