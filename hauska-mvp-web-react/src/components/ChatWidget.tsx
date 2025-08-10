import { useState, useEffect, useCallback, useRef } from "react";
import { X, Minimize2, Maximize2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { chatService } from "@/api/chat";
import { useAuth } from "@/lib/contexts/AuthContext";
import { toast } from "sonner";
import { Message as ApiMessage } from "@/api/types/chat.types";
import { Input } from "./ui/input";
import { MarkdownMessage } from "./MarkdownMessage";

interface Message extends ApiMessage {
  timestamp: string;
  status?: "sending" | "sent" | "error";
  tempId?: string;
}

export function ChatWidget() {
  const { isAuthenticated } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [pendingMessages, setPendingMessages] = useState<Set<string>>(
    new Set()
  );
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen && isAuthenticated) {
      loadMessages();
    }
    scrollToBottom();
  }, [isOpen, isAuthenticated]);

  const loadMessages = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await chatService.listMessages(token);

      if (response?.data?.chats) {
        setMessages(
          response.data.chats.map((msg) => ({
            ...msg,
            timestamp: new Date(msg.created_at).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
            status: "sent",
          }))
        );
      }
    } catch (error) {
      console.error("Failed to load messages:", error);
      toast.error("Failed to load messages");
    }
  };

  const updateMessageStatus = useCallback(
    (tempId: string, status: Message["status"]) => {
      setMessages((prevMessages) =>
        prevMessages.map((msg) =>
          msg.tempId === tempId ? { ...msg, status } : msg
        )
      );
    },
    []
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!inputValue.trim() || !token) return;

    const tempId = Date.now().toString();
    const timestamp = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    // Add user message with pending status
    const userMessage: Message = {
      id: tempId,
      tempId,
      query_message: inputValue,
      role: "user",
      created_at: new Date().toISOString(),
      user_id: "current",
      timestamp,
      status: "sending",
    };

    setMessages((prev) => [...prev, userMessage]);
    setPendingMessages((prev) => new Set(prev).add(tempId));
    setInputValue("");
    setIsTyping(true);

    try {
      const response = await chatService.sendMessage(inputValue, token);

      // Update user message status to sent
      updateMessageStatus(tempId, "sent");
      setPendingMessages((prev) => {
        const newSet = new Set(prev);
        newSet.delete(tempId);
        return newSet;
      });

      // Add AI response
      const aiMessage: Message = {
        id: Date.now().toString(), // Generate a unique ID
        query_message: "", // No query message for AI response
        response_message: response.data.response, // Use the response from the data object
        role: "assistant",
        created_at: new Date().toISOString(), // Current timestamp
        user_id: "assistant",
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        status: "sent",
      };

      setIsTyping(false);
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error("Failed to send message:", error);
      updateMessageStatus(tempId, "error");
      setPendingMessages((prev) => {
        const newSet = new Set(prev);
        newSet.delete(tempId);
        return newSet;
      });
      setIsTyping(false);
      toast.error("Failed to send message");
    }
  };

  if (!isOpen) {
    return (
      <button
        id="chat-widget"
        onClick={() => setIsOpen(true)}
        className={cn(
          "fixed bottom-4 right-4 w-14 h-14 sm:w-16 sm:h-16",
          "bg-blue-500 hover:bg-blue-600 transition-all duration-500",
          "flex items-center justify-center shadow-lg cursor-pointer",
          "rounded-full hover:scale-110 z-50"
        )}
      >
        <img
          src="/hauska-white.svg"
          alt="Chat"
          className="w-7 h-7 sm:w-9 sm:h-9"
        />
      </button>
    );
  }

  return (
    <div
      className={cn(
        isFullscreen
          ? "fixed inset-4 md:inset-8 w-auto h-auto"
          : "fixed bottom-4 right-4 w-[92vw] sm:w-[450px] max-h-[85vh] min-h-[96%] md:min-h-[600px]",
        "bg-white dark:bg-card border rounded-lg shadow-xl",
        "flex flex-col z-50",
        "transition-all duration-500 ease-in-out transform",
        isFullscreen ? "scale-100" : "scale-100",
        "animate-in fade-in-0 slide-in-from-bottom-4 duration-500"
      )}
    >
      {/* Header */}
      <div
        className={cn(
          "flex items-center justify-between p-4 border-b",
          isFullscreen && "md:px-6"
        )}
      >
        <div className="flex items-center gap-2">
          <img
            src="/hauska-dark.svg"
            alt="Hauska Design API"
            className="w-9 h-9 dark:hidden"
          />
          <img
            src="/hauska-white.svg"
            alt="Hauska Design API"
            className="w-9 h-9 hidden dark:block"
          />
          <div>
            <h3 className="font-semibold">Hauska Design Assistant</h3>
            <p className="text-xs text-muted-foreground">
              Powered by Perplexity
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-2 hover:bg-muted-foreground/5 rounded-sm transition-colors hidden sm:block"
            title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
          >
            {isFullscreen ? (
              <Minimize2 className="w-4 h-4" />
            ) : (
              <Maximize2 className="w-4 h-4" />
            )}
          </button>
          <button
            onClick={() => {
              setIsFullscreen(false);
              setIsOpen(false);
            }}
            className="p-1 hover:bg-muted-foreground/5 rounded-sm transition-colors"
            title="Minimize"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div
        className={cn("flex-1 overflow-y-auto p-4", isFullscreen && "md:px-6")}
      >
        <div className={cn("space-y-4", isFullscreen && "max-w-4xl mx-auto")}>
          {messages.length === 0 && (
            <div className="flex flex-1 mt-32 flex-col items-center justify-center  text-center space-y-4 text-muted-foreground">
              <div className="w-16 h-16 rounded-full bg-blue-500/10 flex items-center justify-center">
                <img
                  src="/hauska-dark.svg"
                  alt="Hauska"
                  className="w-10 h-10 dark:hidden"
                />
                <img
                  src="/hauska-white.svg"
                  alt="Hauska"
                  className="w-10 h-10 hidden dark:block"
                />
              </div>
              <div className="max-w-[320px]">
                <p className="font-medium mb-1">
                  Welcome to Hauska Design Assistant!
                </p>
                <p className="text-sm">
                  Ask me anything about design transformations.
                </p>
              </div>
            </div>
          )}

          {[...messages]
            .sort(
              (a, b) =>
                new Date(a.created_at).getTime() -
                new Date(b.created_at).getTime()
            )
            .map((message) => {
              const isPending =
                message.tempId && pendingMessages.has(message.tempId);
              const isError = message.status === "error";

              return (
                <div key={message.id || message.tempId}>
                  {message.query_message && (
                    <div className={cn("flex justify-end")}>
                      <div
                        className={cn(
                          " rounded-2xl p-3",
                          isPending
                            ? "bg-blue-500/70"
                            : isError
                            ? "bg-red-500"
                            : "bg-blue-500",
                          "text-white rounded-br-sm",
                          isPending && "animate-pulse"
                        )}
                      >
                        <p>{message.query_message}</p>
                        <span className="text-xs opacity-70 mt-1 block">
                          {message.timestamp}
                          {isPending && " • Sending..."}
                          {isError && " • Failed to send"}
                        </span>
                      </div>
                    </div>
                  )}
                  {message.response_message && (
                    <div className={cn("flex justify-start mt-2")}>
                      <div
                        className={cn(
                          "w-full rounded-2xl p-3 bg-slate-100 dark:bg-slate-600 rounded-bl-sm"
                        )}
                      >
                        <MarkdownMessage content={message.response_message} />
                        <span className="text-xs opacity-70 mt-1 block">
                          {message.timestamp}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

          {isTyping && (
            <div className="flex justify-start">
              <div className="max-w-[80%] rounded-2xl p-3 bg-slate-100 dark:bg-slate-800 rounded-bl-sm">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" />
                  <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce delay-200" />
                  <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce delay-400" />
                </div>
              </div>
            </div>
          )}
        </div>
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <form
        onSubmit={handleSubmit}
        className={cn("border-t p-4", isFullscreen && "md:px-6")}
      >
        <div className={cn("relative", isFullscreen && "max-w-4xl mx-auto")}>
          <Input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Type your message..."
            className="w-full rounded-full pl-4 pr-12 py-2 bg-background border focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={!inputValue.trim()}
            className={cn(
              "absolute right-2 top-1/2 -translate-y-1/2",
              "rounded-full p-1.5 bg-blue-500 text-white",
              "hover:bg-blue-600 transition-colors",
              "disabled:opacity-50 disabled:cursor-not-allowed"
            )}
          >
            <svg
              className="w-4 h-4 rotate-90"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
              />
            </svg>
          </button>
        </div>
      </form>
    </div>
  );
}
