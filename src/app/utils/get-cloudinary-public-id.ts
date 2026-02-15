export const getCloudinaryPublicId = (url: string): string | null => {
  const cleanUrl = url.split("?")[0];

  const uploadIndex = cleanUrl.indexOf("/upload/");

  if (uploadIndex === -1) return null;

  const afterUpload = cleanUrl.substring(uploadIndex + 8);

  const withoutVersion = afterUpload.replace(/^v\d+\//, "");

  const publicId = withoutVersion.replace(/\.[^/.]+$/, "");

  return publicId;
};
