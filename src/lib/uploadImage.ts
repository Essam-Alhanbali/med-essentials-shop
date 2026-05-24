import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "@/lib/firebase";

export async function uploadImageFile(file: File, folder: string): Promise<string> {
  const ext = file.name.split(".").pop() || "jpg";
  const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const r = ref(storage, path);
  await uploadBytes(r, file, { contentType: file.type });
  return getDownloadURL(r);
}