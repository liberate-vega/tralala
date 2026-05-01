export async function translateImage(base64Image: string, profile: any): Promise<string> {
  const prompt = "Read and translate text in each of the comic panels in the asian style order (right to left then down) and submit a transcript of the text chronologically. Separate each speech bubble and panel with line breaks.";

  if (profile.provider === 'ollama') {
    const url = profile.endpointUrl || 'http://127.0.0.1:11434';
    const response = await fetch(`${url}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: profile.modelName || 'llava:latest',
        prompt: prompt,
        images: [base64Image],
        stream: false
      })
    });
    if (!response.ok) throw new Error(`Ollama error: ${response.statusText}`);
    const data = await response.json();
    return data.response;
  }

  if (profile.provider === 'openai') {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${profile.apiKey}`
      },
      body: JSON.stringify({
        model: profile.modelName || 'gpt-4o',
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: prompt },
              { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${base64Image}` } }
            ]
          }
        ],
        max_tokens: 1000
      })
    });
    if (!response.ok) throw new Error(`OpenAI error: ${response.statusText}`);
    const data = await response.json();
    return data.choices[0].message.content;
  }

  if (profile.provider === 'anthropic') {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': profile.apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerously-allow-browser': 'true'
      },
      body: JSON.stringify({
        model: profile.modelName || 'claude-3-5-sonnet-20240620',
        max_tokens: 1000,
        messages: [
          {
            role: 'user',
            content: [
              { type: 'image', source: { type: 'base64', media_type: 'image/jpeg', data: base64Image } },
              { type: 'text', text: prompt }
            ]
          }
        ]
      })
    });
    if (!response.ok) throw new Error(`Anthropic error: ${response.statusText}`);
    const data = await response.json();
    return data.content[0].text;
  }

  if (profile.provider === 'gemini') {
    const model = profile.modelName || 'gemini-1.5-pro';
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${profile.apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: prompt },
              { inline_data: { mime_type: 'image/jpeg', data: base64Image } }
            ]
          }
        ]
      })
    });
    if (!response.ok) throw new Error(`Gemini error: ${response.statusText}`);
    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
  }

  return "Fake translation output due to unknown API:\n\nPanel 1:\nHello World!\n\nPanel 2:\nThis is a test.";
}
