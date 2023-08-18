import React, { useState } from "react";
import ChatBody from "./ChatBody";
import ChatInput from "./ChatInput";
import axios from "axios";

const Chatbot = () => {
  const [loading, setLoading] = useState(false);
  const [chat, setChat] = useState([]);
  const [imagesObj, setImagesObj] = useState([]);
  const sendMessage = async (message) => {
    await Promise.resolve(setChat((prev) => [...prev, message]));
    const config = {
      headers: {
        "Content-Type": "application/json",
      },
    };
    var dataToSend = JSON.stringify({
      message: message.message,
    });
    setLoading(true);
    const { data } = await axios.post(
      "/api/v1/generator/respond",
      dataToSend,
      config
    );
    setLoading(false);
    if (data.success) {
      setChat((prev) => [...prev, { sender: "ai", message: data.message }]);
      if (data.images.length > 0) {
        setImagesObj(data.images);
      }
    }
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
        <ChatBody chat={chat} imagesObj={imagesObj} />
      </div>

      {/* Input */}
      <div className="w-full max-w-4xl min-w-[20rem] self-center px-4">
        <ChatInput sendMessage={sendMessage} loading={loading} />
      </div>
    </div>
  );
};

export default Chatbot;
