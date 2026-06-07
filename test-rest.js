async function test() {
  const apiKey = process.env.GEMINI_API_KEY;

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: "Hello",
              },
            ],
          },
        ],
      }),
    }
  );

  console.log("Status:", response.status);
  console.log(await response.text());
}

require("dotenv").config();
test().catch(console.error);
