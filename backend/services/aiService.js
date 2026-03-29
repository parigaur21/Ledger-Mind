const { OpenAI } = require("openai");
const supabase = require('../config/supabase');

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const financialAI = async (transactions, query) => {
  const prompt = `
You are a financial advisor.

User transactions:
${JSON.stringify(transactions)}

Question:
${query}

Give:
- insights
- suggestions
- warnings
`;

  const res = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }]
  });

  return res.choices[0].message.content;
};

// Next Level RAG System: Extracting Text, creating Embeddings
const storeDocumentChunks = async (userId, text, filename) => {
    // Basic chunking (split by double newline or larger segments)
    const chunks = text.split('\n\n').filter(chunk => chunk.trim().length > 10);
    
    for (const chunk of chunks) {
        // Create an embedding for each chunk
        const embeddingResponse = await client.embeddings.create({
            model: "text-embedding-3-small",
            input: chunk,
        });

        const embedding = embeddingResponse.data[0].embedding;

        // Store inside Supabase
        await supabase.from('documents').insert({
            user_id: userId,
            content: chunk,
            metadata: { source: filename },
            embedding: embedding
        });
    }
    return chunks.length;
}

// Next Level RAG System: Querying
const statementAI = async (userId, query) => {
  // Turn query into embedding
  const queryEmbeddingRes = await client.embeddings.create({
      model: "text-embedding-3-small",
      input: query,
  });
  const queryEmbedding = queryEmbeddingRes.data[0].embedding;

  // Search in database via RPC
  const { data: matchedChunks, error } = await supabase.rpc('match_documents', {
      query_embedding: queryEmbedding,
      match_threshold: 0.5,
      match_count: 5,
      p_user_id: userId
  });

  if (error) {
      console.error("RPC Error:", error);
      throw error;
  }

  // Combine chunks into context
  const context = matchedChunks.map(chunk => chunk.content).join('\n\n');

  const prompt = `
You are a financial advisor analyzing a user's uploaded bank statements.

Below is the context retrieved from the user's documents:
${context || 'No specific document context found.'}

User Question:
${query}

Please provide exact insights based ONLY on the document context provided above.
`;

  const res = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }]
  });

  return res.choices[0].message.content;
};

module.exports = { financialAI, storeDocumentChunks, statementAI };
