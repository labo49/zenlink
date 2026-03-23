import { GoogleGenerativeAI } from 'npm:@google/generative-ai';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { title } = await req.json() as { title: string };

    if (!title?.trim()) {
      return Response.json({ tags: [] }, { headers: corsHeaders });
    }

    const apiKey = Deno.env.get('GEMINI_API_KEY');
    if (!apiKey) throw new Error('GEMINI_API_KEY not set');

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `Given the following webpage title, suggest 3 to 5 short, relevant hashtags for categorising it as a saved link.

Rules:
- Return ONLY a JSON array of strings, no explanation
- Each tag should be lowercase, no spaces, no # symbol
- Be specific and useful for filtering links later
- Example output: ["javascript", "tutorial", "webdev", "react"]

Title: "${title}"`;

    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();

    // Parse the JSON array from Gemini's response
    const match = text.match(/\[.*\]/s);
    const tags: string[] = match ? JSON.parse(match[0]) : [];

    return Response.json(
      { tags: tags.slice(0, 5) },
      { headers: corsHeaders },
    );
  } catch (err) {
    console.error('[suggest-tags]', err);
    // Graceful degradation — return empty tags so the UI still works
    return Response.json({ tags: [] }, { headers: corsHeaders, status: 200 });
  }
});
