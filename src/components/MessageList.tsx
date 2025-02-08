import { cn } from "@/lib/utils";
import { Message } from "ai/react";
import { Loader2, MessageCircleWarningIcon, Target } from "lucide-react";
import React from "react";
import { Icons } from "./Icons";
import { format, formatRelative, subDays } from "date-fns";
import Markdown from "markdown-to-jsx";
import { Copy, CheckCheck, CornerUpRight, ThumbsUp, ThumbsDown, Share2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import axios from "axios";
// import Markdown from 'react-markdown'

type Props = {
  messages: Message[];
  isLoading: boolean;
  isShared?: boolean; // Add this new prop
};

const MessageList = ({ messages, isLoading, isShared = true }: Props) => {
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const [isSharing, setIsSharing] = useState(false);

  const handleCopy = async (content: string, messageId: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedMessageId(messageId);
      toast.success("Message copied to clipboard");

      // Reset copy state after 2 seconds
      setTimeout(() => {
        setCopiedMessageId(null);
      }, 2000);
    } catch (error) {
      toast.error("Failed to copy message");
    }
  };

  const handleShare = async () => {
    try {
      setIsSharing(true);
      const response = await axios.post('/api/chat/share', {
        messages,
        chatId: window.location.pathname.split('/').pop(),
      });

      if (navigator.share) {
        await navigator.share({
          title: 'Shared Chat',
          text: 'Check out this chat!',
          url: response.data.shareUrl
        });
      } else {
        await navigator.clipboard.writeText(response.data.shareUrl);
        toast.success('Share link copied to clipboard! Link expires in 7 days.');
      }
    } catch (error) {
      console.error('Share failed:', error);
      toast.error('Failed to share chat');
    } finally {
      setIsSharing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Processing your request...
          </p>
        </div>
      </div>
    );
  }

  if (!messages.length) {
    return (
      <div className="mt-16 flex flex-col text-center items-center gap-3">
        <div className="p-4 rounded-full bg-blue-500/10">
          <MessageCircleWarningIcon className="h-8 w-8 text-blue-500" />
        </div>
        <h3 className="font-semibold text-xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Start Your Conversation
        </h3>
        <p className="text-zinc-500 dark:text-zinc-400 max-w-sm">
          Ask questions about your document and get instant answers.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 px-4 py-3 max-w-3xl mx-auto">
        {messages.length > 0 && isShared && (
        <div className="flex justify-end mb-4">
          <button
            onClick={handleShare}
            disabled={isSharing}
            className="flex items-center gap-2 px-3 py-2 text-sm 
              bg-blue-500 text-white rounded-md hover:bg-blue-600 
              transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSharing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Share2 className="h-4 w-4" />
            )}
            Share Chat
          </button>
        </div>
      )}
      {messages
        .sort((a, b) => +a.id - +b.id)
        .map((message, index) => (
          <div
            key={message.id}
            className={cn("group flex items-start gap-4 relative", {
              "animate-fadeIn": index === messages.length - 1,
            })}
          >
            <div
              className={cn(
                "flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-md shadow-sm",
                {
                  "bg-blue-500 text-white": message.role === "user",
                  "bg-slate-100 dark:bg-slate-800": message.role === "system",
                }
              )}
            >
              {message.role === "user" ? (
                <Icons.user className="h-5 w-5" />
              ) : (
                <Icons.logo className="h-5 w-5" />
              )}
            </div>

            <div className={cn("flex-1 space-y-2 overflow-hidden px-1")}>
              <div
                className={cn("prose dark:prose-invert max-w-none", {
                  "text-gray-900 dark:text-gray-100": message.role === "system",
                  "text-blue-600 dark:text-blue-400": message.role === "user",
                })}
              >
                <Markdown
                  options={{
                    overrides: {
                      pre: {
                        props: {
                          className:
                            "bg-slate-100 dark:bg-slate-800 rounded-lg p-4 my-2 overflow-x-auto",
                        },
                      },
                      code: {
                        props: {
                          className:
                            "bg-slate-100 dark:bg-slate-800 rounded px-1 py-0.5",
                        },
                      },
                    },
                  }}
                >
                  {message.content}
                </Markdown>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                <span>
                  {format(new Date(message.createdAt || new Date()), "h:mm a")}
                </span>
                {isShared && (<div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleCopy(message.content, message.id)}
                    className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors"
                    title={
                      copiedMessageId === message.id
                        ? "Copied!"
                        : "Copy message"
                    }
                  >
                    {copiedMessageId === message.id ? (
                      <CheckCheck className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </button>
                  {message.role === "system" && (
                    <>
                      <button
                        className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors"
                        title="Regenerate response"
                      >
                        <CornerUpRight className="h-4 w-4" />
                      </button>
                      <div className="h-4 w-px bg-gray-200 dark:bg-gray-700" />
                      <div className="flex gap-1">
                        <button
                          className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors"
                          title="Good response"
                        >
                          <ThumbsUp className="h-4 w-4" />
                        </button>
                        <button
                          className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors"
                          title="Bad response"
                        >
                          <ThumbsDown className="h-4 w-4" />
                        </button>
                      </div>
                    </>
                  )}
                </div>)}
              </div>
            </div>
          </div>
        ))}
    </div>
  );
};

export default MessageList;
