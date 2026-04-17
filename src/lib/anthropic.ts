// thin wrapper around the anthropic sdk that yields streamed tokens

import Anthropic from "@anthropic-ai/sdk";
import { MODEL } from "./prompts";

export interface StreamCallbacks {
  onDelta?: (text: string) => void;
  onDone?: (fullText: string) => void;
}

export async function streamText(
  apiKey: string,
  systemPrompt: string,
  userPrompt: string,
  callbacks?: StreamCallbacks,
): Promise<string> {
  const client = new Anthropic({ apiKey });

  let full = "";
  const stream = await client.messages.stream({
    model: MODEL,
    max_tokens: 400,
    system: systemPrompt,
    messages: [{ role: "user", content: userPrompt }],
  });

  for await (const event of stream) {
    if (
      event.type === "content_block_delta" &&
      event.delta.type === "text_delta"
    ) {
      const t = event.delta.text;
      full += t;
      callbacks?.onDelta?.(t);
    }
  }
  await stream.finalMessage();
  callbacks?.onDone?.(full);
  return full;
}
