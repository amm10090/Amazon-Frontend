"use client";

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface CountdownTimerProps {
    endTime: Date | string;
    onComplete?: () => void;
    className?: string;
}

interface TimeLeft {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
}

export function CountdownTimer({ endTime, onComplete, className = '' }: CountdownTimerProps) {
    const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0 });
    const [isCompleted, setIsCompleted] = useState(false);

    useEffect(() => {
        // 确保endTime是Date对象
        const targetDate = typeof endTime === 'string' ? new Date(endTime) : endTime;

        // 每秒更新一次倒计时
        const interval = setInterval(() => {
            const now = new Date();
            const difference = targetDate.getTime() - now.getTime();

            if (difference <= 0) {
                clearInterval(interval);
                setIsCompleted(true);
                onComplete?.();
                return;
            }

            // 计算剩余时间
            const days = Math.floor(difference / (1000 * 60 * 60 * 24));
            const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((difference % (1000 * 60)) / 1000);

            setTimeLeft({ days, hours, minutes, seconds });
        }, 1000);

        // 组件卸载时清除interval
        return () => clearInterval(interval);
    }, [endTime, onComplete]);

    // 数字翻转动画变体
    const numberVariants = {
        initial: { y: 0 },
        changed: {
            y: [0, -10, 0],
            transition: { duration: 0.3, ease: "easeInOut" }
        }
    };

    // 霓虹灯脉冲动画变体
    const pulseVariants = {
        pulse: {
            boxShadow: [
                "0 0 5px rgba(255, 107, 107, 0.7), 0 0 20px rgba(255, 107, 107, 0.5)",
                "0 0 10px rgba(255, 107, 107, 0.9), 0 0 30px rgba(255, 107, 107, 0.7)",
                "0 0 5px rgba(255, 107, 107, 0.7), 0 0 20px rgba(255, 107, 107, 0.5)",
            ],
            transition: {
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
            }
        }
    };

    if (isCompleted) {
        return (
            <div className={`text-center ${className}`}>
                <p className="text-primary font-bold">活动已结束!</p>
            </div>
        );
    }

    // 渲染倒计时时间块
    const TimeBlock = ({ value, label }: { value: number, label: string }) => (
        <motion.div
            className="flex flex-col items-center mx-1 sm:mx-2"
            variants={pulseVariants}
            animate="pulse"
        >
            <motion.div
                className="bg-gradient-primary rounded-lg w-12 h-14 sm:w-16 sm:h-20 flex items-center justify-center shadow-neon text-white font-bold text-xl sm:text-2xl"
                key={value}
                variants={numberVariants}
                initial="initial"
                animate="changed"
            >
                {value.toString().padStart(2, '0')}
            </motion.div>
            <span className="text-xs sm:text-sm mt-1 text-text-light">{label}</span>
        </motion.div>
    );

    return (
        <div className={`flex flex-col items-center ${className}`}>
            <motion.h3
                className="text-lg sm:text-xl font-bold mb-3 text-primary"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
            >
                限时抢购，先到先得！
            </motion.h3>

            <div className="flex justify-center items-center">
                {timeLeft.days > 0 && (
                    <TimeBlock value={timeLeft.days} label="天" />
                )}
                <TimeBlock value={timeLeft.hours} label="时" />
                <TimeBlock value={timeLeft.minutes} label="分" />
                <TimeBlock value={timeLeft.seconds} label="秒" />
            </div>
        </div>
    );
} 