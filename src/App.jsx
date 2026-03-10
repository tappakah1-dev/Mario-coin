import React, { useState, useEffect } from 'react';
import { Copy, Check, Twitter, Gamepad2, RefreshCw, Loader2, Trophy, Play } from 'lucide-react';

const App = () => {
  const [copied, setCopied] = useState(false);
  const [memeTopText, setMemeTopText] = useState("");
  const [memeBottomText, setMemeBottomText] = useState("");
  const [memeImageUrl, setMemeImageUrl] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [memeGenerated, setMemeGenerated] = useState(false);

  // --- GAME STATE ---
  const [username, setUsername] = useState("");
  const [gameState, setGameState] = useState("start");
  const [score, setScore] = useState(0);

  const CA = "3reTzfqE1LkGsXFmi3oNtGSsYwnXZs6sPYtQapTvpump";
  const xLink = "https://x.com/i/communities/1998507708064936273";
  const buyLink = "https://axiom.trade/@dumacuk";
  const logoUrl = "https://chunk.cc.gatech.edu/AY2015/cs4475_summer/projects/spinning/coin.jpg";
  const bannerUrl = "https://pbs.twimg.com/community_banner_img/1998760374267523072/m9GVVXkD?format=jpg&name=small";

  const topTextOptions = ["WHEN YOU BUY THE DIP", "DEV DOING SOMETHING", "LOOKING FOR THE NEXT 100X", "HOLDING $MARIO LIKE"];
  const bottomTextOptions = ["MAMMA MIA!", "WE ARE SO BACK", "STRAIGHT TO THE MOON"];

  const generateRandomMeme = async () => {
    if (isGenerating) return;
    setIsGenerating(true);
    
    // SAFETY BRIDGE for API Key access
    let apiKey = "";
    try {
      // This is the standard Vite way to access variables
      apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    } catch (e) {
      // Fallback for environments that don't support import.meta
      apiKey = "";
    }

    if (!apiKey) {
      setMemeTopText("API KEY ERROR");
      setMemeBottomText("CHECK VERCEL VARS");
      setIsGenerating(false);
      return;
    }

    let currentTop = memeTopText.trim() || topTextOptions[Math.floor(Math.random() * topTextOptions.length)];
    let currentBottom = memeBottomText.trim() || bottomTextOptions[Math.floor(Math.random() * bottomTextOptions.length)];
    setMemeTopText(currentTop);
    setMemeBottomText(currentBottom);

    const fetchWithRetry = async (url, options, retries = 5) => {
        const delays = [1000, 2000, 4000, 8000, 16000];
        for (let i = 0; i < retries; i++) {
          try {
            const res = await fetch(url, options);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            return await res.json();
          } catch (err) {
            if (i === retries - 1) throw err;
            await new Promise(resolve => setTimeout(resolve, delays[i]));
          }
        }
    };

    try {
      // 1. GENERATE THE PROMPT
      const textUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
      const textPayload = {
        contents: [{ parts: [{ text: `Create a funny image prompt for a Mario crypto meme: "${currentTop} ${currentBottom}". Style: Retro 8-bit pixel art. Return JSON with 'imagePrompt' key only.` }] }],
        generationConfig: { responseMimeType: "application/json", responseSchema: { type: "OBJECT", properties: { imagePrompt: { type: "STRING" } } } }
      };

      const textData = await fetchWithRetry(textUrl, { method: 'POST', body: JSON.stringify(textPayload) });
      const { imagePrompt } = JSON.parse(textData.candidates[0].content.parts[0].text);

      // 2. GENERATE THE IMAGE
      const imageUrl = `https://generativelanguage.googleapis.com/v1beta/models/imagen-4.0-generate-001:predict?key=${apiKey}`;
      const imagePayload = { instances: { prompt: imagePrompt }, parameters: { sampleCount: 1 } };
      
      const imageData = await fetchWithRetry(imageUrl, { method: 'POST', body: JSON.stringify(imagePayload) });

      if (imageData.predictions?.[0]) {
        setMemeImageUrl(`data:image/png;base64,${imageData.predictions[0].bytesBase64Encoded}`);
        setMemeGenerated(true);
      }
    } catch (err) {
      console.error(err);
      setMemeTopText("AI ERROR");
      setMemeBottomText("TRY AGAIN");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(CA);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  useEffect(() => {
    const handleMessage = (event) => {
      if (event.data?.type === 'MARIO_GAME_OVER') {
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
    <div className="min-h-screen bg-[#5c94fc] text-white selection:bg-red-500 overflow-x-hidden pb-20 font-sans">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');
        .pixel-font { font-family: 'Press Start 2P', cursive; }
        .mario-border { border: 4px solid black; box-shadow: 6px 6px 0px black; }
        .mario-border:active { transform: translate(2px, 2px); box-shadow: 4px 4px 0px black; }
      `}</style>

      <header className="relative py-16 flex flex-col items-center text-center border-b-8 border-black bg-cover bg-center" style={{backgroundImage: `url(${bannerUrl})`}}>
        <div className="absolute inset-0 bg-blue-600/40"></div>
        <div className="relative z-10 flex flex-col items-center">
          <img src={logoUrl} className="w-28 h-28 rounded-full mario-border mb-6 bg-yellow-400" alt="logo" />
          <h1 className="text-5xl pixel-font text-yellow-400 drop-shadow-lg">$MARIO</h1>
          <p className="mt-4 bg-red-600 px-4 py-2 mario-border inline-block pixel-font text-[10px]">THE GAME NEVER DIES</p>
        </div>
      </header>

      <main className="container mx-auto px-4 mt-10 space-y-12 max-w-4xl">
        <div className="flex flex-wrap justify-center gap-4">
          <a href={buyLink} target="_blank" className="bg-green-500 p-4 mario-border pixel-font text-xs flex items-center gap-2 transition-all">
            <Gamepad2 size={18} /> BUY $MARIO
          </a>
          <a href={xLink} target="_blank" className="bg-black p-4 mario-border pixel-font text-xs flex items-center gap-2 transition-all">
            <Twitter size={18} /> X FEED
          </a>
        </div>

        <div className="bg-yellow-300 p-6 mario-border text-black">
          <h2 className="pixel-font text-[10px] text-center mb-4">CONTRACT ADDRESS</h2>
          <div className="flex gap-2">
            <div className="flex-1 bg-white p-3 border-2 border-black break-all font-mono text-[10px] flex items-center">{CA}</div>
            <button onClick={handleCopy} className="bg-red-500 text-white px-4 mario-border">
              {copied ? <Check size={18} /> : <Copy size={18} />}
            </button>
          </div>
        </div>

        <section className="bg-white/10 p-6 mario-border">
          <h2 className="text-xl pixel-font text-center mb-8 text-yellow-300">MEME MACHINE</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="mario-border aspect-square bg-blue-900 flex items-center justify-center relative overflow-hidden">
              {isGenerating ? <Loader2 className="animate-spin text-white w-10 h-10" /> : (
                memeGenerated ? (
                  <>
                    <img src={memeImageUrl} className="absolute inset-0 w-full h-full object-cover" alt="meme" />
                    <div className="absolute top-4 w-full text-center px-2">
                      <h3 className="text-white text-2xl uppercase font-black" style={{WebkitTextStroke: '1px black'}}>{memeTopText}</h3>
                    </div>
                    <div className="absolute bottom-4 w-full text-center px-2">
                      <h3 className="text-white text-2xl uppercase font-black" style={{WebkitTextStroke: '1px black'}}>{memeBottomText}</h3>
                    </div>
                  </>
                ) : <p className="pixel-font text-[8px] opacity-50">MEME PREVIEW</p>
              )}
            </div>
            <div className="space-y-4 flex flex-col justify-center">
              <input type="text" placeholder="TOP TEXT" value={memeTopText} onChange={e => setMemeTopText(e.target.value)} className="w-full p-3 border-4 border-black text-black text-xs pixel-font" />
              <input type="text" placeholder="BOTTOM TEXT" value={memeBottomText} onChange={e => setMemeBottomText(e.target.value)} className="w-full p-3 border-4 border-black text-black text-xs pixel-font" />
              <button onClick={generateRandomMeme} disabled={isGenerating} className="w-full bg-red-600 p-4 mario-border pixel-font text-xs">
                {isGenerating ? "CRAFTING..." : "AI GENERATE"}
              </button>
            </div>
          </div>
        </section>

        <section className="bg-black/20 p-6 mario-border text-center">
          <h2 className="text-xl pixel-font mb-8 text-yellow-300">PLAY & EARN</h2>
          <div className="bg-black mario-border p-4 min-h-[350px] flex flex-col items-center justify-center">
            {gameState === 'start' && (
              <div className="space-y-6 w-full max-w-xs">
                <input type="text" placeholder="X USERNAME" value={username} onChange={e => setUsername(e.target.value)} className="w-full p-3 border-4 border-black text-black text-xs pixel-font" />
                <button onClick={startGame} className="bg-green-500 w-full p-4 mario-border pixel-font text-xs flex items-center justify-center gap-2">
                  <Play size={18} /> START RUN
                </button>
              </div>
            )}
            {gameState === 'playing' && (
              <iframe src="/mario-game/index.html" className="w-full h-[350px] bg-black" title="game" />
            )}
            {gameState === 'gameover' && (
              <div className="space-y-6">
                <h3 className="text-2xl text-red-500 pixel-font">GAME OVER</h3>
                <p className="pixel-font text-sm">SCORE: {score}</p>
                <button onClick={() => setGameState('start')} className="bg-yellow-400 text-black p-4 mario-border pixel-font text-[10px]">RETRY</button>
              </div>
            )}
          </div>
        </section>
      </main>

      <footer className="mt-20 py-8 text-center text-[8px] pixel-font opacity-60">
        <p>$MARIO IS A MEME. NO VALUE. JUST FUN.</p>
      </footer>
    </div>
  );
};

export default App;
