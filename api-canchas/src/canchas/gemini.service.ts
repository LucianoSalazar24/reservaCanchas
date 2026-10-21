import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class GeminiService {
  private readonly logger = new Logger(GeminiService.name);
  private readonly apiKey = process.env.GEMINI_API_KEY;
  private readonly model = process.env.GEMINI_MODEL ?? 'gemini-flash-lite-latest';


  /**
   * Un paso de una conversación con function calling. Devuelve el `content` del modelo
   * tal cual (puede traer `functionCall` y `thoughtSignature`, que hay que reenviar
   * intactos en el turno siguiente) o null ante cualquier falla.
   */
  async generarConHerramientas(body: {
    systemInstruction: string;
    contents: unknown[];
    functionDeclarations: unknown[];
  }): Promise<{ role: string; parts: any[] } | null> {
    if (!this.apiKey) return null;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${this.apiKey}`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20000);

    try {
      const init = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: body.systemInstruction }] },
          contents: body.contents,
          tools: [{ functionDeclarations: body.functionDeclarations }],
          generationConfig: { thinkingConfig: { thinkingLevel: 'low' } },
        }),
        signal: controller.signal,
      };
      let res = await fetch(url, init);
      // 429/5xx de Gemini suelen ser picos pasajeros: un reintento evita caer al modo sin IA.
      if (res.status === 429 || res.status >= 500) {
        await new Promise((r) => setTimeout(r, 1000));
        res = await fetch(url, init);
      }

      if (!res.ok) {
        this.logger.warn(`Gemini respondió ${res.status}, sigo sin IA`);
        return null;
      }

      const data: any = await res.json();
      const content = data?.candidates?.[0]?.content;
      return content?.parts?.length ? content : null;
    } catch (error) {
      this.logger.warn(`Gemini no disponible, sigo sin IA: ${(error as Error).message}`);
      return null;
    } finally {
      clearTimeout(timeout);
    }
  }

  async generarJson<T>(prompt: string): Promise<T | null> {
    if (!this.apiKey) return null;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${this.apiKey}`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            responseMimeType: 'application/json',
     
            thinkingConfig: { thinkingLevel: 'low' },
          },
        }),
        signal: controller.signal,
      });

      if (!res.ok) {
        this.logger.warn(`Gemini respondió ${res.status}, sigo sin IA`);
        return null;
      }

      const data: any = await res.json();
      const texto = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      return texto ? (JSON.parse(texto) as T) : null;
    } catch (error) {
      this.logger.warn(`Gemini no disponible, sigo sin IA: ${(error as Error).message}`);
      return null;
    } finally {
      clearTimeout(timeout);
    }
  }
}
