import fs from 'fs';
import pdf from 'pdf-parse';
import mammoth from 'mammoth';

// ----- READ FILE -----
async function extractText(filePath) {
  const ext = filePath.split('.').pop().toLowerCase();
  if (ext === 'pdf') {
    const data = await fs.promises.readFile(filePath);
    const pdfData = await pdf(data);
    return pdfData.text;
  }
  if (ext === 'docx') {
    const result = await mammoth.extractRawText({ path: filePath });
    return result.value;
  }
  if (ext === 'txt') return fs.promises.readFile(filePath, 'utf8');
  throw new Error('Unsupported format');
}

// ----- AGENT 1 : RULE-BASED -----
function agentRuleBased(text) {
  const rules = [
    { kw: ['fuse', 'power'], sol: 'Check/replace device fuse and verify outlet.' },
    { kw: ['lens', 'image', 'blur'], sol: 'Clean lens & run camera calibration routine.' },
    { kw: ['error', 'e-'], sol: 'Note exact error code and contact manufacturer support.' }
  ];
  for (const r of rules) if (r.kw.some(k => text.toLowerCase().includes(k))) return r.sol;
  return 'No rule-based match found.';
}

// ----- AGENT 2 : EMBEDDING SIMILARITY (STUB) -----
function agentEmbedding(text) {
  // MVP: simple keyword count
  const keywords = ['calibration', 'lens', 'power', 'error', 'connectivity'];
  const score = keywords.reduce((s, k) => s + (text.toLowerCase().split(k).length - 1), 0);
  if (score > 2) return 'High similarity to known hardware issues – run full diagnostics.';
  return 'Low embedding similarity – consider environmental factors.';
}

// ----- AGENT 3 : LLM PROMPT (OPENAI EXAMPLE) -----
async function agentLLM(text) {
  // Placeholder – replace with real OpenAI/Azure/Gemini call
  // For now we fake a concise suggestion
  if (text.length < 50) return 'Text too short for LLM analysis.';
  return 'LLM suggests: perform firmware update and re-calibrate device modules.';
}

// ----- MAIN EXPORT -----
export async function analyseDocument(filePath) {
  const text = await extractText(filePath);
  const results = {
    ruleBased: agentRuleBased(text),
    embedding: agentEmbedding(text),
    llm: await agentLLM(text)
  };
  return { text, results };
}