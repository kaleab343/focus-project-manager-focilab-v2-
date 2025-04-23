import { useState, useEffect } from 'react';

interface ClockProps {
  userName?: string;
}

export const Clock: React.FC<ClockProps> = ({ userName = 'kirubel' }) => {
  const [time, setTime] = useState<Date>(new Date());
  const [greeting, setGreeting] = useState<string>('');

  useEffect(() => {
    // Update time every second
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    // Update greeting based on time of day
    const updateGreeting = () => {
      const hour = time.getHours();
      if (hour < 12) return 'Good Morning';
      if (hour < 18) return 'Good Afternoon';
      return 'Good Evening';
    };

    setGreeting(updateGreeting());

    return () => clearInterval(timer);
  }, [time]);

  const formatTime = (): { hours: string; minutes: string; seconds: string; ampm: string } => {
    const hours = time.getHours() % 12 || 12;
    const minutes = time.getMinutes().toString().padStart(2, '0');
    const seconds = time.getSeconds().toString().padStart(2, '0');
    const ampm = time.getHours() >= 12 ? 'PM' : 'AM';
    
    return {
      hours: hours.toString(),
      minutes,
      seconds,
      ampm
    };
  };

  const formatDate = (): string => {
    return time.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric'
    });
  };

  const timeData = formatTime();

  return (
    <div className="text-center font-['Kanit',sans-serif]" style={{
      position: 'absolute',
      top: '47%',
      left: '50%',
      transform: 'translate(-50%, -50%)'
    }}>
      <h2 className="text-[1.3rem] font-light">{`${greeting}, ${userName}`}</h2>
      <div className="font-['Kanit',sans-serif] flex items-end justify-center">
        
        <span className="text-[7rem] font-light leading-none mr-2">{timeData.hours}:{timeData.minutes}</span>
        <div className="flex flex-col items-start">
          <span className="text-[3rem] font-light leading-none">{timeData.ampm}</span>
          <span className="text-[3rem] font-light leading-none">{timeData.seconds}</span>
        </div>
      </div>
      <div className="text-[1.3rem] text-[var(--text-secondary)]">{formatDate()}</div>
    </div>
  );
};
