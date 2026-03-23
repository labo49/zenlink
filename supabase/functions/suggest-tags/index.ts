const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, content-type',
};

const GEMINI_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent';

Deno.serve(async (req) => {
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

    const prompt = `Given this webpage title, return ONLY a JSON array of 3-5 lowercase hashtags (no spaces, no # symbol) useful for filtering saved links. Example: ["javascript","react","tutorial"]\n\nTitle: "${title}"`;

    const res = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.2, maxOutputTokens: 100 },
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error('[suggest-tags] Gemini error:', err);
      return Response.json({ tags: [] }, { headers: corsHeaders });
    }

    const data = await res.json();
    const text: string = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? '';
    console.log('[suggest-tags] raw:', text);

    const cleaned = text.replace(/```[a-z]*\n?/g, '').replace(/```/g, '').trim();
    const match = cleaned.match(/\[[\s\S]*\]/);
    const tags: string[] = match ? JSON.parse(match[0]) : [];

    return Response.json({ tags: tags.slice(0, 5) }, { headers: corsHeaders });
  } catch (err) {
    console.error('[suggest-tags]', err);
    return Response.json({ tags: [] }, { headers: corsHeaders });
  }
});
