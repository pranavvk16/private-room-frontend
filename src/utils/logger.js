export const log = (...msg) => {
  // Centralized client-side logging
  // eslint-disable-next-line no-console
  console.log("[CLIENT]", ...msg);
};
