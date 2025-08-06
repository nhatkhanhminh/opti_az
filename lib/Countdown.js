import React, { useState, useEffect, useCallback } from 'react';

function Countdown({ endTimestamp, showZero = true, format = '{d}d {h}h {m}m {s}s' }) {
  const calculateTimeLeft = useCallback(() => {
    if (!endTimestamp || isNaN(endTimestamp)) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    }

    const difference = endTimestamp - new Date().getTime();
  
    if (difference <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    }

    return {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
      minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
      seconds: Math.floor((difference % (1000 * 60)) / 1000)
    };
  }, [endTimestamp]);

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [calculateTimeLeft]);

  const formatTime = useCallback(() => {
    let result = format;
    const { days, hours, minutes, seconds } = timeLeft;

    if (days > 0) {
      result = `${days}d ${hours.toString().padStart(2, '0')}h ${minutes.toString().padStart(2, '0')}m ${seconds.toString().padStart(2, '0')}s`;
    } else {
      result = `${hours.toString().padStart(2, '0')}h ${minutes.toString().padStart(2, '0')}m ${seconds.toString().padStart(2, '0')}s`;
    }

    if (days === 0 && hours === 0 && minutes === 0 && seconds === 0) {
      return 'Completed';
    }

    return result.trim();
  }, [timeLeft, format]);

  return <div>{formatTime()}</div>;
}

export default Countdown;