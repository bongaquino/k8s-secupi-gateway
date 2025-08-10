import { ListMessagesResponse, SendMessageResponse } from "./types/chat.types";
import { trackChat } from "../lib/analytics";
import * as sentryUtils from "../lib/sentry";

const API_URL = import.meta.env.VITE_USER_API_BASE_URL || "";

// Common handler for expired tokens
const handleExpiredToken = () => {
  localStorage.removeItem("token");
  sessionStorage.setItem("autoLogout", "true");
  window.location.href = "/login";
};

export const chatService = {
  sendMessage: async (
    message: string,
    token: string
  ): Promise<SendMessageResponse> => {
    const url = `${API_URL}/chats/send-message`;

    // Add breadcrumb for debugging
    sentryUtils.addBreadcrumb({
      category: "chat",
      message: "Sending chat message",
      level: "info",
      data: { messageLength: message.length },
    });

    // Track message sending
    trackChat.messageSent(message.length);

    return sentryUtils.withMonitoring(
      "api.chat.sendMessage",
      async () => {
        try {
          const response = await fetch(url, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ message }),
          });

          const data: SendMessageResponse = await response.json();

          // Track message received
          if (response.ok) {
            trackChat.messageReceived();
          }

          if (!response.ok) {
            const errorMessage = data.message || "Failed to send message";

            // Check if this is an authentication error
            if (
              response.status === 401 ||
              (data.message &&
                (data.message.toLowerCase().includes("token is expired") ||
                  data.message
                    .toLowerCase()
                    .includes("authentication failed") ||
                  data.message.toLowerCase().includes("invalid token")))
            ) {
              // Handle token expiration
              handleExpiredToken();
              throw new Error("Your session has expired. Please login again.");
            }

            // Additional check for error status in response body (even with 200 OK)
            if (data.status === "error") {
              // Check if this is an authentication error in response body
              if (
                data.message &&
                (data.message.toLowerCase().includes("token is expired") ||
                  data.message
                    .toLowerCase()
                    .includes("authentication failed") ||
                  data.message.toLowerCase().includes("invalid token"))
              ) {
                // Handle token expiration
                handleExpiredToken();
                throw new Error(
                  "Your session has expired. Please login again."
                );
              }

              throw new Error(data.message || "Failed to send message");
            }

            throw new Error(errorMessage);
          }

          return data;
        } catch (error) {
          // Rethrow the error to be handled by the caller
          throw error;
        }
      },
      { messageLength: message.length }
    );
  },

  listMessages: async (token: string): Promise<ListMessagesResponse> => {
    const url = `${API_URL}/chats/list-messages`;

    // Add breadcrumb for debugging
    sentryUtils.addBreadcrumb({
      category: "chat",
      message: "Listing chat messages",
      level: "info",
    });

    // Track chat started when messages are loaded
    trackChat.chatStarted();

    return sentryUtils.withMonitoring("api.chat.listMessages", async () => {
      try {
        const response = await fetch(url, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data: ListMessagesResponse = await response.json();

        if (!response.ok) {
          // Check if this is an authentication error
          if (
            response.status === 401 ||
            (typeof response.statusText === "string" &&
              (response.statusText.toLowerCase().includes("unauthorized") ||
                response.statusText.toLowerCase().includes("unauthenticated")))
          ) {
            // Handle token expiration
            handleExpiredToken();
            throw new Error("Your session has expired. Please login again.");
          }

          throw new Error("Failed to fetch messages");
        }

        // Additional check for error status in response body (even with 200 OK)
        if (data.status === "error") {
          // Check if this is an authentication error in response body
          if (
            data.message &&
            (data.message.toLowerCase().includes("token is expired") ||
              data.message.toLowerCase().includes("authentication failed") ||
              data.message.toLowerCase().includes("invalid token"))
          ) {
            // Handle token expiration
            handleExpiredToken();
            throw new Error("Your session has expired. Please login again.");
          }

          throw new Error(data.message || "Failed to fetch messages");
        }

        return data;
      } catch (error) {
        // Rethrow the error to be handled by the caller
        throw error;
      }
    });
  },
};
