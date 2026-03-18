'use client';

import { useEffect, useState } from 'react';

interface TrustScoreGaugeProps {
    score: number; // 0 to 100
    size?: number;
    strokeWidth?: number;
}

export function TrustScoreGauge({ score, size = 120, strokeWidth = 8 }: TrustScoreGaugeProps) {
    const [displayScore, setDisplayScore] = useState(0);

    // Animation
    useEffect(() => {
        const duration = 1500; // ms
        const steps = 60;
        const stepTime = duration / steps;
        const increment = score / steps;

        let current = 0;
        const timer = setInterval(() => {
            current += increment;
            if (current >= score) {
                setDisplayScore(score);
                clearInterval(timer);
            } else {
                setDisplayScore(current);
            }
        }, stepTime);

        return () => clearInterval(timer);
    }, [score]);

    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (displayScore / 100) * circumference;

    // Color logic
    const getColor = (s: number) => {
        if (s >= 90) return '#10B981'; // Emerald-500
        if (s >= 70) return '#3B82F6'; // Blue-500
        if (s >= 50) return '#F59E0B'; // Amber-500
        return '#EF4444'; // Red-500
    };

    const color = getColor(score);

    return (
        <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
            {/* Background Circle */}
            <svg className="transform -rotate-90 w-full h-full">
                <circle
                    className="text-gray-100"
                    strokeWidth={strokeWidth}
                    stroke="currentColor"
                    fill="transparent"
                    r={radius}
                    cx={size / 2}
                    cy={size / 2}
                />
                {/* Progress Circle */}
                <circle
                    stroke={color}
                    strokeWidth={strokeWidth}
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    fill="transparent"
                    r={radius}
                    cx={size / 2}
                    cy={size / 2}
                    className="transition-all duration-300 ease-out"
                />
            </svg>

            {/* Score Text */}
            <div className="absolute flex flex-col items-center">
                <span className="text-3xl font-bold" style={{ color }}>
                    {Math.round(displayScore)}
                </span>
                <span className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">
                    Trust
                </span>
            </div>
        </div>
    );
}
