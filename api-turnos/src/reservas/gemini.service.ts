import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class GeminiService {
  private readonly logger = new Logger(GeminiService.name);
  private readonly apiKey = process.env.GEMINI_API_KEY;
  private readonly model = process.env.GEMINI_MODEL ?? 'gemini-flash-lite-latest';

  /**
   * Le pide a Gemini una respuesta en texto plano para `prompt`. Devuelve null ante
   * cualquier falla (sin API key, timeout, rate limit) para que quien la llama pueda
   * hacer fallback sin romper el endpoint.
   */
  async generarTexto(prompt: string): Promise<string | null> {
    if (!this.apiKey) return null;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${this.apiKey}`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000);

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { thinkingConfig: { thinkingLevel: 'low' } },
        }),
        signal: controller.signal,
      });

      if (!res.ok) {
        this.logger.warn(`Gemini respondió ${res.status}, sigo sin IA`);
        return null;
      }

      const data: any = await res.json();
      const texto = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      return texto?.trim() || null;
    } catch (error) {
      this.logger.warn(`Gemini no disponible, sigo sin IA: ${(error as Error).message}`);
      return null;
    } finally {
      clearTimeout(timeout);
    }
  }
}
