import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: "sk-OqemR8KRPQPzuw2V28Mo-MUivgwbmm_j9Qt4oF787ST3BlbkFJeS8H9aLvWGoKCtQDXgDAoZe8Kk1Aafl5Zz9TgQdtAA"
});

async function main() {
  const completion = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [
      { role: 'system', content: "You are a helpful assistant" },
      { role: "user", content: "Write a poem about mushrooms." }
    ],
    max_tokens: 50, // Adjust as needed
    temperature: 0.7
  });

  console.log(completion.choices[0].message.content);
}
main().catch(console.error);