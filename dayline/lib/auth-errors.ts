/** Friendly text for Auth.js error codes (arrive as ?error= on the sign-in page or the error page). */
export const AUTH_ERROR_MESSAGES: Record<string, string> = {
  OAuthAccountNotLinked:
    "This email is already registered in Dayline through the other sign-in provider (or this provider was disconnected in Settings). Sign in with the other provider, then open Settings → Connected calendars and click Connect to link this one.",
  AccessDenied: "Sign-in was cancelled or access was denied. Dayline needs calendar access to build your plan.",
  Configuration: "Sign-in isn't configured correctly on the server. If you're the owner, check the OAuth environment variables and the server logs.",
  OAuthCallbackError: "The sign-in provider returned an error. Please try again.",
  OAuthSignin: "Couldn't start sign-in with that provider. Please try again.",
  Callback: "Something went wrong finishing sign-in. Please try again.",
  Verification: "That sign-in link is no longer valid. Please try again.",
};

export const authErrorMessage = (code?: string | null) =>
  code ? AUTH_ERROR_MESSAGES[code] ?? "Something went wrong during sign-in. Please try again." : undefined;
