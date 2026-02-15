export const toSafeFileName = (name: string) => {
  return name
    .replace(/\.[^/.]+$/, "")
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-_]/g, "");
};
