// Thin, isolated LLM layer. The model is only ever used for language —
// turning already-computed factors into an explanation, or answering a
// question grounded in a data snapshot the caller provides. It never makes
// a recommendation or transfer decision; that stays deterministic in
// recommendationService.js and forecastService.js. If GROQ_API_KEY is
// missing or a call fails, every caller falls back to plain template text.

const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';
const MODEL = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';

function isConfigured() {
  return !!process.env.GROQ_API_KEY;
}

async function callGroq(system, userMessage, maxTokens) {
  const response = await fetch(GROQ_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: maxTokens,
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: userMessage },
      ],
    }),
  });

  if (!response.ok) {
    const body = await response.text().catch(() => '');
    throw new Error(`Groq API ${response.status}: ${body.slice(0, 300)}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content?.trim() || '';
}

// Turns a recommendation's already-computed factors into a natural-language
// explanation. Same input data the deterministic template reason
// (recommendationService.generateAIReason) is built from.
async function explainRecommendation(context) {
  if (!isConfigured()) return { text: null, configured: false };

  const {
    sourceBankName, sourceCity, destBankName, destCity,
    bloodGroup, deficitBloodGroup, matchType, component, units,
    distanceKm, expiryHoursRemaining, confidence,
    expiryScore, deficitScore, distanceScore, priority,
  } = context;

  const system = `You are PulseLink's redistribution-explanation assistant. You are given the ALREADY-COMPUTED factors behind a blood-unit transfer recommendation between two blood banks (the decision itself was made by a deterministic scoring algorithm, not by you). Write a short, clear, human-readable explanation (2-4 sentences, plain prose, no bullet points, no markdown) of why this transfer makes sense, referencing the concrete numbers given. Be specific and factual — do not invent details not present in the data. Write for a blood bank operations coordinator, not a general audience.`;

  const user = `Recommendation factors:
- Source bank: ${sourceBankName} (${sourceCity})
- Destination bank: ${destBankName} (${destCity})
- Component: ${component}, blood group being moved: ${bloodGroup}${matchType === 'compatible' ? ` (covering a ${deficitBloodGroup} deficit via compatible substitution)` : ''}
- Units: ${units}
- Distance: ${distanceKm.toFixed(1)} km
- Hours until the source units expire: ${expiryHoursRemaining}
- Composite AI confidence score: ${confidence}/100 (priority: ${priority})
- Score breakdown — expiry urgency: ${expiryScore}/100, destination deficit urgency: ${deficitScore}/100, distance feasibility: ${distanceScore}/100

Explain why this transfer is recommended.`;

  try {
    const text = await callGroq(system, user, 300);
    return { text: text || null, configured: true };
  } catch (error) {
    console.error('[llmService] explainRecommendation failed:', error.message);
    return { text: null, configured: true, error: error.message };
  }
}

// Stateless, single-turn copilot answer. `contextText` is a plain-text
// snapshot of live backend data gathered by the caller — the model answers
// using only that snapshot, so answers stay grounded rather than invented.
async function askCopilot(question, contextText) {
  if (!isConfigured()) {
    return {
      text: "The AI copilot isn't configured yet — add a GROQ_API_KEY to backend/.env to enable it. Once configured, you can ask things like \"which banks are at risk this weekend?\" or \"why was this transfer recommended?\"",
      configured: false,
    };
  }

  const system = `You are "Ask PulseLink", an operations copilot embedded in a blood-bank redistribution platform. You are given a live data snapshot below. Answer the user's question using ONLY the information in the snapshot. If the snapshot doesn't contain enough information to answer, say so plainly rather than guessing. Be concise (2-5 sentences unless a list is clearly needed), reference specific numbers/names from the snapshot, and write for a blood bank operations coordinator.

LIVE DATA SNAPSHOT:
${contextText}`;

  try {
    const text = await callGroq(system, question, 500);
    return { text: text || "I wasn't able to generate a response — please try again.", configured: true };
  } catch (error) {
    console.error('[llmService] askCopilot failed:', error.message);
    return {
      text: 'The AI copilot hit an error reaching the model. Please try again in a moment.',
      configured: true,
      error: error.message,
    };
  }
}

module.exports = { explainRecommendation, askCopilot, isConfigured, MODEL };
