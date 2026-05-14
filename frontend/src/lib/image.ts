export function shouldBypassImageOptimization(src?: string | null) {
  if (!src) {
    return false;
  }

  try {
    const url = new URL(src);

    return (
      (url.hostname === "localhost" || url.hostname === "127.0.0.1") &&
      url.port === "9000"
    );
  } catch {
    return false;
  }
}
