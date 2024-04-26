export const fetchImageBlob = async (url: string) => {
  const imageBlob = await (await fetch(url)).blob();
  return imageBlob;
}

export const base64ToUrl = (base64: string) => {
  return "data:image/jpeg;base64," + base64
}