"use client";
import React, { useState, useCallback } from "react";

import {
  useUpload,
  useHandleStreamResponse,
} from "../utilities/runtime-helpers";

function MainComponent() {
  const [textInput, setTextInput] = useState("");
  const [response, setResponse] = useState("");
  const [streamingMessage, setStreamingMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [translatedResponse, setTranslatedResponse] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("en");
  const [upload, { loading }] = useUpload();
  const [generatedImage, setGeneratedImage] = useState("");
  const [imageLoading, setImageLoading] = useState(false);
  const [thinkingMode, setThinkingMode] = useState(false);
  const [deepThinkingResponse, setDeepThinkingResponse] = useState("");
  const [isRecording, setIsRecording] = useState(false);

  const openSocialMedia = (platform) => {
    const urls = {
      instagram: "https://www.instagram.com",
      youtube: "https://www.youtube.com",
      twitter: "https://twitter.com",
      facebook: "https://www.facebook.com",
      linkedin: "https://www.linkedin.com",
      tiktok: "https://www.tiktok.com",
      pinterest: "https://www.pinterest.com",
      snapchat: "https://www.snapchat.com",
      reddit: "https://www.reddit.com",
      whatsapp: "https://web.whatsapp.com",
      google: "https://www.google.com",
      amazon: "https://www.amazon.com",
      netflix: "https://www.netflix.com",
      spotify: "https://www.spotify.com",
      github: "https://www.github.com",
    };
    window.open(urls[platform], "_blank");
  };

  const handleFinish = useCallback(
    async (message) => {
      setMessages((prev) => [...prev, { role: "assistant", content: message }]);
      if (thinkingMode) {
        setDeepThinkingResponse(message);
      } else {
        setResponse(message);
      }
      setStreamingMessage("");
      if (selectedLanguage !== "en" && !thinkingMode) {
        const translated = await fetch(
          "/integrations/google-translate/language/translate/v2",
          {
            method: "POST",
            body: new URLSearchParams({
              q: message,
              target: selectedLanguage,
            }),
          }
        ).then((r) => r.json());
        setTranslatedResponse(translated.data.translations[0].translatedText);
      }
    },
    [selectedLanguage, thinkingMode]
  );

  const handleStreamResponse = useHandleStreamResponse({
    onChunk: setStreamingMessage,
    onFinish: handleFinish,
  });

  const generateImage = async (prompt) => {
    setImageLoading(true);
    setGeneratedImage("");
    try {
      const response = await fetch(
        `/integrations/dall-e-3/?prompt=${encodeURIComponent(prompt)}`,
        {
          method: "GET",
        }
      );
      const data = await response.json();
      if (data.data && data.data[0]) {
        setGeneratedImage(data.data[0]);
      }
    } catch (error) {
      console.error("Error generating image:", error);
    } finally {
      setImageLoading(false);
    }
  };

  const handleTextSubmit = async (e) => {
    e.preventDefault();
    if (!textInput.trim()) return;
    const input = textInput.toLowerCase().trim();

    if (
      input.includes("generate image") ||
      input.includes("create image") ||
      input.includes("draw") ||
      input.includes("make image")
    ) {
      const prompt = textInput
        .replace(/generate image|create image|draw|make image/gi, "")
        .trim();
      if (prompt) {
        await generateImage(prompt);
      }
      setTextInput("");
      return;
    }

    const websites = [
      "youtube",
      "facebook",
      "instagram",
      "twitter",
      "linkedin",
      "tiktok",
      "pinterest",
      "snapchat",
      "reddit",
      "whatsapp",
      "google",
      "amazon",
      "netflix