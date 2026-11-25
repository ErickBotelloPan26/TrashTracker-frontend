export async function readImage(file: File): Promise<string> {
  if (!["image/jpeg", "image/png"].includes(file.type))
    throw new Error("Selecciona una imagen JPG o PNG.");
  if (file.size > 10 * 1024 * 1024)
    throw new Error("La imagen no debe superar los 10 MB.");
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("No se pudo leer la imagen."));
    reader.readAsDataURL(file);
  });
}
