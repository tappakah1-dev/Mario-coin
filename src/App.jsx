import React, { useState, useEffect, useRef } from 'react';
import { Copy, Check, Twitter, ExternalLink, Gamepad2, RefreshCw, Loader2, Trophy, Play } from 'lucide-react';

const App = () => {
  const [copied, setCopied] = useState(false);
  const [memeTopText, setMemeTopText] = useState("");
  const [memeBottomText, setMemeBottomText] = useState("");
  const [memeImageUrl, setMemeImageUrl] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [memeGenerated, setMemeGenerated] = useState(false);

  // --- GAME STATE ---
  const [username, setUsername] = useState("");
  const [gameState, setGameState] = useState("start"); // 'start', 'playing', 'gameover'
  const [score, setScore] = useState(0);

  const CA = "3reTzfqE1LkGsXFmi3oNtGSsYwnXZs6sPYtQapTvpump";
  const xLink = "https://x.com/i/communities/1998507708064936273";
  const buyLink = "https://axiom.trade/@dumacuk";
  const logoUrl = "https://chunk.cc.gatech.edu/AY2015/cs4475_summer/projects/spinning/coin.jpg";
  const bannerUrl = "https://pbs.twimg.com/community_banner_img/1998760374267523072/m9GVVXkD?format=jpg&name=small";

  const topTextOptions = [
    "WHEN YOU BUY THE DIP", "DEV DOING SOMETHING", "LOOKING FOR THE NEXT 100X", 
    "WHEN BOWSER DUMPS HIS BAGS", "RESCUING MY PORTFOLIO", "EATING A SUPER MUSHROOM", 
    "HITTING THE QUESTION BLOCK", "WHEN THE MARKET IS RED", "HOLDING $MARIO LIKE", 
    "SAVING THE PRINCESS?", "MY WALLET AFTER GAS FEES", "WHEN YOU FIND A SECRET WARP ZONE", 
    "CHECKING DEX AT 3AM", "WAKING UP TO A GREEN CANDLE", "WHEN LUIGI SELLS EARLY", 
    "RIDING YOSHI TO THE MOON", "DODGING RED CANDLES LIKE BARRELS", "WHEN THE CHART LOOKS LIKE A STAIRCASE", 
    "COLLECTING COINS IRL", "WHEN SMART MONEY BUYS $MARIO", "GETTING THAT STAR POWER", 
    "WHEN THE JEET SELLS FOR 10%", "WAITING FOR THE BULL RUN", "PORTFOLIO DOWN 90%",
    "FORGOT MY SEED PHRASE", "BUYING HIGH SELLING LOW", "WHEN BINANCE LISTS $MARIO"
  ];

  const bottomTextOptions = [
    "MAMMA MIA!", "IT'S A ME, MULTIPLIER!", "STRAIGHT TO THE MOON", 
    "WE ARE SO BACK", "1-UP IN REAL LIFE", "NAH, BUYING $MARIO", 
    "WAGMI LUIGI", "BULL MARKET ACTIVATED", "DIAMOND HANDS MARIO", 
    "TOAD SAID IT'S A RUG", "STAR POWER ACTIVATED", "STILL HOLDING", 
    "SORRY PRINCESS, I'M TRADING", "SEND IT", "JUST BOUGHT MORE", 
    "BOWSER IN SHAMBLES", "LVL UP", "GREEN PIPES ONLY", 
    "MAX BIDDING", "YOSHI GOT LEFT BEHIND", "IT KEEPS DIPPING", 
    "GAME OVER FOR BEARS", "HERE WE GO!", "HODL THE LINE",
    "DEVS BASED", "LIQUIDITY LOCKED", "FEELS GOOD MAN"
  ];

  const generateRandomMeme = async () => {
    if (isGenerating) return;
    setIsGenerating(true);
    
    // Safety check for API Key access
    let apiKey = "";
    try {
        apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    } catch (e) {
        apiKey = "";
    }

    if (!apiKey || apiKey === "undefined") {
        setMemeTopText("API KEY MISSING");
        setMemeBottomText("CHECK VERCEL VARS");
        setIsGenerating(false);
        return;
    }

    // Always pick new random options when clicking the button, 
    // unless the user has manually typed something original.
    const isTopDefault = !memeTopText || topTextOptions.includes(memeTopText);
    const isBottomDefault = !memeBottomText || bottomTextOptions.includes(memeBottomText);

    const currentTop = isTopDefault 
        ? topTextOptions[Math.floor(Math.random() * topTextOptions.length)] 
        : memeTopText.trim();
        
    const currentBottom = isBottomDefault 
        ? bottomTextOptions[Math.floor(Math.random() * bottomTextOptions.length)] 
        : memeBottomText.trim();
    
    setMemeTopText(currentTop);
    setMemeBottomText(currentBottom);
    
    const fetchWithRetry = async (url, options, retries = 2) => {
      const delays = [1000, 2000];
      for (let i = 0; i < retries; i++) {
        try {
          const res = await fetch(url, options);
          if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
          return await res.json();
        } catch (err) {
          if (i === retries - 1) throw err;
          await new Promise(resolve => setTimeout(resolve, delays[i]));
        }
      }
    };

    try {
      // --- 1. EXPANDED HARDCODED PROMPT VARIATIONS ---
      const styleTemplates = [
        `Retro 8-bit pixel art of a plumber character with a red hat jumping to hit a golden crypto coin block. Background is a vibrant blue mushroom kingdom with green hills. High detail pixel art style.`,
        `Cinematic 3D render of a plumber character riding a green dinosaur through a galaxy of floating golden coins and green candles. Heroic lighting, epic space atmosphere, Nintendo-inspired 3D style.`,
        `Vintage comic book illustration of a red-capped hero diving into a giant green pipe filled with gold coins and dollar signs. Bold ink lines, halftone dots, high action crypto trading scene.`,
        `Hyper-realistic Saturday morning cartoon style showing a plumber character shocked at a giant computer screen filled with green vertical bar charts. Bright colors, thick outlines, funny expression.`,
        `Anime-style illustration of a hero in red overalls standing on top of a giant golden coin mountain under a starry night sky. Dramatic wind effects, vibrant Japanese art style.`,
        `3D isometric diorama of a crypto trading station inside a castle, featuring a plumber character watching 'MARIO' price charts on many monitors. Cute stylized 3D environment.`,
        `Street art graffiti mural of Mario wearing gold chains and sunglasses, holding a bag of golden coins. Gritty brick wall background, neon paint splatters, urban cool style.`,
        `Ethereal low-poly 3D art of a plumber character floating in a digital void surrounded by glowing geometric coin shapes. Minimalist, artistic, high-tech Nintendo aesthetic.`,
        `Claymation style scene (like Wallace and Gromit) of Mario and Luigi frantically checking a laptop with a giant green rocket ship on the screen. Soft lighting, tactile textures.`,
        `Cyberpunk futuristic version of Mario with a robotic arm, standing in a rainy neon-lit Mushroom City, looking at a digital holographic coin ticker. Gritty sci-fi style.`
      ];

      // Pick a random style and combine with a general thematic instruction
      const randomStyle = styleTemplates[Math.floor(Math.random() * styleTemplates.length)];
      
      // Incorporate the text into the visual prompt to help the AI understand the context
      const imagePrompt = `Visual scene for a crypto meme coin called $MARIO. Visual Style: ${randomStyle}. The character's action and the scene's composition should reflect the theme: "${currentTop} ${currentBottom}". Make it look like a funny Super Mario parody involving trading and digital gold coins. High quality, clear composition.`;

      // --- 2. GENERATE THE IMAGE (With Imagen Fallbacks) ---
      const endpointsToTry = [
          `https://generativelanguage.googleapis.com/v1/models/imagen-3.0-generate-001:predict?key=${apiKey}`,
          `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:predict?key=${apiKey}`,
          `https://generativelanguage.googleapis.com/v1beta/models/imagen-4.0-generate-001:predict?key=${apiKey}`
      ];

      let success = false;
      for (const endpoint of endpointsToTry) {
          try {
              const imagePayload = { instances: { prompt: imagePrompt }, parameters: { sampleCount: 1 } };
              const imageData = await fetchWithRetry(endpoint, { 
                  method: 'POST', 
                  headers: { 'Content-Type': 'application/json' }, 
                  body: JSON.stringify(imagePayload) 
              });
              
              if (imageData?.predictions?.[0]?.bytesBase64Encoded) {
                  setMemeImageUrl(`data:image/png;base64,${imageData.predictions[0].bytesBase64Encoded}`);
                  setMemeGenerated(true);
                  success = true;
                  break;
              }
          } catch (endpointError) {
              console.warn(`Imagen endpoint failed: ${endpoint}`);
          }
      }

      if (!success) throw new Error("All image endpoints failed.");

    } catch (err) {
      console.error("Failed to generate meme:", err);
      setMemeTopText("AI ERROR");
      setMemeBottomText("TRY AGAIN LATER");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(CA).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(err => {
      const textArea = document.createElement("textarea");
      textArea.value = CA;
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) { console.error('Failed to copy', err); }
      document.body.removeChild(textArea);
    });
  };

  // --- GAME ENGINE LISTENER ---
  useEffect(() => {
    const handleMessage = (event) => {
      if (event.data && event.data.type === 'MARIO_GAME_OVER') {
        setScore(event.data.score);
        setGameState("gameover");
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const startGame = () => {
    if (username.trim().length < 3) return;
    setScore(0);
    setGameState("playing");
  };

  return (
    <div className="min-h-screen bg-[#5c94fc] font-pixel text-white selection:bg-red-500 selection:text-yellow-300 overflow-x-hidden relative pb-12">
      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');
        .font-pixel { font-family: 'Press Start 2P', cursive; line-height: 1.5; }
        .mario-shadow { box-shadow: 6px 6px 0px 0px #000000; }
        .mario-shadow-sm { box-shadow: 4px 4px 0px 0px #000000; }
        .mario-shadow:active { box-shadow: 2px 2px 0px 0px #000000; transform: translateY(4px) translateX(4px); }
        .mario-shadow-sm:active { box-shadow: 2px 2px 0px 0px #000000; transform: translateY(2px) translateX(2px); }
        @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-15px); } }
        .animate-float { animation: float 3s ease-in-out infinite; }
        @keyframes spin-slow { from { transform: rotateY(0deg); } to { transform: rotateY(360deg); } }
        .animate-spin-3d { animation: spin-slow 4s linear infinite; perspective: 1000px; }
        .pixel-border { border: 4px solid #000; image-rendering: pixelated; }
        .cloud { position: absolute; background: white; border-radius: 50px; opacity: 0.8; z-index: 0; }
        .cloud:before, .cloud:after { content: ''; position: absolute; background: white; border-radius: 50px; }
        .cloud-1 { width: 100px; height: 30px; top: 10%; left: 10%; animation: drift 40s linear infinite; }
        .cloud-1:before { width: 50px; height: 50px; top: -25px; left: 15px; }
        .cloud-1:after { width: 40px; height: 40px; top: -15px; right: 15px; }
        .cloud-2 { width: 140px; height: 40px; top: 30%; right: -20%; animation: drift 60s linear infinite; }
        .cloud-2:before { width: 70px; height: 70px; top: -35px; left: 20px; }
        .cloud-2:after { width: 60px; height: 60px; top: -25px; right: 20px; }
        @keyframes drift { from { transform: translateX(-100vw); } to { transform: translateX(100vw); } }
      `}} />

      <div className="cloud cloud-1"></div>
      <div className="cloud cloud-2"></div>

      <header className="relative w-full border-b-[6px] border-black z-10">
        <div className="absolute inset-0 bg-cover bg-center z-0 opacity-40" style={{ backgroundImage: `url(${bannerUrl})`, imageRendering: 'pixelated' }}></div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#5c94fc] z-0"></div>
        <div className="relative z-10 container mx-auto px-4 py-16 flex flex-col items-center text-center">
          <div className="mb-6 relative animate-float">
            <div className="w-40 h-40 rounded-full bg-yellow-400 mario-shadow flex items-center justify-center pixel-border overflow-hidden p-1">
              <img src={logoUrl} alt="MARIO Logo" className="w-full h-full rounded-full object-cover animate-spin-3d" />
            </div>
          </div>
          <h1 className="text-5xl md:text-7xl mb-4 text-[#FBD000] drop-shadow-[4px_4px_0_#000] tracking-widest">$MARIO</h1>
          <div className="bg-[#E52521] px-6 py-4 rounded-xl pixel-border mario-shadow transform -rotate-2 mt-4 max-w-2xl">
            <h2 className="text-xl md:text-2xl leading-relaxed text-white">Mario the game that never dies</h2>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 mt-12 relative z-10 space-y-12">
        <div className="flex flex-col md:flex-row justify-center items-center gap-6">
          <a href={buyLink} target="_blank" rel="noopener noreferrer" className="w-full md:w-auto bg-[#43B047] text-white px-8 py-5 text-lg md:text-xl pixel-border mario-shadow flex items-center justify-center gap-3 transition-transform hover:bg-[#348a37]"><Gamepad2 size={28} />BUY ON AXIOM</a>
          <a href={xLink} target="_blank" rel="noopener noreferrer" className="w-full md:w-auto bg-black text-white px-8 py-5 text-lg md:text-xl pixel-border mario-shadow flex items-center justify-center gap-3 transition-transform hover:bg-gray-900"><Twitter size={28} />X COMMUNITY</a>
        </div>

        <section className="max-w-4xl mx-auto">
          <div className="bg-[#f8d878] p-6 md:p-10 pixel-border mario-shadow relative">
            <div className="absolute top-3 left-3 w-3 h-3 bg-black rounded-full"></div><div className="absolute top-3 right-3 w-3 h-3 bg-black rounded-full"></div>
            <div className="absolute bottom-3 left-3 w-3 h-3 bg-black rounded-full"></div><div className="absolute bottom-3 right-3 w-3 h-3 bg-black rounded-full"></div>
            <h3 className="text-black text-xl md:text-2xl mb-6 text-center">TOKEN CA</h3>
            <div className="flex flex-col md:flex-row gap-4 items-center">
              <div className="flex-1 bg-white text-black p-4 pixel-border w-full overflow-hidden"><p className="text-xs md:text-sm lg:text-base break-all text-center select-all">{CA}</p></div>
              <button onClick={handleCopy} className="w-full md:w-auto bg-[#E52521] text-white px-6 py-4 pixel-border mario-shadow-sm flex items-center justify-center gap-2 hover:bg-[#c91d19] transition-colors whitespace-nowrap">{copied ? <Check size={20} /> : <Copy size={20} />}{copied ? "COPIED!" : "COPY"}</button>
            </div>
          </div>
        </section>

        {/* Meme Machine Section */}
        <section className="max-w-4xl mx-auto mt-20">
          <h2 className="text-3xl md:text-4xl text-[#FBD000] text-center mb-8 drop-shadow-[4px_4px_0_#000]">MEME MACHINE</h2>
          <div className="flex flex-col md:flex-row gap-8 items-start">
            <div className="w-full md:w-1/2 flex justify-center">
              <div className="relative w-full max-w-sm aspect-square bg-[#5c94fc] pixel-border mario-shadow overflow-hidden group">
                {isGenerating && (
                  <div className="absolute inset-0 z-30 bg-black/70 flex flex-col items-center justify-center">
                    <Loader2 className="animate-spin text-white mb-4" size={48} /><p className="text-white text-xs text-center animate-pulse">CRAFTING MEME...</p>
                  </div>
                )}
                
                {!memeGenerated && !isGenerating && (
                  <div className="absolute inset-0 z-10 bg-black/40 flex flex-col items-center justify-center p-6 border-4 border-dashed border-white/20 m-4 text-center">
                    <RefreshCw size={48} className="mb-4 opacity-50" />
                    <p className="text-sm">MEME CANVAS EMPTY</p>
                    <p className="text-[10px] mt-2 opacity-70">Click 'AI GENERATE MEME'</p>
                  </div>
                )}

                {memeGenerated && (
                  <>
                    <img src={memeImageUrl} alt="Meme Background" className="absolute inset-0 w-full h-full object-cover object-center" style={{ imageRendering: 'pixelated' }} />
                    <div className="absolute inset-0 bg-black/20 z-10"></div>
                    <div className="absolute top-4 w-full px-4 text-center z-20">
                      <h3 className="text-white text-3xl md:text-4xl uppercase" style={{ fontFamily: 'Impact, sans-serif', WebkitTextStroke: '1px black' }}>{memeTopText}</h3>
                    </div>
                    <div className="absolute bottom-4 w-full px-4 text-center z-20">
                      <h3 className="text-white text-3xl md:text-4xl uppercase" style={{ fontFamily: 'Impact, sans-serif', WebkitTextStroke: '1px black' }}>{memeBottomText}</h3>
                    </div>
                  </>
                )}
              </div>
            </div>
            <div className="w-full md:w-1/2 bg-[#f8d878] p-6 pixel-border mario-shadow space-y-4 text-black">
              <div>
                <label className="block text-xs mb-1">TOP TEXT:</label>
                <input type="text" value={memeTopText} onChange={(e) => setMemeTopText(e.target.value)} className="w-full p-2 pixel-border" />
              </div>
              <div>
                <label className="block text-xs mb-1">BOTTOM TEXT:</label>
                <input type="text" value={memeBottomText} onChange={(e) => setMemeBottomText(e.target.value)} className="w-full p-2 pixel-border" />
              </div>
              <button onClick={generateRandomMeme} disabled={isGenerating} className="w-full bg-[#E52521] text-white p-4 pixel-border mario-shadow-sm flex items-center justify-center gap-2">
                {isGenerating ? <Loader2 className="animate-spin" /> : <RefreshCw />} AI GENERATE MEME
              </button>
            </div>
          </div>
        </section>

        {/* Game Section */}
        <section className="max-w-4xl mx-auto mt-20">
          <h2 className="text-3xl md:text-4xl text-[#FBD000] text-center mb-8 drop-shadow-[4px_4px_0_#000]">PLAY & EARN</h2>
          <div className="bg-black p-4 pixel-border mario-shadow flex flex-col items-center min-h-[400px] justify-center">
            {gameState === "start" && (
              <div className="flex flex-col items-center max-w-md w-full gap-4">
                <Trophy size={48} className="text-yellow-400" />
                <div className="flex w-full">
                  <span className="bg-[#f8d878] text-black px-4 py-3 pixel-border border-r-0">@</span>
                  <input type="text" placeholder="X username" value={username} onChange={(e) => setUsername(e.target.value.replace('@',''))} className="w-full p-3 pixel-border text-black focus:outline-none" />
                </div>
                <button onClick={startGame} className="w-full bg-[#43B047] text-white p-4 pixel-border mario-shadow-sm flex items-center justify-center gap-2">
                  <Play /> START RUN
                </button>
              </div>
            )}
            {gameState === "playing" && (
              <iframe src="/mario-game/index.html" className="w-full h-[400px] pixel-border bg-black" title="Mario Game" />
            )}
            {gameState === "gameover" && (
              <div className="text-center space-y-4">
                <h3 className="text-red-500 text-3xl">GAME OVER</h3>
                <p>@{username}</p>
                <p className="text-2xl text-yellow-400">SCORE: {score}</p>
                <button onClick={() => setGameState("start")} className="bg-[#E52521] text-white p-4 pixel-border mario-shadow-sm">TRY AGAIN</button>
              </div>
            )}
          </div>
        </section>
      </main>

      <footer className="mt-20 border-t-4 border-black bg-[#E52521] py-8 text-center text-xs opacity-80">
        <p>$MARIO is a meme coin created for entertainment. No intrinsic value.</p>
        <p className="mt-2">© {new Date().getFullYear()} $MARIO Coin.</p>
      </footer>
    </div>
  );
};

export default App;
