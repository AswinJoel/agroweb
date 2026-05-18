export interface Recommendation {
  id: string;
  name: string;
  reason: string;
  category: string;
}

export async function getProductRecommendations(
  userRole: string,
  history: string[] = [],
  trending: string[] = []
): Promise<Recommendation[]> {
  try {
    const prompt = `You are the AgroConnect AI Recommendation Engine. 
    Based on the following user data, suggest 3 agricultural products.
    User Role: ${userRole}
    Past Purchases/Views: ${history.join(", ")}
    Trending in Market: ${trending.join(", ")}
    
    Response must be a JSON array of objects with: id (string), name (string), reason (string, why it's recommended), category (string).
    Keep it professional and helpful.`;

    const response = await fetch("/api/ai/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: prompt, context: "Recommendation Engine" })
    });

    if (!response.ok) throw new Error("Proxy failed");
    const data = await response.json();
    const text = data.response || "";
    
    // Attempt to parse JSON from Markdown block if present
    const jsonStr = text.match(/\[.*\]/s)?.[0] || text.replace(/```json|```/g, "").trim();
    return JSON.parse(jsonStr);
  } catch (err) {
    console.error("AI Recommendation Error:", err);
    return [
      { id: "1", name: "Organic Tomatoes", reason: "Seasonal favorite in your area", category: "Vegetables" },
      { id: "2", name: "Fresh Milk", reason: "Directly from verified local dairy", category: "Dairy" }
    ];
  }
}

export async function getFarmerAssistantResponse(
  query: string,
  context: string = ""
): Promise<string> {
  try {
    const response = await fetch("/api/ai/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        message: query, 
        context: `Farmer Context: ${context}. Instruction: You are the AgroConnect Farmer's Assistant.` 
      })
    });

    if (!response.ok) throw new Error("Proxy failed");
    const data = await response.json();
    
    return data.response || "";
  } catch (err) {
    console.error("Farmer AI Assistant Error:", err);
    return "I'm sorry, I'm having trouble connecting to the neural network. Please check your connection or try again later.";
  }
}
