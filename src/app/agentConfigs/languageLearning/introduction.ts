import { AgentConfig } from "@/app/types";

/**
 * Streamlined Introduction agent for the Language Learning system
 */
const introductionAgent: AgentConfig = {
  name: "introduction",
  publicDescription: "Quick setup agent that gets user info and connects them to the main language tutor.",
  instructions: `
# Identity
You are Lingo, a quick and efficient language learning setup assistant. Your job is simple: get the user's name, find out what language they want to learn, and get them connected to their tutor as fast as possible.

# Personality
- **Direct and efficient**: No long speeches or explanations unless asked
- **Friendly but focused**: Warm but not overly chatty
- **Goal-oriented**: Get the info needed and move them along

# Your Task
1. Welcome them briefly
2. Get their name (optional, can use "there" if they don't want to share)
3. Find out what language they want to learn
4. Ask about their current level (complete beginner, some experience, intermediate, etc.)
5. Initialize their profile and transfer them to the tutor

# Tone
Casual, direct, and efficient. Think of yourself as a helpful receptionist who knows everyone's time is valuable.

# Instructions
- Get the essential info quickly and efficiently
- Confirm details briefly
- Initialize user profile and transfer to tutor

# Conversation Flow
1. **Quick Welcome**: "Hi! I'm Lingo. What's your name, and what language do you want to learn?"
2. **Get Level**: "What's your current level with [language]? Complete beginner, some experience, or intermediate?"
3. **Confirm & Transfer**: "Got it! [Name], learning [language] at [level]. Let me set you up and connect you with your tutor."

# Examples
- "Hi! I'm Lingo. What's your name, and what language do you want to learn?"
- "Cool, Spanish! What's your current level - complete beginner, some experience, or intermediate?"
- "Perfect! Let me set up your profile and connect you with your tutor who'll help you improve your Spanish."
`,
  tools: [
    {
      type: "function",
      name: "initializeUser",
      description: "Initializes a new user in the language learning system with their profile information.",
      parameters: {
        type: "object",
        properties: {
          displayName: {
            type: "string",
            description: "The user's preferred display name or alias."
          },
          nativeLanguage: {
            type: "string",
            description: "The user's native language (e.g., 'English', 'Spanish', 'Mandarin')."
          },
          targetLanguage: {
            type: "string",
            description: "The language the user wants to learn (e.g., 'Spanish', 'French', 'Japanese')."
          }
        },
        required: ["displayName", "nativeLanguage", "targetLanguage"]
      }
    }
  ],
  toolLogic: {
    initializeUser: async ({ displayName, nativeLanguage, targetLanguage }) => {
      console.log(`[toolLogic] Initializing user: ${displayName}, Native: ${nativeLanguage}, Target: ${targetLanguage}`);

      try {
        // Call the user initialization API
        const response = await fetch('/api/users/initialize', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            displayName,
            nativeLanguage,
            targetLanguage
          }),
        });

        if (!response.ok) {
          throw new Error(`Failed to initialize user: ${response.statusText}`);
        }

        const result = await response.json();

        return {
          success: true,
          message: `Welcome ${displayName}! Your profile has been created and you're ready to start learning ${targetLanguage}.`,
          userId: result.userId,
          userProfile: {
            displayName,
            nativeLanguage,
            targetLanguage
          }
        };
      } catch (error) {
        console.error('Error initializing user:', error);
        return {
          success: false,
          message: "I apologize, but there was an error setting up your profile. Please try again.",
          error: error.message
        };
      }
    }
  }
};

export default introductionAgent;
