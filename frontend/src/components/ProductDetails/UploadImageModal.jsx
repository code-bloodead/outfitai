import React, { useState } from "react";
import CircularProgress from "@mui/material/CircularProgress";
import axios from "axios";

export default function UploadImageModal({ closeModal, tryOutfit, pid }) {
  const [image, setImage] = useState(null);
  const uploadImg = async (e) => {
    const file = e.target.files[0];
    setImage(file);
    const formData = new FormData();
    formData.append("image", file);
    formData.append("productId", pid);
    try {
      const config = {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      };
      const { data } = await axios.post(
        "/api/v1/personalizedImage",
        formData,
        config
      );
      tryOutfit(data.image.image.url);
      closeModal();
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-opacity-50 bg-black">
      <div className="p-7 ml-4 mr-4 mt-4 bg-white shadow-md border-t-4 border-[#FE633D] rounded z-50 overflow-y-auto">
        <div class="flex items-center justify-center w-full">
          {image === null ? (
            <label
              for="dropzone-file"
              class="flex flex-col p-20 items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 "
            >
              <div class="flex flex-col items-center justify-center pt-5 pb-6">
                <svg
                  class="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 20 16"
                >
                  <path
                    stroke="currentColor"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
                  />
                </svg>
                <p class="mb-2 text-sm text-gray-500 dark:text-gray-400">
                  <span class="font-semibold">Click to upload</span> or drag and
                  drop
                </p>
                <p class="text-xs text-gray-500 dark:text-gray-400">
                  SVG, PNG, JPG or GIF (MAX. 800x400px)
                </p>
              </div>
              <input
                id="dropzone-file"
                type="file"
                class="hidden"
                onChange={uploadImg}
              />
            </label>
          ) : (
            <div>
              <div className="w-full flex content-center justify-center text-[#FE633D] p-3 font-bold text-2xl">
                Uploading
              </div>
              <div className="w-full flex content-center justify-center">
                <CircularProgress color="inherit" />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
