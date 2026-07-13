const API_KEY = "AIzaSyC4i_NhIqI44ukSkWd-3St_ZhtwZh5YVxM";

async function checkModels() {
  try {
    console.log("Asking Google for your available models...");
    
    // We are bypassing the SDK and asking the server directly using standard fetch
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`);
    const data = await response.json();
    
    if (data.models) {
      console.log("✅ SUCCESS! Here are the models you can use:");
      // This will print out a list of every valid model name for your account
      data.models.forEach(m => console.log(m.name));
    } else {
      console.log("❌ ERROR FETCHING MODELS:", data);
    }
  } catch (error) {
    console.error("❌ NETWORK ERROR:", error);
  }
}

checkModels();