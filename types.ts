export enum CharacterMood {
  NEUTRAL = 'NEUTRAL',
  HAPPY = 'HAPPY',
  SAD = 'SAD',
  ANGRY = 'ANGRY',
  SHY = 'SHY',
  SURPRISED = 'SURPRISED',
  LOVE = 'LOVE'
}

export enum BackgroundType {
  SCHOOL = 'SCHOOL',
  CAFE = 'CAFE',
  PARK = 'PARK',
  ROOM = 'ROOM',
  STREET = 'STREET',
  FANTASY = 'FANTASY',
  BEDROOM = 'BEDROOM' // Added for E5
}

export interface GameScene {
  speaker: string;
  dialogue: string;
  narrative: string;
  mood: CharacterMood; 
  background: BackgroundType;
  timestamp: string;
  chapter: number; // 1 to 4
  chapterTitle: string; 
  choices: string[];
  affectionScore: number;
  isGameOver: boolean;
  imageId: number; 
  endingId?: string; // E1, E2, E3, E4, E5
}

// Simplified Save Data for Checkpoints
export interface CheckpointData {
  n: string; // playerName
  c: number | string; // chapter number OR Ending Code (e.g. "E5")
  a: number; // affectionScore
}

export interface GameState {
  currentScene: GameScene | null;
  isLoading: boolean;
  history: string[]; 
  playerName: string;
  collectedImageIds: number[]; 
}