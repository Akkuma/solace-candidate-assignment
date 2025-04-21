export async function* fetchStream(input: string | URL | globalThis.Request) {
  const decoder = new TextDecoder();
  const res = await fetch(input);
  const reader = res.body?.getReader();

  let buffer = "";

  if (!reader) return;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() || "";

    // Each line is an array of data optimized for `streamedQuery` expecting an array returned
    for (const line of lines) {
      if (line.trim()) yield JSON.parse(line);
    }
  }
}
