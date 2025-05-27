const { default: axios } = require("axios");

async function smartRephrase(text, rephrase) {
  const responses = await axios.post(
    'https://api.openai.com/v1/responses',
    {
      model: "gpt-4",
      input: [{ role: "user", content: `Rephrase this mantra: "${text}" in a "${rephrase}" this way and give me just sentence.` }]
    },
    {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      },
    }
  );
  const parsed = JSON.parse(responses.data.output[0].content[0].text);
  return parsed.trim();
}

module.exports = { smartRephrase };



