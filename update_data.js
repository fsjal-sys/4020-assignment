import { MongoClient } from "mongodb";
import { getRandomQuestion } from "./get_data.js";

const uri = "mongodb+srv://farhanaliahmed325:wpjWGrAJ7lSYbnEi@cluster0.l5tff.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"

const client = new MongoClient(uri)

async function updateCHATGPT(collectionName, chatGPT_answer, document) {
    try {
        const database = client.db("ChatGPT_Evaluation");
        const collection = database.collection(collectionName);

        const updateResult = await collection.updateOne(
            { _id: document._id },
            { $set: { CHATGPT: chatGPT_answer } }
        );

        const updatedDocument = await collection.findOne({ _id: document._id });
        console.log(updatedDocument);
    } catch (err) {
        console.error("Error:", err);
    } finally {
        await client.close();
        console.log("Connection closed.");
    }
}

async function run() {
    try {
      await client.connect();
      console.log("Connected to MongoDB.");
      const question = await getRandomQuestion("History");
      await updateCHATGPT("History", "Test", question);
    } catch (err) {
      console.error("Error: ", err)
    } finally {
      await client.close()
      console.log("Connection closed.");
    }
}

run().catch(console.dir);