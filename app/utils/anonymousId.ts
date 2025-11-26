import * as SecureStore from "expo-secure-store";

/**
 * Generate a UUID v4 for anonymous user ID
 */
const generateAnonymousId = (): string => {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

/**
 * Get or create anonymous user ID
 * Stores in SecureStore for persistence across app sessions
 */
export const getAnonymousUserId = async (): Promise<string> => {
  try {
    // Try to get existing ID
    let anonymousId = await SecureStore.getItemAsync("anonymous_user_id");
    if (!anonymousId) {
      // Generate new ID if doesn't exist
      anonymousId = generateAnonymousId();
      await SecureStore.setItemAsync("anonymous_user_id", anonymousId);
      console.log("Generated new anonymous ID:", anonymousId);
    }

    return anonymousId;
  } catch (error) {
    console.error("Error managing anonymous ID:", error);
    // Fallback to generating a new ID if storage fails
    return generateAnonymousId();
  }
};
