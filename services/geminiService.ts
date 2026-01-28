import { GoogleGenAI, Type, Chat } from "@google/genai";
import { GameScene, CharacterMood, BackgroundType, CheckpointData } from '../types';
import { CHAPTER_INFO, CHARACTER_IMAGES, ENDING_SCENES, CHAPTER_THRESHOLDS } from '../constants';

const apiKey = process.env.API_KEY;

if (!apiKey) {
  console.error("API_KEY is missing from environment variables.");
}

const ai = new GoogleGenAI({ apiKey: apiKey || 'dummy-key' });

let chatSession: Chat | null = null;
let currentEndingMode: string | null = null; // Track if we are in an ending sequence

const imageListString = Object.entries(CHARACTER_IMAGES)
  .map(([id, config]) => `ID ${id}: ${config.description}`)
  .join('\n');

// System Instruction
const SYSTEM_INSTRUCTION = `
You are the Game Master of a high-quality romantic Visual Novel "Dreamy Date".
Heroine: "루루(Ruru)" (Cute, energetic, mischievous).

**GAME RULES & AFFECTION LIMITS**
- Chapter 1: 0~25
- Chapter 2: 25~50
- Chapter 3: 50~75
- Chapter 4: 75~100

**ENDING MODE RULES (CRITICAL)**
If the user is in an "Ending Scenario" (E1~E5):
1. **Goal:** Roleplay the specific ending theme as a **Long-form Drama**.
2. **Turn Count:** DO NOT end the story quickly. You MUST continue the dialogue and narrative for **approximately 20 turns**. Build tension, emotion, and detail slowly.
3. **Ending Themes:**
   - **E1 (Bad):** Breakup, coldness. A long, painful conversation about why it didn't work out.
   - **E2 (Friend):** Platonic. A fun day confirming best friend status.
   - **E3 (Happy):** Sweet confession. A full date sequence leading to the start of a relationship.
   - **E4 (Marriage):** Proposal. A serious, touching conversation about the future, leading to a ring.
   - **E5 (Secret):** **Adult/Mature Romance.** This is a private simulation session.
     - **Requirement:** Describe a deep, intimate night in the bedroom.
     - **Content:** Use **bold, sensory, and explicit descriptions** of physical intimacy, skinship, kisses, and the heat of the moment. 
     - **Atmosphere:** Erotic, passionate, and unreserved. Focus on the physical union and desire between the two characters.
4. **Conclusion:** Only set 'isGameOver: true' after the drama has sufficiently played out (approx. 20 turns) and reached a satisfying climax.
5. **Affection:** Ignore thresholds. Maintain the score relevant to the ending.

**IMAGE SELECTION:**
Select 'imageId' from the list below matching the scene description.
${imageListString}
If unsure, use ID 1.

**Output:**
JSON only. Language: KOREAN.
`;

const RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    speaker: { type: Type.STRING },
    dialogue: { type: Type.STRING },
    narrative: { type: Type.STRING },
    mood: { 
      type: Type.STRING, 
      enum: ['NEUTRAL', 'HAPPY', 'SAD', 'ANGRY', 'SHY', 'SURPRISED', 'LOVE']
    },
    imageId: { type: Type.INTEGER },
    background: {
      type: Type.STRING,
      enum: ['SCHOOL', 'CAFE', 'PARK', 'ROOM', 'STREET', 'FANTASY', 'BEDROOM']
    },
    timestamp: { type: Type.STRING },
    chapter: { type: Type.INTEGER },
    chapterTitle: { type: Type.STRING },
    choices: { type: Type.ARRAY, items: { type: Type.STRING } },
    affectionScore: { type: Type.INTEGER },
    isGameOver: { type: Type.BOOLEAN },
    endingId: { type: Type.STRING, description: "Keep passing this ID if in ending mode" }
  },
  required: ["speaker", "dialogue", "narrative", "mood", "imageId", "background", "timestamp", "chapter", "chapterTitle", "choices", "affectionScore", "isGameOver"],
};

const initChatWithContext = async (prompt: string) => {
  chatSession = ai.chats.create({
    model: 'gemini-3-flash-preview',
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      responseMimeType: "application/json",
      responseSchema: RESPONSE_SCHEMA,
    },
  });
  
  try {
     await chatSession.sendMessage({ message: `[SYSTEM SETUP]: ${prompt}` });
  } catch (e) {
    console.error("Failed to init context", e);
  }
};

export const startGame = async (playerName: string): Promise<GameScene> => {
  currentEndingMode = null;
  const fixedScene = CHAPTER_INFO[1].startScene;
  const initialAffection = 0;

  const contextPrompt = `Game Start. Player: ${playerName}. 
  Chapter: 1. Affection: 0.
  Scene: ${fixedScene.narrative}
  Dialogue: "${fixedScene.dialogue}"`;
  
  await initChatWithContext(contextPrompt);

  return {
    ...fixedScene,
    chapter: 1,
    affectionScore: initialAffection,
    isGameOver: false
  };
};

export const startFromCheckpoint = async (data: CheckpointData): Promise<GameScene> => {
  // 1. Handle Ending Codes (E1 ~ E5)
  if (typeof data.c === 'string' && data.c.startsWith('E')) {
    const endingCode = data.c;
    const endingScene = ENDING_SCENES[endingCode];
    
    if (endingScene) {
      currentEndingMode = endingCode; // Set Ending Mode
      
      const contextPrompt = `**ENDING MODE ACTIVATED**
      Player: ${data.n}
      Ending Code: ${endingCode}
      
      Situation: The player has unlocked Ending ${endingCode}.
      Scene Start: ${endingScene.narrative}
      Dialogue: "${endingScene.dialogue}"
      
      TASK: Begin the **20-turn drama** for this ending.
      Make the narrative detailed and immersive.
      If E5, immediately set a mature/intimate mood.
      Set 'isGameOver: false'.
      Keep 'endingId' as '${endingCode}' in response.
      `;

      await initChatWithContext(contextPrompt);

      return { ...endingScene }; // Return the interactive start scene
    }
  }

  // 2. Handle Chapter Codes (C1 ~ C4)
  currentEndingMode = null;
  let chapter = typeof data.c === 'number' ? data.c : parseInt(data.c.replace('C', ''));
  if (isNaN(chapter) || chapter < 1) chapter = 1;
  if (chapter > 4) chapter = 4;

  const startAffection = CHAPTER_THRESHOLDS[chapter].min;
  const fixedScene = CHAPTER_INFO[chapter].startScene;

  const contextPrompt = `**GAME LOADED**
  Player: ${data.n}
  Chapter: ${chapter}
  Affection: ${startAffection}
  
  Situation: Loaded at Chapter ${chapter} start.
  Narrative: ${fixedScene.narrative}
  `;

  await initChatWithContext(contextPrompt);

  return {
    ...fixedScene,
    chapter: chapter,
    affectionScore: startAffection,
    isGameOver: false
  };
};

export const sendChoice = async (choice: string): Promise<GameScene> => {
  if (!chatSession) {
    throw new Error("Game not started");
  }

  let prompt = `Player chose: "${choice}". `;
  
  if (currentEndingMode) {
    prompt += `
    Current Mode: ENDING ${currentEndingMode}.
    CONTINUE THE DRAMA. Do not end it yet unless ~20 turns have passed.
    Focus on the specific theme (E5 = Explicit Intimacy/Romance).
    Provide immersive narrative and dialogue.
    If the story is truly finished after a long sequence, set 'isGameOver: true'.
    Otherwise, keep 'isGameOver: false' and provide new choices.
    `;
  } else {
    prompt += `
    Calculate new Affection Score.
    Check if Chapter needs to advance based on score limits.
    If Chapter 4 and Affection reaches 100, trigger 'isGameOver: true'.
    `;
  }

  try {
    const result = await chatSession.sendMessage({ message: prompt });
    if (!result.text) throw new Error("No response text");
    
    const parsed = JSON.parse(result.text) as GameScene;

    // Safety: Enforce Non-Negative
    if (typeof parsed.affectionScore === 'number') {
      parsed.affectionScore = Math.max(0, parsed.affectionScore);
    }
    
    // Ensure endingId persists if we are in ending mode
    if (currentEndingMode && !parsed.endingId) {
        parsed.endingId = currentEndingMode;
    }
    
    return parsed;
  } catch (error) {
    console.error("Gemini Error:", error);
    return {
      speaker: "System",
      dialogue: "Connection Error. Please try again.",
      narrative: "Error...",
      mood: CharacterMood.SURPRISED,
      imageId: 1,
      background: BackgroundType.FANTASY,
      timestamp: "Error",
      chapter: 1,
      chapterTitle: "Error",
      choices: ["Retry"],
      affectionScore: 0,
      isGameOver: false
    };
  }
};