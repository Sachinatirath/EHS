import { apiClient } from './client';

export interface PickedImage {
  uri: string;
  fileName?: string | null;
  mimeType?: string | null;
}

export async function uploadImage(image: PickedImage): Promise<string> {
  const form = new FormData();
  const name = image.fileName ?? `photo-${Date.now()}.jpg`;
  const type = image.mimeType ?? 'image/jpeg';

  form.append('file', {
    uri: image.uri,
    name,
    type,
  } as unknown as Blob);

  const res = await apiClient.post<{ url: string }>('/uploads', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data.url;
}
