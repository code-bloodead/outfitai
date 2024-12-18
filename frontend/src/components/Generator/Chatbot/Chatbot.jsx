import React, { useState } from "react";
import ChatBody from "./ChatBody.jsx";
import ChatInput from "./ChatInput.jsx";

import { generateOutfit, getOutfitPrompts } from "../../../apis/genai.ts";
import { addPersonalizedProducts } from "../../../actions/productAction.js";
import { useDispatch, useSelector } from "react-redux";
import { questions } from "../../../utils/constants.js";

const Chatbot = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.user);
  const [loading, setLoading] = useState(false);
  const [index, setIndex] = useState(0);
  const [chat, setChat] = useState([
    {
      sender: "ai",
      message: `Hello ${user.name && user.name.split(" ", 1)}`,
      images: [],
    },
    {
      sender: "ai",
      message:
        "I'm your AI fashion outfit generator. Let's chat about your style, and I'll create a personalized outfit for you🙂",
      images: [],
    },
  ]);

  const getAIResponse = async (newMessage) => {
    const userMessage = newMessage.message;
    setLoading(true);

    var question = `Suggest outfits for a ${localStorage.getItem(
      "age"
    )} year old ${localStorage.getItem(
      "gender"
    )} with following preferences: ${userMessage}`;

    const { descriptions, products, response } =
      (await getOutfitPrompts(question)) || {};

    setChat((prev) => [
      ...prev,
      { sender: "ai", message: response.trim() || "", images: [] },
    ]);

    const generatedOutfits = await Promise.all(
      descriptions.map((prompt, idx) =>
        generateOutfit(
          localStorage.getItem("age"),
          localStorage.getItem("gender"),
          userMessage,
          prompt,
          `Outfit ${idx + 1}`
        )
      ) || []
    );
    const article_ids = products.map((product) => product.meta.article_id);
    console.log(article_ids);
    dispatch(addPersonalizedProducts(article_ids));

    setLoading(false);

    if (generatedOutfits.length) {
      setChat((prev) => [
        ...prev,
        { sender: "ai", message: "", images: generatedOutfits },
      ]);
    }
  };

  const uploadImage = async (url) => {
    setLoading(true);
    dispatch(
      addPersonalizedProducts([
        "0607350001",
        "0479294002",
        "1000000010",
        "0681963001",
      ])
    );
  };

  const sendMessage = async (newMessage) => {
    await Promise.resolve(setChat((prev) => [...prev, newMessage]));

    if (localStorage.getItem("age") !== null && index <= 1) {
      setIndex(index + 1);
    }
    if (index === 1) {
      localStorage.setItem("gender", newMessage.message);
    }
    if (index === 2) {
      localStorage.setItem("age", newMessage.message);
    }
    setLoading(true);

    if (index < 3) {
      setTimeout(async () => {
        var randomIndex = Math.floor(Math.random() * 3);
        var tempMessage = {
          sender: "ai",
          message: questions[index][randomIndex],
          images: [],
        };
        await Promise.resolve(setChat((prev) => [...prev, tempMessage]));
        setIndex(index + 1);
      }, 2500);
    } else {
      getAIResponse(newMessage);
    }
    setLoading(false);
  };

  return (
    <div className="bg-[#1A232E] rounded-md shadow-2xl  h-[87vh] py-6 relative text-white overflow-hidden flex flex-col justify-between align-middle">
      {/* gradients */}
      <div className="gradient-01 z-0 absolute"></div>
      <div className="gradient-02 z-0 absolute bottom-1"></div>

      {/* Header */}
      <div className=" font-bold text-xl text-center mb-3">
        Outfit Generator
      </div>
      {/* Chat Body */}
      <div className="h-[90%] overflow-auto w-full max-w-4xl min-w-[20rem] py-8 self-center px-4">
        <ChatBody chat={chat} />
      </div>

      {/* Input */}
      <div className="w-full max-w-4xl min-w-[20rem] self-center px-4">
        <ChatInput
          sendMessage={sendMessage}
          loading={loading}
          uploadImage={uploadImage}
        />
      </div>
    </div>
  );
};

export default Chatbot;
