import React from "react";

const LetterAnim = ({ text }) => {
  const handleMouseEnter = (e) => {
    const letters = e.currentTarget.querySelectorAll("span");
    letters.forEach((letter, i) => {
      letter.style.transition = `transform 0.3s ease ${i * 50}ms, color 0.3s ease ${i * 50}ms`;
      letter.style.transform = "translateY(-10px)";
      letter.style.color = "#CDEDE6"; 

      
      setTimeout(() => {
        letter.style.transform = "translateY(0)";
        letter.style.color = "#dec3ffff"; 
      }, 300 + i * 50);
    });
  };

  return (
    <h1
      className="font-bbh text-8xl text-center mb-5 flex justify-center cursor-pointer animate-glow"
      onMouseEnter={handleMouseEnter}
      style={{ textShadow: '0 0 3px #ddc2fc, 0 0 6px #ddc2fc' }}
    >
      {text.split("").map((char, i) => (
        <span key={i} className="inline-block text-[#B2D8CE]">
          {char}
        </span>
      ))}
    </h1>
  );
};

export default LetterAnim;
