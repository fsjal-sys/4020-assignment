// app.js

import express from "express";
import { MongoClient } from 'mongodb';
import path from 'path';
import { fileURLToPath } from 'url';
import { getRandomQuestions, updateCHATGPT, getChatGPTAnswer } from './chatGPT_evaluation.js';

const app = express();
const PORT = 3000;

const uri = "mongodb+srv://farhanaliahmed325:wpjWGrAJ7lSYbnEi@cluster0.l5tff.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const client = new MongoClient(uri);

function extractAnswerLetter(answer) {
    if (!answer) return null;
    const trimmedAnswer = answer.trim();
    const match = trimmedAnswer.match(/^[A-D]$/i);
    if (match) {
        return match[0].toUpperCase();
    } else {
        const match2 = trimmedAnswer.match(/([A-D])/i);
        if (match2) {
            return match2[1].toUpperCase();
        }
    }
    return null; 
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
    try {
        await client.connect();
        console.log("Connected to MongoDB.");

        app.use(express.static(path.join(__dirname, 'public')));

        const validCollections = {
            history: "History",
            sociology: "Sociology",
            computer_security: "Computer_Security"
        };

        app.get("/api/:collectionName", async (req, res) => {
            const collectionNameParam = req.params.collectionName.toLowerCase();
            const collectionName = validCollections[collectionNameParam];

            if (!collectionName) {
                res.status(404).send("Invalid collection name.");
                return;
            }

            try {
                console.log(`Fetching questions from collection: ${collectionName}`);
                const questionDataArray = await getRandomQuestions(client, collectionName, 20);
                console.log(`Number of questions retrieved: ${questionDataArray.length}`);

                if (!questionDataArray || questionDataArray.length === 0) {
                    throw new Error("No questions found in the collection.");
                }

                let totalResponseTime = 0; // Total response time in milliseconds
                let results = [];

                for (const questionData of questionDataArray) {
                    try {
                        const { question, A, B, C, D, ANSWER, _id } = questionData;

                        // Start timer
                        const startTime = Date.now();

                        // Generate a response using ChatGPT
                        const chatGPTAnswer = await getChatGPTAnswer(question, A, B, C, D);

                        // Stop timer
                        const endTime = Date.now();
                        const responseTime = endTime - startTime; // in milliseconds

                        // Accumulate total response time
                        totalResponseTime += responseTime;

                        // Update the document with ChatGPT's answer
                        await updateCHATGPT(client, { _id }, chatGPTAnswer, collectionName);

                        // Extract the answer letter from ChatGPT's response
                        const chatGPTAnswerLetter = extractAnswerLetter(chatGPTAnswer);
                        const normalizedChatGPTAnswer = chatGPTAnswerLetter ? chatGPTAnswerLetter.trim().toUpperCase() : null;
                        const normalizedCorrectAnswer = ANSWER.trim().toUpperCase();

                        console.log(`ChatGPT Answer: '${normalizedChatGPTAnswer}', Correct Answer: '${normalizedCorrectAnswer}'`);

                        let isCorrect = false;
                        if (normalizedChatGPTAnswer === null) {
                            // Handle invalid ChatGPT answer
                            console.log('Invalid ChatGPT answer format.');
                        } else if (normalizedChatGPTAnswer === normalizedCorrectAnswer) {
                            isCorrect = true;
                            console.log('Answer is correct.');
                        } else {
                            console.log('Answer is incorrect.');
                        }

                        results.push({
                            question,
                            options: { A, B, C, D },
                            correctAnswer: normalizedCorrectAnswer,
                            chatGPTAnswer: normalizedChatGPTAnswer || chatGPTAnswer.trim(),
                            isCorrect,
                            responseTime
                        });
                    } catch (err) {
                        console.error(`Error processing question "${questionData.question}":`, err);
                        results.push({
                            question: questionData.question,
                            options: { A: questionData.A, B: questionData.B, C: questionData.C, D: questionData.D },
                            correctAnswer: questionData.ANSWER.trim().toUpperCase(),
                            chatGPTAnswer: null,
                            isCorrect: false,
                            responseTime: null,
                            reason: "Error processing question"
                        });
                    }
                }

                // Calculate correct and incorrect counts based on results
                const correctCount = results.filter(item => item.isCorrect).length;
                const incorrectCount = results.length - correctCount;

                const totalQuestions = results.length;
                const accuracyRate = (correctCount / totalQuestions) * 100; // in percentage
                const averageResponseTime = totalResponseTime / totalQuestions; // in milliseconds

                // Send the results as a response
                res.json({
                    totalQuestions,
                    correctCount,
                    incorrectCount,
                    accuracyRate,
                    averageResponseTime,
                    results
                });

            } catch (err) {
                console.error("Error in API endpoint:", err);
                res.status(500).send("An error occurred.");
            }
        });

        app.listen(PORT, () => {
            console.log(`Server is listening on http://localhost:${PORT}`);
        });

    } catch (err) {
        console.error("Error connecting to MongoDB:", err);
    }
}

main().catch(console.error);
