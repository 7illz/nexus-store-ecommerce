const handleChatMessage = async (req, res) => {
  try {
    const { message } = req.body;
    
    // Grabbing the key inside the function guarantees dotenv has loaded it
    const apiKey = process.env.GEMINI_API_KEY;

    const systemInstruction = `
      You are the official customer support AI for NexusStore, an electronics and gaming e-commerce platform.
      Keep your answers extremely concise, friendly, and helpful (1-3 sentences max).
      You sell items like keyboards, monitors, routers, and gaming consoles.
      If a user asks about shipping, tell them standard shipping takes 3-5 business days.
      If you don't know the answer, politely tell them to email support@nexusstore.com.
    `;

    const prompt = `${systemInstruction}\n\nCustomer: ${message}\nAI Support:`;

    // Direct REST API call bypassing the NPM package
const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-native-audio-latest:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: prompt }]
        }]
      })
    });

    const data = await response.json();

    // If Google rejects it, this will print the EXACT reason why
    if (!response.ok) {
      console.error("\n❌ RAW GOOGLE JSON ERROR:");
      console.error(JSON.stringify(data, null, 2));
      return res.status(500).json({ reply: "Support offline. Check your backend terminal for the JSON error." });
    }

    // Extract the text from Google's JSON response structure
    const aiResponse = data.candidates[0].content.parts[0].text;
    res.json({ reply: aiResponse });

  } catch (error) {
    console.error("Server Fetch Error:", error);
    res.status(500).json({ reply: "Internal server error." });
  }
};

module.exports = { handleChatMessage };