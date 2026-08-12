export interface PickedImage {
  uri: string;
  fileName?: string | null;
  mimeType?: string | null;
}

/** No backend to upload to — the picked image's own local URI (blob:/data:/file:)
 * is already renderable, so it's used directly instead of being uploaded anywhere. */
export async function uploadImage(image: PickedImage): Promise<string> {
  return image.uri;
}
