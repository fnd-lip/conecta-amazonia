import { GoogleGenAI } from '@google/genai';
import logger from '../../config/logger';

const DEFAULT_OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'llama3.1:latest';
const DEFAULT_GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434';
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';

export type AssistantProvider = 'ollama' | 'gemini';

export type StreamWriter = (payload: Record<string, unknown>) => void;

function getProvider(): AssistantProvider {
  const raw = (process.env.ASSISTANT_PROVIDER || 'ollama').toLowerCase();
  return raw === 'gemini' ? 'gemini' : 'ollama';
}

function getGeminiClient() {
  if (!GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY nao configurada.');
  }
  return new GoogleGenAI({ apiKey: GEMINI_API_KEY });
}

async function callOllamaAsk(systemPrompt: string, message: string) {
  const response = await fetch(`${OLLAMA_URL}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: DEFAULT_OLLAMA_MODEL,
      stream: false,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message.trim() },
      ],
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Ollama error: ${response.status} ${text}`);
  }

  const data = (await response.json()) as {
    message?: { content?: string };
  };
  const reply = data.message?.content?.trim();
  if (!reply) {
    throw new Error('Ollama reply vazio.');
  }
  return reply;
}

async function callOllamaStream(
  systemPrompt: string,
  message: string,
  write: StreamWriter
) {
  const response = await fetch(`${OLLAMA_URL}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: DEFAULT_OLLAMA_MODEL,
      stream: true,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message.trim() },
      ],
    }),
  });

  if (!response.ok || !response.body) {
    const text = await response.text();
    throw new Error(`Ollama stream error: ${response.status} ${text}`);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;
      const chunk = JSON.parse(trimmed) as {
        message?: { content?: string };
        done?: boolean;
      };
      if (chunk.message?.content) {
        write({ delta: chunk.message.content });
      }
      if (chunk.done) {
        return;
      }
    }
  }
}

async function callGeminiAsk(systemPrompt: string, message: string) {
  const ai = getGeminiClient();
  const response = await ai.models.generateContent({
    model: DEFAULT_GEMINI_MODEL,
    contents: `${systemPrompt}\n\nUsuario: ${message.trim()}`,
  });
  const reply = response.text?.trim();
  if (!reply) {
    throw new Error('Gemini reply vazio.');
  }
  return reply;
}

async function callGeminiStream(
  systemPrompt: string,
  message: string,
  write: StreamWriter
) {
  const ai = getGeminiClient();
  const response = await ai.models.generateContentStream({
    model: DEFAULT_GEMINI_MODEL,
    contents: `${systemPrompt}\n\nUsuario: ${message.trim()}`,
  });

  for await (const chunk of response) {
    if (chunk.text) {
      write({ delta: chunk.text });
    }
  }
}

export async function assistantAsk(systemPrompt: string, message: string) {
  const provider = getProvider();
  logger.info({ provider }, 'Assistente provider selecionado');
  if (provider === 'gemini') {
    return callGeminiAsk(systemPrompt, message);
  }
  return callOllamaAsk(systemPrompt, message);
}

export async function assistantStream(
  systemPrompt: string,
  message: string,
  write: StreamWriter
) {
  const provider = getProvider();
  logger.info({ provider }, 'Assistente provider stream selecionado');
  if (provider === 'gemini') {
    return callGeminiStream(systemPrompt, message, write);
  }
  return callOllamaStream(systemPrompt, message, write);
}
