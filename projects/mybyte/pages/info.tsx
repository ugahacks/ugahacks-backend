import React from "react";
import { Orbitron, Inter } from 'next/font/google'; //fonts from figma

const orbitron = Orbitron({ 
  subsets: ['latin'], 
  weight: '900' 
});

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '700']
});

export default function CadathonInfo() {
  return (
    <div className="relative w-screen h-screen bg-[#111111] text-white flex flex-col justify-center pt-14 pb-24 px-8 md:px-44 overflow-hidden">
      {/* background image */}
      <div className="absolute inset-0 bg-[url('/infoPageBackground.png')] bg-cover bg-center opacity-180 z-0"></div>

      <div className="relative z-10 w-full max-w-[850px] flex flex-col items-start">
        
        {/* main heading */}
        <h1 className={`text-10xl md:text-[80px] text-[#96D827] mb-5 leading-[1.3] tracking-[0.05em] ${orbitron.className}`}>
          What is a<br />CADathon?
        </h1>

        {/* green box with text + paragraph */}
        <div className="bg-[#3e511d] rounded-3xl px-6 py-4 md:px-8 md:py-5 shadow-xl w-full max-w-[1000px]">
        <p className={`text-2xl md:text-[32px] leading-[1.2] tracking-[0.02em] font-medium text-[#F4F0E6] [text-shadow:0px_4px_4px_rgba(0,0,0,0.5)] ${inter.className}`}>
  The UGAHacks CAD-a-thon is a <span className="font-bold">36 hour design competition</span>  designed to bridge the gap between academic theory and industry-standard application. By pivoting from the traditional "task-based" Makeathon to a <span className="font-bold">"project-based"</span> CAD-a-thon, we aim to provide a high-intensity environment where students can master professional-grade, cloud-native design tools while solving complex, real-world design challenges.
</p>
        </div>

      </div>
    </div>
  );
}