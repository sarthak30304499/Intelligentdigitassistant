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
      "netflix",
      "spotify",
      "github",
    ];

    if (websites.includes(input)) {
      openSocialMedia(input);
      setTextInput("");
      return;
    }

    const predefinedResponses = {
      "who are you":
        "I am IDA (Intelligent Digital Assistant), created by Sarthak palgotra. My purpose is to assist you with various tasks, manage data in cloud services, provide responses to your queries, and make your digital interactions more efficient and enjoyable.",
      "who created you":
        "I am IDA (Intelligent Digital Assistant), created by Sarthak palgotra. My purpose is to assist you with various tasks, manage data in cloud services, provide responses to your queries, and make your digital interactions more efficient and enjoyable.",
    };

    if (predefinedResponses[input]) {
      setResponse(predefinedResponses[input]);
      setTextInput("");
      return;
    }

    setTranslatedResponse("");
    setDeepThinkingResponse("");
    const userMessage = { role: "user", content: textInput };

    if (thinkingMode) {
      const response = await fetch("/integrations/openai-o3/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          reasoning: true,
          stream: true,
        }),
      });
      handleStreamResponse(response);
    } else {
      const response = await fetch("/integrations/chat-gpt/conversationgpt4", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          stream: true,
        }),
      });
      handleStreamResponse(response);
    }
    setTextInput("");
  };

  const playResponse = async () => {
    const textToSpeak = translatedResponse || deepThinkingResponse || response;
    const audio = await fetch(
      `/integrations/text-to-speech/speech?text=${encodeURIComponent(
        textToSpeak
      )}`
    );
    const blob = await audio.blob();
    const url = URL.createObjectURL(blob);
    const audioElement = new Audio(url);
    audioElement.play();
  };

  const startRecording = async () => {
    setIsRecording(true);
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mediaRecorder = new MediaRecorder(stream);
    const chunks = [];

    mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
    mediaRecorder.onstop = async () => {
      const blob = new Blob(chunks);
      const { url } = await upload({ file: blob });
      const response = await fetch("/integrations/transcribe-audio-2/listen", {
        method: "POST",
        body: blob,
      }).then((r) => r.json());
      setTextInput(response.results.channels[0].alternatives[0].transcript);
    };

    mediaRecorder.start();
    setTimeout(() => {
      mediaRecorder.stop();
      setIsRecording(false);
      stream.getTracks().forEach((track) => track.stop());
    }, 5000);
  };

  return (
    <div className="min-h-screen bg-[#121212]">
      <div className="max-w-4xl mx-auto bg-[#1E1E1E] rounded-2xl shadow-lg p-8">
        <div className="flex items-center justify-between mb-4">
          <div className="text-white font-roboto">
            IDA - Intelligent Digital Assistant
          </div>
          <a
            href="https://www.linkedin.com/in/sarthakpalgotra/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white hover:text-gray-300 font-roboto"
          >
            Sarthak palgotra
          </a>
        </div>
        <div className="flex items-center justify-center mb-6">
          <img
            src="https://ucarecdn.com/7856e229-e2b0-4c8b-823d-98400c6e9e38/-/format/auto/"
            alt="IDA Logo"
            className="w-24 h-24 object-contain"
          />
        </div>
        <div className="grid grid-cols-1 gap-8">
          <div className="flex flex-col space-y-6">
            <div className="flex gap-4 mb-4">
              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="bg-[#2A2A2A] text-white p-2 rounded-lg"
              >
                <option value="af">Afrikaans</option>
                <option value="sq">Albanian</option>
                <option value="am">Amharic</option>
                <option value="ar">Arabic</option>
                <option value="hy">Armenian</option>
                <option value="az">Azerbaijani</option>
                <option value="eu">Basque</option>
                <option value="be">Belarusian</option>
                <option value="bn">Bengali</option>
                <option value="bs">Bosnian</option>
                <option value="bg">Bulgarian</option>
                <option value="ca">Catalan</option>
                <option value="ceb">Cebuano</option>
                <option value="zh">Chinese</option>
                <option value="co">Corsican</option>
                <option value="hr">Croatian</option>
                <option value="cs">Czech</option>
                <option value="da">Danish</option>
                <option value="nl">Dutch</option>
                <option value="en">English</option>
                <option value="eo">Esperanto</option>
                <option value="et">Estonian</option>
                <option value="fi">Finnish</option>
                <option value="fr">French</option>
                <option value="fy">Frisian</option>
                <option value="gl">Galician</option>
                <option value="ka">Georgian</option>
                <option value="de">German</option>
                <option value="el">Greek</option>
                <option value="gu">Gujarati</option>
                <option value="ht">Haitian Creole</option>
                <option value="ha">Hausa</option>
                <option value="haw">Hawaiian</option>
                <option value="he">Hebrew</option>
                <option value="hi">Hindi</option>
                <option value="hmn">Hmong</option>
                <option value="hu">Hungarian</option>
                <option value="is">Icelandic</option>
                <option value="ig">Igbo</option>
                <option value="id">Indonesian</option>
                <option value="ga">Irish</option>
                <option value="it">Italian</option>
                <option value="ja">Japanese</option>
                <option value="jv">Javanese</option>
                <option value="kn">Kannada</option>
                <option value="kk">Kazakh</option>
                <option value="km">Khmer</option>
                <option value="ko">Korean</option>
                <option value="ku">Kurdish</option>
                <option value="ky">Kyrgyz</option>
                <option value="lo">Lao</option>
                <option value="la">Latin</option>
                <option value="lv">Latvian</option>
                <option value="lt">Lithuanian</option>
                <option value="lb">Luxembourgish</option>
                <option value="mk">Macedonian</option>
                <option value="mg">Malagasy</option>
                <option value="ms">Malay</option>
                <option value="ml">Malayalam</option>
                <option value="mt">Maltese</option>
                <option value="mi">Maori</option>
                <option value="mr">Marathi</option>
                <option value="mn">Mongolian</option>
                <option value="my">Myanmar</option>
                <option value="ne">Nepali</option>
                <option value="no">Norwegian</option>
                <option value="ny">Nyanja</option>
                <option value="or">Odia</option>
                <option value="ps">Pashto</option>
                <option value="fa">Persian</option>
                <option value="pl">Polish</option>
                <option value="pt">Portuguese</option>
                <option value="pa">Punjabi</option>
                <option value="ro">Romanian</option>
                <option value="ru">Russian</option>
                <option value="sm">Samoan</option>
                <option value="gd">Scots Gaelic</option>
                <option value="sr">Serbian</option>
                <option value="st">Sesotho</option>
                <option value="sn">Shona</option>
                <option value="sd">Sindhi</option>
                <option value="si">Sinhala</option>
                <option value="sk">Slovak</option>
                <option value="sl">Slovenian</option>
                <option value="so">Somali</option>
                <option value="es">Spanish</option>
                <option value="su">Sundanese</option>
                <option value="sw">Swahili</option>
                <option value="sv">Swedish</option>
                <option value="tg">Tajik</option>
                <option value="ta">Tamil</option>
                <option value="te">Telugu</option>
                <option value="th">Thai</option>
                <option value="tr">Turkish</option>
                <option value="uk">Ukrainian</option>
                <option value="ur">Urdu</option>
                <option value="uz">Uzbek</option>
                <option value="vi">Vietnamese</option>
                <option value="cy">Welsh</option>
                <option value="xh">Xhosa</option>
                <option value="yi">Yiddish</option>
                <option value="yo">Yoruba</option>
                <option value="zu">Zulu</option>
              </select>

              <button
                onClick={() => setThinkingMode(!thinkingMode)}
                className={`px-4 py-2 rounded-lg font-roboto transition-all duration-300 ${
                  thinkingMode
                    ? "bg-purple-500 hover:bg-purple-600 text-white"
                    : "bg-[#2A2A2A] hover:bg-[#3A3A3A] text-white"
                }`}
              >
                <i className="fas fa-brain mr-2"></i>
                Think Deeper
              </button>
            </div>

            <form onSubmit={handleTextSubmit} className="flex gap-2">
              <input
                type="text"
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder={
                  thinkingMode
                    ? "Ask me to think deeply about something..."
                    : "Type your message or 'generate image [description]'..."
                }
                name="message"
                className="flex-1 bg-[#2A2A2A] text-white p-4 rounded-2xl font-roboto focus:outline-none focus:ring-2 focus:ring-blue-500/50 border border-[#3A3A3A] backdrop-blur-sm"
              />
              <button
                type="submit"
                className="bg-gradient-to-r from-blue-500/80 to-purple-500/80 hover:from-blue-600/80 hover:to-purple-600/80 text-white p-4 rounded-2xl backdrop-blur-sm border border-[#3A3A3A] transform hover:scale-105 transition-all duration-300 flex items-center justify-center w-14 h-14"
                disabled={!textInput.trim()}
              >
                <i className="fas fa-paper-plane text-lg"></i>
              </button>
            </form>

            {(generatedImage || imageLoading) && (
              <div className="bg-[#2A2A2A] backdrop-blur-sm border border-[#3A3A3A] p-6 rounded-2xl">
                <h3 className="text-white font-roboto mb-4 flex items-center">
                  <i className="fas fa-image mr-2"></i>
                  Generated Image
                </h3>
                {imageLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
                    <span className="text-white ml-3">Generating image...</span>
                  </div>
                ) : generatedImage ? (
                  <img
                    src={generatedImage}
                    alt="Generated image"
                    className="w-full max-w-md mx-auto rounded-lg"
                  />
                ) : null}
              </div>
            )}

            <div className="text-center">
              {(response || streamingMessage || deepThinkingResponse) && (
                <div className="bg-[#2A2A2A] backdrop-blur-sm border border-[#3A3A3A] p-6 rounded-2xl">
                  {thinkingMode && (
                    <div className="flex items-center mb-3">
                      <i className="fas fa-brain text-purple-400 mr-2"></i>
                      <span className="text-purple-400 font-roboto text-sm">
                        Deep Thinking Mode
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between items-start">
                    <div
                      className="text-white/90 font-roboto prose prose-invert max-w-none"
                      dangerouslySetInnerHTML={{
                        __html:
                          (
                            translatedResponse ||
                            deepThinkingResponse ||
                            response ||
                            streamingMessage
                          ).replace(
                            /(https?:\/\/[^\s]+)/g,
                            '<a href="$1" target="_blank" rel="noopener noreferrer" class="text-blue-400 hover:text-blue-300 underline">$1</a>'
                          ) +
                          (streamingMessage
                            ? '<span class="inline-block w-2 h-4 ml-1 bg-blue-400 animate-typing"></span>'
                            : ""),
                      }}
                    ></div>
                    <button
                      onClick={playResponse}
                      className="ml-4 text-white hover:text-blue-400"
                      title="Play response"
                    >
                      <i className="fas fa-volume-up text-xl"></i>
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {[
                "instagram",
                "youtube",
                "twitter",
                "facebook",
                "linkedin",
                "tiktok",
                "pinterest",
                "snapchat",
                "reddit",
                "whatsapp",
              ].map((platform) => (
                <button
                  key={platform}
                  onClick={() => openSocialMedia(platform)}
                  className="bg-[#2A2A2A] hover:bg-[#3A3A3A] text-white p-2 rounded-lg font-roboto shadow-md transition-all duration-300 hover:scale-105"
                >
                  <i className={`fab fa-${platform} text-lg`}></i>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MainComponent;