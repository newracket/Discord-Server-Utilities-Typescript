import { GoogleGenAI } from "@google/genai";
import Groq from "groq-sdk";
import { EnvironmentVariables } from "./Typings";

export enum AIProviderType {
  Gemini = "gemini",
  Groq = "groq"
}

export interface AIResponse {
  text: string;
}

export class AIService {
  private gemini: GoogleGenAI | null = null;
  private groq: Groq | null = null;

  constructor(environment: EnvironmentVariables) {
    if (environment.geminiApiKey) {
      this.gemini = new GoogleGenAI({ apiKey: environment.geminiApiKey });
    }
    if (environment.groqApiKey) {
      this.groq = new Groq({ apiKey: environment.groqApiKey });
    }
  }

  async generateContent(
    provider: AIProviderType,
    prompt: string,
    options?: {
      model?: string;
      maxTokens?: number;
      temperature?: number;
    }
  ): Promise<AIResponse> {
    switch (provider) {
      case AIProviderType.Gemini:
        return this.generateWithGemini(prompt, options);
      case AIProviderType.Groq:
        return this.generateWithGroq(prompt, options);
      default:
        throw new Error(`Unknown provider: ${provider}`);
    }
  }

  private async generateWithGemini(
    prompt: string,
    options?: {
      model?: string;
    }
  ): Promise<AIResponse> {
    if (!this.gemini) {
      throw new Error("Gemini API key not configured");
    }

    const model = options?.model || "gemma-3-27b-it";
    const response = await this.gemini.models.generateContent({
      model,
      contents: prompt,
    });

    if (!response.text) {
      throw new Error("Gemini did not respond");
    }

    return { text: response.text };
  }

  private async generateWithGroq(
    prompt: string,
    options?: {
      model?: string;
    }
  ): Promise<AIResponse> {
    if (!this.groq) {
      throw new Error("Groq API key not configured");
    }

    const model = options?.model || "groq/compound";
    const response = await this.groq.chat.completions.create({
      model,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const text = response.choices[0]?.message?.content;
    if (!text) {
      throw new Error("Groq did not respond");
    }

    return { text };
  }

  isProviderAvailable(provider: AIProviderType): boolean {
    switch (provider) {
      case AIProviderType.Gemini:
        return this.gemini !== null;
      case AIProviderType.Groq:
        return this.groq !== null;
      default:
        return false;
    }
  }
}
