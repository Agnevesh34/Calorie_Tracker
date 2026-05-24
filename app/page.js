"use client";
import { useState } from "react";

export default function Home() {
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  
  // New States for the Text Search
  const [foodName, setFoodName] = useState("");
  const [amount, setAmount] = useState(1);
  const [unit, setUnit] = useState("serving(s)");

  const analyzeFood = async (base64Str, description) => {
    setLoading(true);
    setData(null); 
    
    try {
      const res = await fetch("/api/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          imageBase64: base64Str,
          foodDescription: description 
        }),
      });
      
      const result = await res.json();
      if (result.error) alert("API Error: " + result.error);
      else setData(result); 
    } catch (err) {
      alert("Network error: Failed to reach the backend.");
    } finally {
      setLoading(false);
    }
  };

  // Triggered when user clicks "Calculate" on the text inputs
  const handleTextSubmit = () => {
    if (!foodName) {
      alert("Please enter a food name!");
      return;
    }
    const fullDescription = `${amount} ${unit} of ${foodName}`;
    // Pass null for image, and our generated description string
    analyzeFood(image, fullDescription);
  };

  // Triggered when user uploads a photo
  const handleUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onloadend = () => {
      setImage(reader.result);
      const fullDescription = foodName ? `${amount} ${unit} of ${foodName}` : null;
      analyzeFood(reader.result, fullDescription); 
    };
    reader.readAsDataURL(file);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white flex flex-col items-center justify-center p-6 font-sans">
      <div className="max-w-md w-full space-y-6 text-center">
        
        <h1 className="text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500 tracking-tight pb-1">
          NutriVision
        </h1>
        <p className="text-gray-400 text-sm font-medium">Search by text or snap a photo for macros.</p>
        
        {/* === NEW TEXT SEARCH SECTION === */}
        <div className="bg-gray-800/40 p-4 rounded-2xl border border-gray-700/50 space-y-3 shadow-sm">
          <input 
            type="text" 
            placeholder="What food? (e.g. Chocolate Cake)" 
            value={foodName}
            onChange={(e) => setFoodName(e.target.value)}
            className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
          />
          
          <div className="flex gap-2">
            <input 
              type="number" 
              min="0.1"
              step="any"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-1/3 bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 text-center font-bold"
            />
            <select 
              value={unit} 
              onChange={(e) => setUnit(e.target.value)}
              className="w-2/3 bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 cursor-pointer"
            >
              <option value="serving(s)">Serving(s)</option>
              <option value="grams">Grams (g)</option>
              <option value="kg">Kilograms (kg)</option>
              <option value="ml">Milliliters (ml)</option>
              <option value="liters">Liters (L)</option>
              <option value="oz">Ounces (oz)</option>
              <option value="cups">Cups</option>
              <option value="slices">Slice(s)</option>
            </select>
          </div>

          <button 
            onClick={handleTextSubmit}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl transition-colors shadow-lg"
          >
            Calculate Macros
          </button>
        </div>

        <div className="flex items-center gap-4 py-2">
          <div className="flex-1 h-px bg-gray-800"></div>
          <span className="text-gray-500 text-xs font-bold uppercase tracking-widest">OR</span>
          <div className="flex-1 h-px bg-gray-800"></div>
        </div>

        {/* === UPLOAD SECTION === */}
        <label className="relative flex flex-col items-center justify-center w-full h-20 border-2 border-dashed border-gray-700 bg-gray-800/40 rounded-2xl cursor-pointer hover:bg-gray-800 hover:border-blue-500 transition-all shadow-sm group">
          <span className="text-gray-300 font-semibold flex items-center gap-2 group-hover:text-blue-400 transition-colors">
            📸 Upload Food Photo
          </span>
          <input type="file" className="hidden" onChange={handleUpload} accept="image/*" />
        </label>

        {image && (
          <div className="relative w-full h-48 rounded-2xl overflow-hidden shadow-2xl border border-gray-700/50 ring-2 ring-gray-800 transition-all">
            <img src={image} className="w-full h-full object-cover" alt="Food preview" />
          </div>
        )}

        {loading && (
          <div className="mt-8 text-blue-400 font-bold tracking-widest animate-pulse flex flex-col items-center gap-3">
            <span className="text-4xl">🔍</span>
            ANALYZING...
          </div>
        )}

        {/* === RESULTS CARD === */}
        {data && !loading && (
          <div className="bg-gray-800/60 backdrop-blur-lg p-6 rounded-3xl border border-gray-700/50 shadow-2xl text-left space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-end border-b border-gray-700/50 pb-4 mb-2">
              <span className="text-gray-400 text-sm font-bold tracking-widest uppercase">Calories</span>
              <span className="text-4xl font-black text-white">{data.calories}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-300 font-medium">Protein</span>
              <span className="text-xl font-bold text-emerald-400">{data.protein}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-300 font-medium">Carbs</span>
              <span className="text-xl font-bold text-blue-400">{data.carbs}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-300 font-medium">Fat</span>
              <span className="text-xl font-bold text-red-400">{data.fat}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-300 font-medium">Fiber</span>
              <span className="text-xl font-bold text-amber-500">{data.fiber}</span>
            </div>
            <div className={`mt-6 text-center py-3 rounded-xl font-black uppercase text-sm tracking-widest shadow-inner ${
              data.verdict?.includes("Bulk") ? "bg-purple-500/20 text-purple-300" : "bg-teal-500/20 text-teal-300"
            }`}>
              {data.verdict}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}