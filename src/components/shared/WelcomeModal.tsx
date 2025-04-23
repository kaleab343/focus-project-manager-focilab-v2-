import React, { useState, KeyboardEvent } from 'react';

interface WelcomeModalProps {
  onComplete: (userData: UserData) => void;
}

export interface UserData {
  name: string;
  vision: string;
  yearlyGoal: string;
}

export const WelcomeModal: React.FC<WelcomeModalProps> = ({ onComplete }) => {
  const [step, setStep] = useState<number>(1);
  const [userData, setUserData] = useState<UserData>({
    name: '',
    vision: '',
    yearlyGoal: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setUserData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      onComplete(userData);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSkip = () => {
    if (step === 2) {
      // Skip vision step
      setStep(3);
    } else if (step === 3) {
      // Skip yearly goal step and complete onboarding
      onComplete(userData);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    // If Enter is pressed and it's the name input (step 1)
    if (e.key === 'Enter' && step === 1 && userData.name.trim().length > 0) {
      e.preventDefault(); // Prevent default form submission
      handleNext();
    }
  };

  const isStepComplete = () => {
    switch (step) {
      case 1:
        return userData.name.trim().length > 0;
      case 2:
      case 3:
        // Always allow next/complete for vision and yearly goals
        // since users can skip these steps
        return true;
      default:
        return false;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-[#0B0F17] w-[80vw] h-[80vh] rounded-xl shadow-lg flex flex-col p-8 text-white">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold ">Welcome to Focilab</h2>
          <div className="flex gap-2">
            <div className={`h-2 w-12 rounded-full ${step === 1 ? 'bg-blue-500' : 'bg-gray-600'}`}></div>
            <div className={`h-2 w-12 rounded-full ${step === 2 ? 'bg-blue-500' : 'bg-gray-600'}`}></div>
            <div className={`h-2 w-12 rounded-full ${step === 3 ? 'bg-blue-500' : 'bg-gray-600'}`}></div>
          </div>
        </div>

        <div className="flex-grow flex flex-col justify-center items-center">
          {step === 1 && (
            <div className="w-full max-w-md">
              <h3 className="text-2xl mb-6 text-center">What's your name?</h3>
              <input
                type="text"
                name="name"
                value={userData.name}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder="Enter your name"
                className="w-full p-4 rounded bg-[#161B26] border border-gray-700 focus:outline-none focus:border-blue-500 text-lg font-inter"
                autoFocus
              />
              <p className="mt-4 text-gray-400 text-center font-['system-ui'] text-lg leading-relaxed">
                We'll use this to personalize your experience
              </p>
            </div>
          )}

          {step === 2 && (
            <div className="w-full max-w-md">
              <h3 className="text-2xl mb-6 text-center font-inter font-semibold">What's your vision?</h3>
              <textarea
                name="vision"
                value={userData.vision}
                onChange={handleInputChange}
                placeholder="Describe your long-term vision..."
                className="w-full p-4 rounded bg-[#161B26] border border-gray-700 focus:outline-none focus:border-blue-500 text-lg h-40 resize-none font-inter"
                autoFocus
              />
              <p className="mt-4 text-gray-400 text-center font-['system-ui'] text-lg leading-relaxed">
                Your vision will guide your goals and daily actions
              </p>
              <button
                onClick={handleSkip}
                className="mt-4 text-gray-400 hover:text-gray-300 text-sm font-inter font-medium underline underline-offset-2 mx-auto block transition-colors"
              >
                Skip for now
              </button>
            </div>
          )}

          {step === 3 && (
            <div className="w-full max-w-md">
              <h3 className="text-2xl mb-6 text-center">What's your yearly goal?</h3>
              <textarea
                name="yearlyGoal"
                value={userData.yearlyGoal}
                onChange={handleInputChange}
                placeholder="What do you want to achieve this year?"
                className="w-full p-4 rounded bg-[#161B26] border border-gray-700 focus:outline-none focus:border-blue-500 text-lg h-40 resize-none font-inter"
                autoFocus
              />
              <p className="mt-4 text-gray-400 text-center font-['system-ui'] text-lg leading-relaxed">
                Setting a clear yearly goal helps you stay focused
              </p>
              <button
                onClick={handleSkip}
                className="mt-4 text-gray-400 hover:text-gray-300 text-sm font-inter font-medium underline underline-offset-2 mx-auto block transition-colors"
              >
                Skip for now
              </button>
            </div>
          )}
        </div>

        <div className="flex justify-between mt-8">
          {step > 1 ? (
            <button
              onClick={handleBack}
              className="px-6 py-3 rounded bg-gray-700 hover:bg-gray-600 transition-colors font-inter font-medium"
            >
              Back
            </button>
          ) : (
            <div></div> /* Empty div for spacing */
          )}
          
          <button
            onClick={handleNext}
            disabled={!isStepComplete()}
            className={`px-6 py-3 rounded font-inter font-medium ${
              isStepComplete()
                ? 'bg-blue-600 hover:bg-blue-500'
                : 'bg-gray-700 cursor-not-allowed opacity-50'
            } transition-colors`}
          >
            {step === 3 ? 'Get Started' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  );
};
