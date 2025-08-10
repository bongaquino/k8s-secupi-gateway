import { track as vercelTrack } from "@vercel/analytics";
import { track as vercelServerTrack } from "@vercel/analytics/server";

// Auth events
export const trackAuth = {
  login: (method: string = "email") => {
    vercelTrack("Auth:Login", { method });
  },
  register: (method: string = "email") => {
    vercelTrack("Auth:Register", { method });
  },
  logout: () => {
    vercelTrack("Auth:Logout");
  },
  passwordReset: (stage: "requested" | "completed") => {
    vercelTrack("Auth:PasswordReset", { stage });
  },
  profileView: () => {
    vercelTrack("Auth:ProfileView");
  },
  profileUpdate: () => {
    vercelTrack("Auth:ProfileUpdate");
  },
};

// Chat events
export const trackChat = {
  messageSent: (messageLength: number) => {
    vercelTrack("Chat:MessageSent", { messageLength });
  },
  messageReceived: () => {
    vercelTrack("Chat:MessageReceived");
  },
  chatStarted: () => {
    vercelTrack("Chat:Started");
  },
  chatEnded: (duration: number) => {
    vercelTrack("Chat:Ended", { durationSeconds: duration });
  },
};

// Design events
export const trackDesign = {
  requestStarted: (designType: "interior" | "exterior") => {
    vercelTrack("Design:RequestStarted", { designType });
  },
  requestSubmitted: (designType: "interior" | "exterior") => {
    vercelTrack("Design:RequestSubmitted", { designType });
  },
  resultViewed: (designType: "interior" | "exterior") => {
    vercelTrack("Design:ResultViewed", { designType });
  },
  optionsChanged: (optionName: string) => {
    vercelTrack("Design:OptionsChanged", { optionName });
  },
};

// Server-side tracking (for API routes)
export const trackServer = {
  auth: {
    loginSuccess: (userId: string) => {
      vercelServerTrack("Auth:LoginSuccess", { userId });
    },
    loginFailure: (reason: string) => {
      vercelServerTrack("Auth:LoginFailure", { reason });
    },
    registerSuccess: (userId: string) => {
      vercelServerTrack("Auth:RegisterSuccess", { userId });
    },
  },
  chat: {
    messageSent: (userId: string, messageId: string) => {
      vercelServerTrack("Chat:MessageSent", { userId, messageId });
    },
  },
  design: {
    requestCreated: (userId: string, requestId: string, designType: string) => {
      vercelServerTrack("Design:RequestCreated", {
        userId,
        requestId,
        designType,
      });
    },
    requestCompleted: (requestId: string) => {
      vercelServerTrack("Design:RequestCompleted", { requestId });
    },
  },
};

// Generic event tracking function
export const track = vercelTrack;
