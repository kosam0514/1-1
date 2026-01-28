import { CharacterMood, BackgroundType, GameScene } from './types';

// ==========================================
// 1. IMAGE MANAGEMENT
// ==========================================
const R2_BASE = "https://pub-6c6f72751678403880cb517954a5c50c.r2.dev";

export interface ImageConfig {
  url: string;
  description: string;
}

export const CHARACTER_IMAGES: Record<number, ImageConfig> = {
  // Basic / Neutral
  1: { url: `${R2_BASE}/1.jpg`, description: "등교길의 평범한 모습, 무표정" },
  2: { url: `${R2_BASE}/2.jpg`, description: "수업 시간에 딴청 피우는 모습" },
  3: { url: `${R2_BASE}/3.jpg`, description: "복도에서 마주친 모습" },
  4: { url: `${R2_BASE}/4.jpg`, description: "가만히 이야기를 듣는 모습" },
  
  // Happy
  5: { url: `${R2_BASE}/5.jpg`, description: "활짝 웃으며 인사하는 모습" },
  6: { url: `${R2_BASE}/6.jpg`, description: "맛있는 걸 먹고 기뻐하는 모습" },
  7: { url: `${R2_BASE}/7.jpg`, description: "재미있는 농담에 빵 터진 모습" },
  8: { url: `${R2_BASE}/8.jpg`, description: "기분 좋게 콧노래를 부르는 모습" },
  9: { url: `${R2_BASE}/9.jpg`, description: "자신감 넘치는 미소" },
  30: { url: `${R2_BASE}/30.jpg`, description: "방과 후 즐거운 하교길" },
  
  // Love
  10: { url: `${R2_BASE}/10.jpg`, description: "수줍게 고백을 듣는 모습, 홍조" },
  11: { url: `${R2_BASE}/11.jpg`, description: "얼굴이 빨개진 채 쳐다보는 모습" },
  28: { url: `${R2_BASE}/28.jpg`, description: "사랑에 빠진 눈빛으로 바라봄" },
  29: { url: `${R2_BASE}/29.jpg`, description: "발렌타인 데이 초콜릿을 건네주는 모습" },
  33: { url: `${R2_BASE}/33.jpg`, description: "데이트 마지막 헤어지기 아쉬운 표정" },
  
  // Shy
  12: { url: `${R2_BASE}/12.jpg`, description: "부끄러워서 시선을 피하는 모습" },
  13: { url: `${R2_BASE}/13.jpg`, description: "실수하고 당황한 모습" },
  14: { url: `${R2_BASE}/14.jpg`, description: "칭찬을 듣고 어쩔 줄 모르는 모습" },
  31: { url: `${R2_BASE}/31.jpg`, description: "손 잡았을 때 놀란 표정" },
  
  // Surprised
  15: { url: `${R2_BASE}/15.jpg`, description: "갑작스러운 상황에 깜짝 놀란 모습" },
  16: { url: `${R2_BASE}/16.jpg`, description: "예상치 못한 선물을 받았을 때" },
  17: { url: `${R2_BASE}/17.jpg`, description: "우연히 마주쳐서 놀란 표정" },
  
  // Sad
  18: { url: `${R2_BASE}/18.jpg`, description: "속상해서 눈물 흘리는 모습" },
  19: { url: `${R2_BASE}/19.jpg`, description: "시무룩해진 표정" },
  20: { url: `${R2_BASE}/20.jpg`, description: "비 오는 날 우울한 모습" },
  
  // Angry
  21: { url: `${R2_BASE}/21.jpg`, description: "화가 나서 삐친 모습" },
  22: { url: `${R2_BASE}/22.jpg`, description: "짜증 난 표정" },
  23: { url: `${R2_BASE}/23.jpg`, description: "단단히 화가 난 모습" },

  // Extra
  24: { url: `${R2_BASE}/24.jpg`, description: "체육 대회 때 응원하는 모습" },
  25: { url: `${R2_BASE}/25.jpg`, description: "축제 때 메이드복을 입은 모습" },
  26: { url: `${R2_BASE}/26.jpg`, description: "안경 쓴 지적인 모습" },
  27: { url: `${R2_BASE}/27.jpg`, description: "겨울 목도리를 한 따뜻한 모습" },
  32: { url: `${R2_BASE}/32.jpg`, description: "졸려서 하품하는 모습" },
};

export const getCharacterImageUrl = (id: number): string => CHARACTER_IMAGES[id]?.url || CHARACTER_IMAGES[1].url;
export const getCharacterImageDescription = (id: number): string => CHARACTER_IMAGES[id]?.description || "알 수 없음";

// ==========================================
// 2. CHAPTER & ENDING CONFIGURATION
// ==========================================

export const MAIN_MENU_BG = 'https://pub-bc103aff4485452d9242881fc1f7844a.r2.dev/3.png';

export const CHAPTER_THRESHOLDS: Record<number, { min: number, max: number }> = {
  1: { min: 0, max: 25 },
  2: { min: 25, max: 50 },
  3: { min: 50, max: 75 },
  4: { min: 75, max: 100 },
};

export interface ChapterInfo {
  title: string;
  startScene: Omit<GameScene, 'affectionScore' | 'isGameOver' | 'chapter'>;
}

export const CHAPTER_INFO: Record<number, ChapterInfo> = {
  1: {
    title: "설레는 첫 만남",
    startScene: {
      speaker: "루루",
      dialogue: "앗! 죄송해요! 제가 딴 생각을 하느라...",
      narrative: "학교 복도 모퉁이에서 급하게 뛰어오던 여학생과 부딪혔다. 그녀는 바닥에 떨어진 책들을 허둥지둥 줍는다.",
      mood: CharacterMood.SURPRISED,
      imageId: 3, 
      background: BackgroundType.SCHOOL,
      timestamp: "08:50 AM",
      chapterTitle: "Chapter 1: 설레는 첫 만남",
      choices: ["괜찮아? 다친 데는 없어?", "앞 좀 보고 다녀.", "같이 책을 주워준다."]
    }
  },
  2: {
    title: "가까워지는 거리",
    startScene: {
      speaker: "루루",
      dialogue: "여기야 여기! 헤헤, 사복 입은 거 보니까 뭔가 색다르네?",
      narrative: "주말 오후, 역 앞 카페에서 루루를 만났다. 교복이 아닌 사복 차림의 그녀는 평소보다 더 활기차 보인다.",
      mood: CharacterMood.HAPPY,
      imageId: 5,
      background: BackgroundType.CAFE,
      timestamp: "01:00 PM",
      chapterTitle: "Chapter 2: 가까워지는 거리",
      choices: ["너도 오늘 정말 예쁘다.", "많이 기다렸어?", "배고픈데 밥부터 먹으러 갈까?"]
    }
  },
  3: {
    title: "엇갈린 마음",
    startScene: {
      speaker: "루루",
      dialogue: "...",
      narrative: "방과 후 텅 빈 교실. 창밖에는 비가 내리고 있다. 루루는 창가에 기대어 우울한 표정으로 밖을 보고 있다. 평소의 명랑한 모습은 온데간데없다.",
      mood: CharacterMood.SAD,
      imageId: 20,
      background: BackgroundType.SCHOOL,
      timestamp: "05:30 PM",
      chapterTitle: "Chapter 3: 엇갈린 마음",
      choices: ["무슨 일 있어?", "조용히 옆에 서 있는다.", "비 오는데 우산은 있어?"]
    }
  },
  4: {
    title: "마지막 고백",
    startScene: {
      speaker: "루루",
      dialogue: "저기... 오늘 너한테 꼭 할 말이 있어서 불렀어.",
      narrative: "늦은 밤, 공원 가로등 아래. 루루가 붉어진 얼굴로 내 옷자락을 만지작거리고 있다. 심장 소리가 들릴 것만 같다.",
      mood: CharacterMood.SHY,
      imageId: 10,
      background: BackgroundType.PARK,
      timestamp: "09:00 PM",
      chapterTitle: "Chapter 4: 마지막 고백",
      choices: ["무슨 말인데? (긴장)", "나도 할 말이 있어.", "혹시... 좋아하는 사람 생겼어?"]
    }
  }
};

// ENDING SCENES (Playable Starting Points)
// isGameOver is FALSE initially to allow the player to experience the ending sequence.
export const ENDING_SCENES: Record<string, GameScene> = {
  'E1': { // Bad Ending
    speaker: "루루",
    dialogue: "미안해... 우리, 더 이상 만나지 않는 게 좋을 것 같아. 서로 너무 다른 것 같아서...",
    narrative: "차가운 바람이 부는 거리. 루루는 시선을 피하며 작게 한숨을 내쉬었다. 무거운 침묵이 흐른다.",
    mood: CharacterMood.SAD,
    imageId: 19, // Sad/Look away
    background: BackgroundType.STREET,
    timestamp: "The End?",
    chapter: 4,
    chapterTitle: "Ending: 엇갈린 인연",
    choices: ["왜 그런 말을 하는 거야?", "알겠어... 네가 원한다면."], // Playable choices
    affectionScore: 0,
    isGameOver: false, // Start sequence
    endingId: 'E1'
  },
  'E2': { // Friend Ending
    speaker: "루루",
    dialogue: "있잖아, 난 네가 있어서 정말 다행이라고 생각해. 너만큼 편한 친구는 없을 거야!",
    narrative: "그녀는 해맑게 웃으며 내 어깨를 툭 쳤다. 연인의 설렘보다는 익숙한 편안함이 느껴진다.",
    mood: CharacterMood.HAPPY,
    imageId: 5, // Smiling
    background: BackgroundType.SCHOOL,
    timestamp: "Forever Friends",
    chapter: 4,
    chapterTitle: "Ending: 영원한 단짝",
    choices: ["그래, 우린 최고의 친구니까.", "나도 네가 있어서 좋아."],
    affectionScore: 40,
    isGameOver: false,
    endingId: 'E2'
  },
  'E3': { // Happy Ending (Normal Date)
    speaker: "루루",
    dialogue: "나도... 사실 널 계속 좋아했어. 우리 오늘부터 1일인 거지? 헤헤.",
    narrative: "수줍게 맞잡은 두 손. 그녀의 얼굴이 붉게 물들었다. 우리의 따뜻한 봄날은 이제 시작이다.",
    mood: CharacterMood.LOVE,
    imageId: 11, // Blushing
    background: BackgroundType.PARK,
    timestamp: "Happy Start",
    chapter: 4,
    chapterTitle: "Ending: 설레는 시작",
    choices: ["손을 더 꽉 잡는다.", "사랑해, 루루."],
    affectionScore: 80,
    isGameOver: false,
    endingId: 'E3'
  },
  'E4': { // Marriage/Propose Ending
    speaker: "루루",
    dialogue: "정말...? 나랑 평생 함께해주겠다고? 꿈만 같아...",
    narrative: "반지를 낀 그녀의 손이 가볍게 떨리고 있다. 눈가에 맺힌 눈물이 보석처럼 반짝인다.",
    mood: CharacterMood.LOVE,
    imageId: 10, // Shy/Touching
    background: BackgroundType.FANTASY,
    timestamp: "Happy Ever After",
    chapter: 4,
    chapterTitle: "Ending: 영원한 약속",
    choices: ["그녀를 따뜻하게 안아준다.", "눈물을 닦아준다."],
    affectionScore: 95,
    isGameOver: false,
    endingId: 'E4'
  },
  'E5': { // Secret Ending (True Love / Intimate)
    speaker: "루루",
    dialogue: "으음... 벌써 아침이야? 조금만 더 안아줘... 네 품이 너무 따뜻하단 말이야.",
    narrative: "창틈으로 들어오는 아침 햇살이 침대 위를 비춘다. 헝클어진 머리카락과 얇은 잠옷 차림의 그녀가 내 가슴에 얼굴을 부비며 나른한 목소리로 속삭인다.",
    mood: CharacterMood.LOVE,
    imageId: 32, // Sleepy/Yawning/Relaxed
    background: BackgroundType.BEDROOM, 
    timestamp: "Secret Morning",
    chapter: 4,
    chapterTitle: "Ending: 하나 된 마음",
    choices: ["이마에 키스한다.", "더 꽉 끌어안는다."],
    affectionScore: 100,
    isGameOver: false,
    endingId: 'E5'
  }
};

export const MOOD_COLORS: Record<CharacterMood, string> = {
  [CharacterMood.NEUTRAL]: 'border-gray-400',
  [CharacterMood.HAPPY]: 'border-yellow-400',
  [CharacterMood.SAD]: 'border-blue-400',
  [CharacterMood.ANGRY]: 'border-red-500',
  [CharacterMood.SHY]: 'border-pink-300',
  [CharacterMood.SURPRISED]: 'border-purple-400',
  [CharacterMood.LOVE]: 'border-pink-500',
};