import axios from "axios";
import { base64ToUrl } from "../utils/img";

const TRYON_API_URL = "http://127.0.0.1:5000";
const tryonAxios = axios.create({
  baseURL: TRYON_API_URL,
})

export enum GarmentCategory {
  UpperBody = "Upper-body",
  LowerBody = "Lower-body",
  Dress = "Dress",
}

export function getSampleImages(category: GarmentCategory) {
  if (category === GarmentCategory.UpperBody) {
    return {
      // person: "https://res.cloudinary.com/dp0ayty6p/image/upload/v1713090959/models/girl.jpg",
      // person: "https://res.cloudinary.com/dp0ayty6p/image/upload/v1713092520/models/girl2.jpg",
      person: "https://res.cloudinary.com/dp0ayty6p/image/upload/v1713093006/models/girl3.png",
    // person: "https://res.cloudinary.com/dp0ayty6p/image/upload/v1713090966/models/hrk.jpg", // White upper body
      // cloth: "https://res.cloudinary.com/dp0ayty6p/image/upload/v1708500121/outfit_genai/samples/hoodie.png",
    }
  } else if (category === GarmentCategory.LowerBody) {
    return {
      person: "https://res.cloudinary.com/dp0ayty6p/image/upload/v1713093246/models/girl4_l.jpg",
      // cloth: "https://res.cloudinary.com/dp0ayty6p/image/upload/v1708500121/outfit_genai/samples/jeans.png",
    }
  }
  
  return {
    // person: "",
    // person: "",
    // person: "",
    // person: "https://res.cloudinary.com/dp0ayty6p/image/upload/v1713090958/models/anil.jpg",
    person: "https://res.cloudinary.com/dp0ayty6p/image/upload/v1713093246/models/girl4_l.jpg",
    // person: "https://res.cloudinary.com/dp0ayty6p/image/upload/v1713090962/models/hrithik.jpg", // Black
    // cloth: "https://res.cloudinary.com/dp0ayty6p/image/upload/v1708500121/outfit_genai/samples/dress.png",
  }
}
// const {person, cloth} = await fetchSampleImageBlobs();

export async function tryoutUpperbodyCloth(person_img_url: string, cloth_img_url: string) {
  console.log("Request upper body for", {person: person_img_url, cloth: cloth_img_url});
  const response = await tryonAxios.post("/tryUpperBodyOutfit", {
    person_img_url: person_img_url,
    cloth_img_url: cloth_img_url,
  })
  console.log("Response from tryoutUpperbodyCloth: ", response);
  return response.data.map(img => base64ToUrl(img.image));
}


export async function tryoutSpecifiedCloth(person_img_url: string, cloth_img_url: string, category: GarmentCategory) {
  console.log("Request specified cloth for", {category, person: person_img_url, cloth: cloth_img_url});
  const response = await tryonAxios.post("/tryOutfit", {
    person_img_url: person_img_url,
    cloth_img_url: cloth_img_url,
    category,
  }).then(err => {
    console.log("Error from tryOutfit: ", err);
    return err;
  });
  console.log("Response from tryOutfit: ", response);
  return response.data.map(img => base64ToUrl(img.image));
}