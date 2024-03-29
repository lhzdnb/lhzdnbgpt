"use client";

import React, { useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { generateChatResponse } from "@/utils/action";
import toast from "react-hot-toast";
import { RiOpenaiLine } from "react-icons/ri";
import getUserProfile from "@/utils/getUserProfile";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import MarkdownWithMath from "@/components/MarkdownWithMath";
import ChatBlankPage from "@/components/ChatBlankPage";

function Chat() {
  const [text, setText] = useState("");
  const [messages, setMessages] = useState([]);
  const [userImgUrl, setUserImgUrl] = useState("");
  const { mutate, isPending } = useMutation({
    mutationFn: (query) => generateChatResponse([...messages, query]),
    onSuccess: (data) => {
      if (!data) {
        toast.error("Something went wrong. Try again later");
        return;
      }
      setMessages((prev) => [...prev, data]);
    },
    onError: (error) => {
      toast.error("Something went wrong...");
    },
  });

  useEffect(() => {
    const fetchUserProfile = async () => {
      const imageUrl = await getUserProfile();
      setUserImgUrl(imageUrl);
    };

    fetchUserProfile();
  }, []);

  function handleSubmit(e) {
    e.preventDefault();
    const query = { role: "user", content: text };
    mutate(query);
    setMessages((prevState) => [...prevState, query]);
    setText("");
  }

  const userImg = (
    <div className="w-10 h-10">
      <img src={userImgUrl} alt="User" className="w-10 h-10 rounded-full" />
    </div>
  );

  return (
    <div className="min-h-[calc(100vh-6rem)] grid grid-rows-[1fr_auto] px-20">
      <div>
        {messages.length === 0 && <ChatBlankPage />}
        {messages.map(({ role, content }, index) => {
          const avatar =
            role === "user" ? userImg : <RiOpenaiLine className="w-10 h-10" />;
          const background = role === "user" ? "bg-base-300" : "bg-base-200";
          return (
            <div
              key={index}
              className={`${background} flex py-6 mx-8 px-8 text-l leading-loose border-b border-base-300`}
            >
              <span className="mr-4">{avatar}</span>
              {role === "user" ? (
                <p className="">{content}</p>
              ) : (
                <p>
                  <MarkdownWithMath content={content} />
                </p>
              )}
            </div>
          );
        })}
        {isPending && (
          <div className="flex justify-center items-center mt-4">
            <span className="loading loading-spinner text-primary"></span>
          </div>
        )}
      </div>
      <form onSubmit={handleSubmit} className="max-w-6xl pt-12 px-8">
        <div className="join w-full">
          <input
            type="text"
            placeholder="Message lhzdnbGPT"
            className="input input-bordered join-item w-full focus:ring-gray-200 focus:ring-2 focus:ring-inset focus:outline-none"
            value={text}
            required
            onChange={(e) => setText(e.target.value)}
          />
          <button
            className="btn btn-primary join-item"
            type="submit"
            disabled={isPending}
          >
            {isPending && (
              <span className="loading loading-spinner text-primary"></span>
            )}
            {isPending ? "Generating Response..." : "Ask Question"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default Chat;
