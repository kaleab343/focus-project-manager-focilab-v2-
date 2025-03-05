import React, { useState, useEffect } from 'react';

const Vision: React.FC = () => {
  const [visionText, setVisionText] = useState<string>(() => {
    try {
      const storedVision = localStorage.getItem('visionText');
      return storedVision || '';
    } catch (error) {
      console.error('Error loading vision text:', error);
      return '';
    }
  });
  
  // Save data to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('visionText', visionText);
    } catch (error) {
      console.error('Error saving vision text:', error);
    }
  }, [visionText]);
  
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setVisionText(e.target.value);
  };

  return (
    <div className="rounded-lg p-4 w-full bg-[#1A1F2E]">
      <h2 className="mt-0 mb-4 text-2xl text-white">Your Vision</h2>
      <textarea
        placeholder="Write your vision here..."
        value={visionText}
        onChange={handleTextChange}
        className="w-full h-[250px] p-3 rounded bg-[#0B0F17] text-white border-none resize-none focus:outline-none"
      />
    </div>
  );
};

export default Vision; 