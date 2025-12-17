const { onRequest } = require("firebase-functions/v2/https");
const { defineSecret } = require("firebase-functions/params");
const { OpenAI } = require("openai");
const cors = require("cors")({ origin: true });

// SECURITY: Retrieve API Key from Google Secret Manager
const openAiKey = defineSecret("OPENAI_API_KEY");

exports.generateEstimate = onRequest({ secrets: [openAiKey] }, (req, res) => {
  cors(req, res, async () => {
    if (req.method !== "POST") return res.status(405).send("Method Not Allowed");
    const { image, notes } = req.body;
    
    try {
      const openai = new OpenAI({ apiKey: openAiKey.value() });

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: "You are a construction estimator. Return JSON: { \"materialsCost\": \"$X\", \"laborCost\": \"$Y\", \"totalCost\": \"$Z\", \"profitMargin\": \"40%\" }" },
          { 
            role: "user", 
            content: [
              { type: "text", text: `Notes: ${notes}` },
              { type: "image_url", image_url: { url: `data:image/jpeg;base64,${image}` } }
            ] 
          }
        ],
        max_tokens: 500,
      });

      const result = response.choices[0].message.content;
      const jsonMatch = result.match(/\{[\s\S]*\}/);
      const cleanJson = jsonMatch ? JSON.parse(jsonMatch[0]) : { error: "AI Parsing Failed" };

      res.status(200).send(cleanJson);
    } catch (error) {
      res.status(500).send({ error: "Estimation failed." });
    }
  });
});