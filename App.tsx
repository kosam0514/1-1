import React, { useState, useEffect, useRef } from 'react';
import { startGame, sendChoice, startFromCheckpoint } from './services/geminiService';
import { GameScene, BackgroundType, CheckpointData } from './types';
import { MAIN_MENU_BG, ENDING_SCENES } from './constants';
import Character from './components/Character';
import DialogueBox from './components/DialogueBox';
import ChoiceOverlay from './components/ChoiceOverlay';
import Gallery from './components/Gallery';

// BGM URL
const BGM_URL = "https://pub-bc103aff4485452d9242881fc1f7844a.r2.dev/%EC%9A%B0%EC%98%88%EB%A6%B0%20-%20%EB%B6%89%EC%9D%80%EC%9E%A5%EB%AF%B8%20(Cover%20by%20%EC%B7%A8%EB%83%A5%EB%83%A5)_1080p.mp3";
const TOTAL_IMAGES = 33;

function App() {
  const [gameStarted, setGameStarted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentScene, setCurrentScene] = useState<GameScene | null>(null);
  const [playerName, setPlayerName] = useState("주인공");
  const [collectedImages, setCollectedImages] = useState<Set<number>>(new Set());
  
  const [currentChapter, setCurrentChapter] = useState(1);
  const [showChapterModal, setShowChapterModal] = useState(false);
  const [chapterModalData, setChapterModalData] = useState<{title: string, desc: string, code?: string} | null>(null);
  
  const [showGallery, setShowGallery] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.3); 
  
  const [showExitModal, setShowExitModal] = useState(false);
  const [showLoadModal, setShowLoadModal] = useState(false);
  const [loadCodeInput, setLoadCodeInput] = useState("");

  const gameStartedRef = useRef(gameStarted);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    gameStartedRef.current = gameStarted;
  }, [gameStarted]);

  useEffect(() => {
    audioRef.current = new Audio(BGM_URL);
    audioRef.current.loop = true;
    audioRef.current.volume = volume;
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [isMuted, volume]);

  const generateCheckpointCode = (chapter: number) => {
    return `C${chapter}`;
  };

  // Determine Ending Code based on Score
  const getEndingCodeFromScore = (score: number) => {
    if (score >= 100) return 'E5';
    if (score >= 90) return 'E4';
    if (score >= 50) return 'E3';
    if (score >= 25) return 'E2';
    return 'E1';
  };

  useEffect(() => {
    if (currentScene && currentScene.chapter > currentChapter) {
      const newChapter = currentScene.chapter;
      const code = generateCheckpointCode(newChapter);
      
      setCurrentChapter(newChapter);
      setChapterModalData({
        title: currentScene.chapterTitle || `Chapter ${newChapter}`,
        desc: getChapterDescription(newChapter),
        code: code
      });
      setShowChapterModal(true);
    } else if (currentScene && currentChapter === 1 && !chapterModalData && !loading && !currentScene.isGameOver) {
      setChapterModalData({
          title: currentScene.chapterTitle || "Chapter 1",
          desc: getChapterDescription(1)
      });
      setShowChapterModal(true);
    }
  }, [currentScene, currentChapter]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (gameStartedRef.current) {
           setShowExitModal(prev => !prev);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const getChapterDescription = (chapter: number) => {
    switch(chapter) {
      case 1: return "설레는 첫 만남과 학교 생활 (0~25점)";
      case 2: return "점점 가까워지는 우리의 거리 (25~50점)";
      case 3: return "예기치 못한 사건, 그리고... (50~75점)";
      case 4: return "마지막 선택의 순간 (75~100점)";
      default: return "";
    }
  };
  
  const getKoreanLocation = (bg: BackgroundType | undefined) => {
      if(!bg) return "";
      const map: Record<string, string> = {
          SCHOOL: "학교",
          CAFE: "카페",
          PARK: "공원",
          ROOM: "내 방",
          STREET: "거리",
          FANTASY: "꿈 속",
          BEDROOM: "침실"
      };
      return map[bg] || bg;
  };

  const playBGM = () => {
    if (audioRef.current && audioRef.current.paused) {
      audioRef.current.play().catch(e => console.log("Audio play blocked", e));
    }
  };

  const handleStart = async () => {
    if (!playerName.trim()) return;
    playBGM();
    setLoading(true);
    setGameStarted(true);
    setCurrentChapter(1);
    setShowExitModal(false);
    
    try {
      const scene = await startGame(playerName);
      setCurrentScene(scene);
    } catch (e) {
      console.error(e);
      alert("Failed to start game.");
      setGameStarted(false);
    } finally {
      setLoading(false);
    }
  };

  const handleChoiceSelect = async (choice: string) => {
    if (!currentScene) return;
    
    setCurrentScene({
      ...currentScene,
      speaker: playerName,
      dialogue: choice,
      narrative: "", 
      choices: [], 
      imageId: currentScene.imageId 
    });
    setLoading(true);
    try {
      // Don't resolve ending immediately. 
      // We want to show the "Code Reveal" screen if it's game over from a choice.
      const nextScene = await sendChoice(choice);
      setCurrentScene(nextScene);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const confirmExit = () => {
      setGameStarted(false);
      setCurrentScene(null);
      setCurrentChapter(1);
      setChapterModalData(null);
      setShowExitModal(false);
  };

  const handleImageDisplayed = (id: number) => {
    setCollectedImages(prev => {
        const newSet = new Set(prev);
        newSet.add(id);
        return newSet;
    });
  };

  const copyCodeToClipboard = (code: string) => {
      navigator.clipboard.writeText(code).then(() => {
          alert(`✅ 코드 '${code}'가 복사되었습니다!`);
      });
  };

  const getCurrentCheckpointCode = () => {
      if(!currentScene) return "";
      return generateCheckpointCode(currentChapter);
  };

  const handleLoadCheckpoint = async () => {
    const code = loadCodeInput.trim().toUpperCase();
    
    // Check for C codes or E codes
    const isChapterCode = /^C([1-4])$/.test(code);
    const isEndingCode = /^E([1-5])$/.test(code);
    
    if (!isChapterCode && !isEndingCode) {
        alert("⚠️ 올바르지 않은 코드입니다.\n(챕터 코드 예: C2)");
        return;
    }

    setLoading(true);
    try {
      let data: CheckpointData;
      
      if (isChapterCode) {
        const match = code.match(/^C([1-4])$/);
        const chapterNum = parseInt(match![1]);
        data = { n: playerName.trim() || "주인공", c: chapterNum, a: 0 }; 
        setCurrentChapter(chapterNum);
      } else {
        // Ending Code (Secretly handled)
        data = { n: playerName.trim() || "주인공", c: code, a: 0 };
        setCurrentChapter(4); 
      }

      setPlayerName(data.n);
      playBGM();
      
      const restoredScene = await startFromCheckpoint(data);
      setCurrentScene(restoredScene);
      setGameStarted(true);
      setShowLoadModal(false);
    } catch (e) {
      console.error("Load failed", e);
      alert("⚠️ 로드에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  // --- Main Menu ---
  if (!gameStarted) {
    return (
      <div className="min-h-screen relative overflow-hidden font-sans flex flex-col">
        <div 
          className="absolute inset-0 bg-cover bg-center z-0 transition-all duration-[20s] ease-linear transform scale-110 hover:scale-100"
          style={{ backgroundImage: `url(${MAIN_MENU_BG})` }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-t from-pink-500/30 to-blue-500/10 backdrop-blur-[2px] z-0"></div>

        <div className="absolute top-4 right-4 z-50 flex items-center gap-2 bg-black/30 p-2 rounded-full backdrop-blur-md">
           <button onClick={() => setIsMuted(!isMuted)} className="text-white hover:text-pink-300 transition-all cursor-pointer">
            {isMuted ? "🔇" : "🔊"}
          </button>
          <input 
            type="range" 
            min="0" 
            max="1" 
            step="0.01" 
            value={volume} 
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            className="w-24 accent-pink-500 cursor-pointer"
          />
        </div>

        <div className="relative z-10 flex-grow flex flex-col items-center justify-center p-6 text-center">
            <div className="mb-12 animate-bounce-slow">
              <h1 className="text-7xl md:text-9xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-pink-200 drop-shadow-[0_10px_10px_rgba(236,72,153,0.8)] font-serif italic tracking-tighter" style={{ textShadow: '4px 4px 0px #ec4899' }}>
                Dreamy<br/>Date
              </h1>
              <div className="mt-4 bg-white/20 backdrop-blur-md inline-block px-8 py-2 rounded-full border border-white/40 shadow-lg">
                <p className="text-white font-bold tracking-[0.2em] text-sm md:text-lg">AI REAL-TIME DATING SIM</p>
              </div>
            </div>

            <div className="w-full max-w-md bg-white/10 backdrop-blur-xl p-8 rounded-3xl border border-white/30 shadow-2xl">
               <input 
                  type="text" 
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  className="w-full px-6 py-4 bg-white/80 rounded-xl border-2 border-white focus:border-pink-300 outline-none text-center text-xl font-bold text-gray-700 shadow-inner mb-6 placeholder-gray-400"
                  placeholder="당신의 이름은?"
                />
                
                <div className="flex gap-2 mb-4">
                  <button 
                    onClick={handleStart}
                    disabled={loading || !playerName.trim()}
                    className="flex-1 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-400 hover:to-rose-400 text-white font-black py-4 rounded-xl shadow-lg shadow-pink-500/40 transform transition-all active:scale-95 text-lg flex items-center justify-center gap-2 group border border-white/20 cursor-pointer"
                  >
                    <span className="group-hover:scale-125 transition-transform">♥</span> 시작하기
                  </button>
                  <button 
                    onClick={() => setShowLoadModal(true)}
                    className="flex-none bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-4 rounded-xl shadow-lg transform transition-all active:scale-95 flex items-center justify-center cursor-pointer"
                    title="패스워드 입력"
                  >
                    🔑 이어하기
                  </button>
                </div>

                <button 
                  onClick={() => setShowGallery(true)}
                  className="w-full bg-white/20 hover:bg-white/30 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 border border-white/10 cursor-pointer"
                >
                  <span>📷</span> 갤러리 ({collectedImages.size}/{TOTAL_IMAGES})
                </button>
            </div>
        </div>
        
        <div className="relative z-10 p-4 text-center text-white/50 text-xs font-mono">
           Powered by Gemini 2.5 • Developed by AI
        </div>

        {showLoadModal && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-gray-800 p-6 rounded-2xl w-full max-w-lg border border-pink-500/30 shadow-2xl">
              <h3 className="text-2xl font-bold text-white mb-4">패스워드 입력</h3>
              <p className="text-gray-400 text-sm mb-4">
                저장된 챕터 코드(C1~C4)를 입력하세요.<br/>
                <span className="text-xs text-gray-500">Ex) C2</span>
              </p>
              <textarea 
                value={loadCodeInput}
                onChange={(e) => setLoadCodeInput(e.target.value)}
                className="w-full h-24 bg-black/50 text-pink-300 p-4 rounded-xl border border-white/10 focus:border-pink-500 outline-none font-mono text-xl text-center flex items-center justify-center mb-4 custom-scrollbar resize-none uppercase"
                placeholder="Ex) C2"
              />
              <div className="flex gap-3">
                <button 
                  onClick={() => setShowLoadModal(false)}
                  className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 rounded-xl"
                >
                  취소
                </button>
                <button 
                  onClick={handleLoadCheckpoint}
                  className="flex-1 bg-pink-600 hover:bg-pink-500 text-white font-bold py-3 rounded-xl"
                  disabled={loading}
                >
                  {loading ? "복구 중..." : "불러오기"}
                </button>
              </div>
            </div>
          </div>
        )}

        {showGallery && (
          <Gallery 
            collectedIds={collectedImages} 
            onClose={() => setShowGallery(false)} 
            totalImages={TOTAL_IMAGES} 
          />
        )}
      </div>
    );
  }

  // --- Game Over State Handling ---
  if (currentScene?.isGameOver) {
    const earnedEndingCode = getEndingCodeFromScore(currentScene.affectionScore);
    // Logic: If currentScene has an explicit 'endingId', it means we LOADED the ending specifically or it was passed.
    // If NOT (it's undefined), it means we just finished Chapter 4 and need to show the code reveal.
    const isEndingUnlocked = !!currentScene.endingId;

    if (isEndingUnlocked) {
      // --- ACTUAL ENDING SCENE VIEWER (When Code is Loaded) ---
      const isGoodEnding = currentScene.affectionScore >= 80;
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white p-6 relative overflow-hidden">
           <div className={`absolute inset-0 opacity-40 ${isGoodEnding ? 'bg-pink-500' : 'bg-blue-900'} transition-colors duration-1000`}></div>
           
           <div className="relative z-10 w-full max-w-4xl flex flex-col md:flex-row items-center gap-8 bg-black/50 p-8 rounded-3xl backdrop-blur-md border border-white/10 shadow-2xl">
               <div className="w-full md:w-1/3 flex justify-center">
                   <div className="relative w-64 h-80 rounded-xl overflow-hidden shadow-lg border border-white/20">
                       <Character 
                          mood={currentScene.mood} 
                          isSpeaking={false} 
                          onImageDisplayed={handleImageDisplayed} 
                          imageId={currentScene.imageId}
                       />
                   </div>
               </div>
               
               <div className="w-full md:w-2/3 text-center md:text-left">
                  <div className="text-pink-400 font-bold tracking-widest text-sm uppercase mb-2">
                      {currentScene.chapterTitle}
                  </div>
                  <h2 className="text-4xl md:text-5xl font-extrabold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">
                     {isGoodEnding ? "Happy Ending!" : "The End"}
                  </h2>
                  <p className="text-lg md:text-xl mb-6 leading-relaxed text-gray-200 whitespace-pre-line">
                      {currentScene.narrative}
                  </p>
                  <div className="bg-white/10 p-4 rounded-xl mb-8 border-l-4 border-pink-500">
                       <p className="text-lg text-pink-200 italic font-serif">"{currentScene.dialogue}"</p>
                       <p className="text-right text-sm text-gray-400 mt-2">- {currentScene.speaker}</p>
                  </div>
                  
                  <button onClick={() => { setGameStarted(false); setCurrentScene(null); }} className="mt-8 w-full bg-white text-black font-bold py-4 rounded-full hover:bg-pink-100 hover:scale-[1.02] transition-all shadow-lg cursor-pointer">
                      메인으로 돌아가기
                  </button>
               </div>
           </div>
        </div>
      );
    } else {
      // --- CODE REVEAL SCREEN (Immediately after Ch4) ---
      const isE5 = earnedEndingCode === 'E5';
      
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-950 text-white p-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-pink-900/20 via-black to-black"></div>
          
          <div className="relative z-10 max-w-2xl w-full text-center border border-white/10 bg-black/60 backdrop-blur-xl p-10 rounded-3xl shadow-[0_0_50px_rgba(236,72,153,0.15)] animate-in fade-in zoom-in duration-500">
              <div className="text-pink-500 font-bold tracking-[0.5em] text-xs uppercase mb-6">Chapter 4 Complete</div>
              
              <h1 className="text-4xl md:text-5xl font-serif italic mb-8 text-white">
                여정이 끝났습니다.
              </h1>
              
              <p className="text-gray-400 mb-8 leading-relaxed">
                당신의 선택이 만든 결말입니다.<br/>
                아래 코드를 <strong>'이어하기'</strong>에 입력하여 엔딩을 확인하세요.
              </p>

              <div className="bg-gray-900/80 p-6 rounded-2xl border border-pink-500/30 mb-8 inline-block min-w-[300px]">
                  <p className="text-xs text-gray-500 uppercase font-bold mb-3 tracking-wider">Your Ending Code</p>
                  <div className="flex items-center justify-center gap-4">
                      <code className="text-5xl font-mono font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 to-yellow-500 drop-shadow-[0_2px_10px_rgba(234,179,8,0.5)]">
                        {earnedEndingCode}
                      </code>
                      <button 
                        onClick={() => copyCodeToClipboard(earnedEndingCode)}
                        className="bg-white/10 hover:bg-white/20 text-white p-2 rounded-lg transition-colors"
                        title="Copy Code"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                        </svg>
                      </button>
                  </div>
              </div>

              {isE5 && (
                 <div className="bg-red-900/20 border border-red-500/30 p-4 rounded-xl mb-8 flex items-center justify-center gap-2">
                    <span className="text-red-400 text-xl">⚠️</span>
                    <span className="text-red-300 text-sm font-bold">주의: E5 엔딩은 다소 야한 장면이 포함되어 있습니다.</span>
                 </div>
              )}

              <div className="flex justify-center">
                  <button 
                    onClick={() => { setGameStarted(false); setCurrentScene(null); }}
                    className="bg-white hover:bg-gray-200 text-black font-bold py-4 px-12 rounded-full transition-transform hover:scale-105 shadow-xl"
                  >
                    타이틀 화면으로
                  </button>
              </div>
          </div>
        </div>
      );
    }
  }

  // --- Active Game Screen ---
  return (
    <div className="relative w-full h-screen overflow-hidden bg-gray-900 flex flex-col">
      <div 
        className="absolute inset-0 bg-cover bg-center z-0"
        style={{ backgroundImage: `url(${MAIN_MENU_BG})` }}
      >
        <div className="absolute inset-0 bg-gray-900/60" /> 
      </div>

      <div className="absolute top-0 left-0 w-full z-[60] px-6 py-3 flex justify-between items-start md:items-center text-white/90 bg-gradient-to-b from-black/80 via-black/40 to-transparent pb-8 pointer-events-none">
         <div className="flex items-center gap-4 pointer-events-auto">
            <button 
              onClick={() => setShowExitModal(true)} 
              className="hover:text-pink-400 transition-colors cursor-pointer p-2 rounded-full hover:bg-white/10 group relative" 
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
            </button>
            
            <div className="flex flex-col drop-shadow-md">
               <div className="flex items-center gap-2">
                 <span className="font-extrabold text-xl text-pink-300 tracking-wide" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}>
                    {getKoreanLocation(currentScene?.background)}
                 </span>
                 <div className="bg-white/20 px-2 py-0.5 rounded text-[10px] font-bold border border-white/20 select-none shadow-sm">
                   CH.{currentChapter}
                 </div>
               </div>
               <span className="text-xs text-gray-200 font-mono tracking-wide flex items-center gap-1 opacity-80" style={{ textShadow: '0 1px 2px rgba(0,0,0,1)' }}>
                  <span>🕒</span> {currentScene?.timestamp || "??:??"}
               </span>
            </div>
         </div>
         
         <div className="flex gap-4 items-center pointer-events-auto">
            <div className="hidden md:flex items-center gap-2 bg-black/40 p-1.5 rounded-full border border-white/10 backdrop-blur-sm">
                <button onClick={() => setIsMuted(!isMuted)} className="text-white/80 hover:text-white cursor-pointer px-1">
                    {isMuted ? "🔇" : "🔊"}
                </button>
                <input 
                    type="range" 
                    min="0" 
                    max="1" 
                    step="0.01" 
                    value={volume} 
                    onChange={(e) => setVolume(parseFloat(e.target.value))}
                    className="w-20 accent-pink-500 cursor-pointer"
                />
            </div>
            
            {loading && (
                <div className="text-pink-400 animate-pulse text-xs font-bold uppercase select-none drop-shadow-md">Thinking...</div>
            )}
            
            <div className="flex items-center gap-2 bg-black/60 px-4 py-1.5 rounded-full border border-pink-500/30 select-none backdrop-blur-sm shadow-lg">
                <span className="text-pink-500 text-lg">♥</span>
                <span className="text-sm font-bold text-white">{currentScene?.affectionScore || 0}%</span>
            </div>
         </div>
      </div>

      <div className="flex-grow relative z-10 flex items-end justify-center overflow-hidden pb-4">
         {currentScene && (
             <Character 
               mood={currentScene.mood} 
               isSpeaking={currentScene.speaker.includes('루루') || currentScene.speaker === 'Ruru'} 
               onImageDisplayed={handleImageDisplayed}
               imageId={currentScene.imageId}
             />
           )}
      </div>

      <div className="relative z-50 w-full h-[40vh] min-h-[250px] bg-gray-900/95 border-t-2 border-pink-500/50 flex flex-col md:flex-row shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
        <div className="w-full md:w-[70%] h-full border-b md:border-b-0 md:border-r border-white/10">
             {currentScene && (
                  <DialogueBox 
                    speaker={currentScene.speaker} 
                    text={currentScene.dialogue} 
                    narrative={currentScene.narrative}
                  />
                )}
        </div>

        <div className="w-full md:w-[30%] h-full">
               {currentScene && !loading && currentScene.choices && currentScene.choices.length > 0 ? (
                 <ChoiceOverlay 
                   choices={currentScene.choices} 
                   onSelect={handleChoiceSelect} 
                   visible={true}
                 />
               ) : (
                 <div className="w-full h-full flex items-center justify-center">
                    <span className="text-white/20 text-xs tracking-widest uppercase animate-pulse">Waiting for response...</span>
                 </div>
               )}
        </div>
      </div>

      {showExitModal && (
          <div className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 fade-in">
              <div className="bg-gray-900 border border-pink-500/30 p-8 rounded-2xl max-w-sm w-full text-center shadow-[0_0_50px_rgba(236,72,153,0.2)]">
                  <h3 className="text-2xl font-bold text-white mb-2">일시 정지</h3>
                  <div className="mb-6 bg-black/40 p-3 rounded-lg border border-white/5">
                    <p className="text-pink-400 text-xs font-bold uppercase mb-1">Current Chapter Code</p>
                    <div className="flex gap-2">
                        <input 
                            readOnly 
                            value={getCurrentCheckpointCode()} 
                            className="bg-transparent text-gray-300 text-xl font-bold w-full outline-none font-mono tracking-widest"
                        />
                        <button onClick={() => copyCodeToClipboard(getCurrentCheckpointCode())} className="text-white text-xs hover:text-pink-400">📋</button>
                    </div>
                    <p className="text-gray-500 text-[10px] mt-1 text-left">* 이 코드로 언제든지 해당 챕터를 다시 시작할 수 있습니다.</p>
                  </div>
                  
                  <div className="flex flex-col gap-3">
                      <button 
                        onClick={() => setShowExitModal(false)}
                        className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 rounded-xl transition-colors"
                      >
                          계속하기
                      </button>
                      <button 
                        onClick={confirmExit}
                        className="bg-rose-600 hover:bg-rose-500 text-white font-bold py-3 rounded-xl transition-transform active:scale-95 shadow-lg"
                      >
                          메인 메뉴로
                      </button>
                  </div>
              </div>
          </div>
      )}

      {showChapterModal && (
        <div className="absolute inset-0 z-[100] bg-black/95 flex items-center justify-center p-4 fade-in">
          <div className="max-w-xl w-full text-center">
            <div className="text-pink-500 font-bold tracking-[0.3em] text-sm uppercase mb-4 animate-pulse">Chapter {currentChapter}</div>
            <h2 className="text-5xl md:text-6xl font-extrabold text-white mb-6 leading-tight drop-shadow-[0_0_20px_rgba(236,72,153,0.5)]">
               {chapterModalData?.title}
            </h2>
            <p className="text-gray-300 text-lg mb-8 italic border-t border-b border-white/10 py-4">
               {chapterModalData?.desc}
            </p>

            {chapterModalData?.code && (
                <div className="mb-10 bg-gray-800/50 p-4 rounded-xl border border-pink-500/20">
                    <p className="text-pink-300 text-xs font-bold mb-2 uppercase tracking-wider">💾 Chapter Password</p>
                    <div className="flex items-center gap-2 bg-black/50 p-3 rounded-lg justify-center">
                        <code className="text-white font-mono text-2xl font-bold tracking-widest">{chapterModalData.code}</code>
                        <button 
                            onClick={() => chapterModalData.code && copyCodeToClipboard(chapterModalData.code)}
                            className="bg-white/10 hover:bg-white/20 text-white px-3 py-1 rounded text-xs font-bold transition-colors ml-4"
                        >
                            COPY
                        </button>
                    </div>
                </div>
            )}

            <button 
              onClick={() => setShowChapterModal(false)}
              className="bg-white hover:bg-pink-50 text-black font-bold py-4 px-12 rounded-full transition-all hover:scale-105 shadow-[0_0_30px_rgba(255,255,255,0.3)] cursor-pointer"
            >
              Start Chapter
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

export default App;