import axios from "axios";
import { LLM_API_URL, SD_API_URL } from "../constants/urls.ts";
import { NEGATIVE_PROMPT_BODY, STEPS } from "../constants/prompting.ts";

// function base64ToImgURL(base64String: string) {
//   const blob = new Blob(["data:image/png;base64," + base64String], {
//     type: "image/png",
//   });
//   return URL.createObjectURL(blob);
// }

function extractOutfitDescriptions(text: string) {
  const descriptions: String[] = [];
  const outfits = text.split("Outfit").slice(1);
  for (let outfit of outfits) {
    const description = outfit.split(":")[1].trim();
    descriptions.push(description);
  }
  return descriptions;
}

function extractAIResponse(input: string): string {
  const outfitsRegex = /Outfit \d+:.*?(?=\nOutfit \d+:|$)/gs;
  const outfits = input.match(outfitsRegex);
  if (outfits && outfits.length >= 4) {
    return outfits.slice(1).join("\n");
  } else {
    return "Not enough outfits found.";
  }
}

export const getOutfitPrompts = async (prompt: string) => {
  const response = await axios
    .post(`${LLM_API_URL}/qa`, {
      prompt,
    })
    .then((res) => res.data);

  console.log("Outfit prompts", response);
  const descriptions = extractOutfitDescriptions(
    extractAIResponse(response.response.results[0])
  );
  const AiResponse = extractAIResponse(response.response.results[0]);
  // response.response.results[0].substring(
  //   response.response.results[0].indexOf("Answer: ")
  // );

  console.log({
    descriptions: descriptions || [],
    products: response.response?.documents.slice(0, 3) || [],
    response: AiResponse,
  });

  return {
    descriptions: descriptions || [],
    products: response.response?.documents.slice(0, 3) || [],
    response: AiResponse,
  };
};

export async function getLlmRecommendations(prompt: string, newChat: boolean) {
  const response: {
    product_ids: Record<string, string>;
    article_ids: Record<string, string>;
    products_data: any[];
    answer: string;
  } = await axios
    .post(`${LLM_API_URL}/recommendedproducts`, {
      new: newChat,
      prompt,
    })
    .then((res) => res.data);

  console.log("LLM recommends", response);
  return {
    answer: response.answer,
    articles: Object.values(response.article_ids) || [],
  };
}

function sdNegativePromptGenerator() {
  return NEGATIVE_PROMPT_BODY;
}
function finalSdPromptGenerator(
  age: string,
  gender: string,
  userPrompt: string,
  rawOutfitPrompt: string
) {
  const prefix =
    "8k uhd, dslr, soft lighting, high quality, film grain, full frame, Fujifilm XT3 ";
  const body = `full portrait photo ${userPrompt}, ${age} years ${gender} wearing ${rawOutfitPrompt} <lora:add_detail:1> `;
  const postfix = "";
  return prefix + body + postfix;
}

export async function generateOutfit(
  age: string,
  gender: string,
  userMessage: string,
  prompt: string,
  desc: string
) {
  const finalSdPrompt = finalSdPromptGenerator(
    age,
    gender,
    userMessage,
    prompt
  );
  const finalSdNegativePrompt = sdNegativePromptGenerator();

  console.log(`Generating ${desc} with prompt: ${finalSdPrompt}`, {
    finalSdNegativePrompt,
    finalSdPrompt,
  });

  // Test response
  // await Promise.resolve(new Promise((resolve) => setTimeout(resolve, 300)));
  // const response = Txt2ImgSampleResponse;
  const response: {
    images: string[];
    parameters: Record<string, any>;
    info: string;
  } = await axios
    .post(`${SD_API_URL}/sdapi/v1/txt2img`, {
      prompt: finalSdPrompt,
      negative_prompt: sdNegativePromptGenerator(),
      steps: STEPS,
    })
    .then((res) => res.data);

  const generatedRawImages = response.images;
  const generatedImage = {
    desc,
    imageString: generatedRawImages[0],
    // imageString: base64ToImgURL(generatedRawImages[0]),
  };
  return generatedImage;
}
