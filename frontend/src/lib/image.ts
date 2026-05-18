export function shouldBypassImageOptimization(src?: string | null) {
  if (!src) {
    return false;
  }

  try {
    const url = new URL(src);

    // User-provided cover URLs should be fetched by the browser directly
    // instead of proxying arbitrary hosts through the Next.js image server.
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}
