// HoldButton.tsx
import React, { useState, useRef } from 'react';

interface HoldButtonProps {
    onHoldComplete: () => void; // This method is provided by the parent and called on successful hold
}

const HoldButton: React.FC<HoldButtonProps> = ({ onHoldComplete }) => {
    const [progress, setProgress] = useState(0);
    const timeoutRef = useRef<number | null>(null);
    const intervalRef = useRef<number | null>(null);

    const circumference = 2 * Math.PI * 40; // Circle radius is 40

    const startProgress = () => {
        // Clear any existing timers
        if (timeoutRef.current !== null) clearTimeout(timeoutRef.current);
        if (intervalRef.current !== null) clearInterval(intervalRef.current);

        timeoutRef.current = window.setTimeout(() => {
            // Call the onHoldComplete function passed from the parent
            onHoldComplete();
            setProgress(100);
            clearInterval(intervalRef.current);
        }, 3000); // 3 seconds

        intervalRef.current = window.setInterval(() => {
            setProgress(prevProgress => {
                if (prevProgress >= 100) {
                    clearInterval(intervalRef.current);
                    return 100;
                }
                return prevProgress + (100 / 30);
            });
        }, 100);
    };

    const resetProgress = () => {
        if (timeoutRef.current !== null) clearTimeout(timeoutRef.current);
        if (intervalRef.current !== null) clearInterval(intervalRef.current);
        setProgress(0);
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100px', marginTop: "10px" }}>
            <button
                onTouchStart={startProgress}
                onTouchEnd={resetProgress}
                onTouchMove={resetProgress}
                style={{
                    position: 'relative',
                    width: '100px',
                    height: '100px',
                    borderRadius: '50%',
                    border: 'none',
                    backgroundColor: '#007BFF',
                    color: 'white',
                    fontSize: '16px',
                    outline: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden'
                }}
            >
                Hold To Confirm
                <svg
                    style={{ position: 'absolute', top: '0', left: '0', width: '100%', height: '100%' }}
                    viewBox="0 0 100 100"
                >
                    <circle
                        stroke="white"
                        strokeWidth="4"
                        fill="transparent"
                        r="40"
                        cx="50"
                        cy="50"
                        strokeDasharray={`${circumference} ${circumference}`}
                        strokeDashoffset={(1 - progress / 100) * circumference}
                        style={{ transition: 'stroke-dashoffset 0.1s linear' }}
                    />
                </svg>
            </button>
        </div>
    );
}

export default HoldButton;
