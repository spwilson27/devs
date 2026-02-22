export async function drainStream(stream: ReadableStream<string> | any): Promise<string> {
  if (!stream) return '';

  if (typeof stream.getReader === 'function') {
    const reader = stream.getReader();
    let out = '';
    // Read each chunk and await read() to handle backpressure correctly
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      out += String(value);
    }
    return out;
  }

  // Node.js Readable stream fallback
  if (typeof stream.on === 'function') {
    return new Promise((resolve, reject) => {
      let buf = '';
      stream.on('data', (chunk: any) => (buf += String(chunk)));
      stream.on('end', () => resolve(buf));
      stream.on('error', (err: any) => reject(err));
    });
  }

  // Async iterator fallback
  if (stream[Symbol.asyncIterator]) {
    let buf = '';
    for await (const chunk of stream) {
      buf += String(chunk);
    }
    return buf;
  }

  return String(stream ?? '');
}
