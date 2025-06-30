import React, { useState, useEffect, useRef } from 'react';
import '@/styles/coustem.css';

interface FocusOverlayProps {
  onClose: () => void;
}

export const FocusOverlay: React.FC<FocusOverlayProps> = ({ onClose }) => {
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [totalTime, setTotalTime] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [mode, setMode] = useState<'focus' | 'break'>('focus');
  const [focusText, setFocusText] = useState('');
  const [closing, setClosing] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const setCookie = (name: string, value: string, days = 1) => {
    const expires = new Date(Date.now() + days * 864e5).toUTCString();
    document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/`;
  };

  const getCookie = (name: string): string | undefined => {
    return document.cookie
      .split('; ')
      .find(row => row.startsWith(name + '='))
      ?.split('=')[1];
  };

  const clearTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  useEffect(() => {
    if (isRunning) {
      clearTimer();
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearTimer();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearTimer();
    }
    return clearTimer;
  }, [isRunning]);

  const formatTime = (seconds: number) => {
    const m = String(Math.floor(seconds / 60)).padStart(2, '0');
    const s = String(seconds % 60).padStart(2, '0');
    return `${m}:${s}`;
  };

  const switchToFocus = () => {
    if (mode === 'focus') return; // Prevent reinitializing focus mode
    if (focusText.trim() === '') {
      alert('Please enter your focus task first.');
      return;
    }

    const savedLeft = parseInt(getCookie('focusTimeLeft') || '');
    const savedTotal = parseInt(getCookie('focusTotalTime') || '');

    const newTimeLeft = !isNaN(savedLeft) ? savedLeft : 25 * 60;
    const newTotal = !isNaN(savedTotal) ? savedTotal : 25 * 60;

    setTimeLeft(newTimeLeft);
    setTotalTime(newTotal);
    clearTimer();
    setMode('focus');
    setIsRunning(false);
  };

  const switchToBreak = () => {
    if (mode === 'break') return; // ✅ Prevent reset if already in break mode

    if (focusText.trim() === '') {
      alert('Please enter your focus task first.');
      return;
    }

    // Save current focus session
    setCookie('focusTimeLeft', timeLeft.toString());
    setCookie('focusTotalTime', totalTime.toString());

    // Initialize break session
    setTimeLeft(5 * 60);
    setTotalTime(5 * 60);
    clearTimer();
    setMode('break');
    setIsRunning(false);
  };

  const handleFocusTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    setFocusText(input);
    const timestamp = new Date().toISOString();
    setCookie('focusNote', `${timestamp} - ${input}`);
  };

  const handleClose = () => {
    setCookie('focusTimeLeft', timeLeft.toString());
    setCookie('focusTotalTime', totalTime.toString());

    setClosing(true);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  const progress = Math.max(0, ((totalTime - timeLeft) / totalTime) * 100);
  const circleRadius = 90;
  const circleCircumference = 2 * Math.PI * circleRadius;
  const strokeDashoffset = circleCircumference * (1 - progress / 100);

  return (
    <div
      className={`fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-[100000] p-4 transition-opacity duration-300 ${
        closing ? 'animate-fadeOut' : 'animate-fadeIn'
      }`}
    >
      <div
        className={`relative bg-[var(--background)] w-[90vw] h-[90vh] max-w-4xl rounded-lg shadow-2xl p-8 flex flex-col items-center justify-center text-center border border-[var(--border-color)] transform transition-transform duration-300 ${
          closing ? 'animate-scaleOut' : 'animate-scaleIn'
        }`}
      >
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-4xl font-bold leading-none cursor-pointer p-2"
          aria-label="Close overlay"
        >
          &times;
        </button>

        {/* Mode Switch Buttons */}
        <div className="absolute top-4 left-4 flex gap-3">
          <button
            onClick={switchToFocus}
            className={`px-4 py-2 rounded-lg border text-white cursor-pointer ${
              mode === 'focus' ? 'border-white' : 'border-gray-500'
            } bg-transparent hover:bg-white hover:text-black`}
          >
            Focus
          </button>
          <button
            onClick={switchToBreak}
            className={`px-4 py-2 rounded-lg border text-white cursor-pointer ${
              mode === 'break' ? 'border-white' : 'border-gray-500'
            } bg-transparent hover:bg-white hover:text-black`}
          >
            Break
          </button>
        </div>

        {/* Circular Timer */}
        {mode === 'focus' ? (
          <div className="relative w-60 h-60 mb-6">
            <svg
              className="absolute top-0 left-0 w-full h-full transform -rotate-90"
              viewBox="0 0 200 200"
            >
              <circle
                cx="100"
                cy="100"
                r={circleRadius}
                stroke="#374151"
                strokeWidth="12"
                fill="none"
              />
              <circle
                cx="100"
                cy="100"
                r={circleRadius}
                stroke="#10b981"
                strokeWidth="12"
                fill="none"
                strokeDasharray={circleCircumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                className="transition-all duration-500"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <p className="text-6xl font-extrabold text-[var(--text-primary)] select-none">
                {formatTime(timeLeft)}
              </p>
            </div>
          </div>
        ) : (
          <p className="text-6xl font-extrabold text-[var(--text-primary)] select-none mb-6">
            {formatTime(timeLeft)}
          </p>
        )}

        {/* Start / Pause */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => {
              if (focusText.trim() === '') {
                alert('Please enter your focus task first.');
                return;
              }
              clearTimer();
              setIsRunning(true);
            }}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg shadow-md text-lg cursor-pointer"
          >
            Start
          </button>
          <button
            onClick={() => {
              clearTimer();
              setIsRunning(false);
            }}
            className="bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-2 rounded-lg shadow-md text-lg cursor-pointer"
          >
            Pause
          </button>
        </div>

        {/* Input Field */}
        <input
          type="text"
          value={focusText}
          onChange={handleFocusTextChange}
          placeholder="I will focus on ..."
          className="px-4 py-2 w-full max-w-md border rounded-lg text-lg bg-transparent text-white placeholder-white border-white"
          required
        />
      </div>
    </div>
  );
};
