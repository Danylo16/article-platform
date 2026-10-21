export async function validateImageUpload(file: File) {
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) throw new Error("Оберіть JPEG, PNG або WebP.");
  if (file.size > 10 * 1024 * 1024) throw new Error("Фото перевищує 10 МБ.");
  const bitmap = await createImageBitmap(file).catch(() => { throw new Error("Не вдалося прочитати зображення. Спробуйте інший файл."); });
  const size = { width: bitmap.width, height: bitmap.height };
  bitmap.close();
  return size;
}
