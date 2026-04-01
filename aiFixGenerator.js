const OpenAI = require("openai");
const fs = require("fs");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

async function generateFix(error, filePath) {
  try {
    const originalCode = fs.readFileSync(filePath, "utf8");

    const prompt = `
You are a senior software engineer.

Fix the following issue:
Error Type: ${error.type}
Details: ${JSON.stringify(error)}

Here is the file:
${originalCode}

Return ONLY the fixed code. No explanation.
`;

    const response = await openai.chat.completions.create({
      model: "gpt-4.1",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.2
    });

    return response.choices[0].message.content;

  } catch (err) {
    console.error("❌ AI fix failed:", err.message);
    return null;
  }
}

module.exports = { generateFix };
