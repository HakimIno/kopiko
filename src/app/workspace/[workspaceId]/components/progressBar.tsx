import React from 'react';

export const ProgressBar = ({ mainColor = '#D69D78', progress = 60 }) => {
    return (
        <div className="relative mt-4">
            {/* Gradient Background */}
            <div className="w-full h-2 rounded-full bg-gradient-to-r from-gray-100 dark:from-slate-200 via-gray-50 to-gray-100 overflow-hidden shadow-inner relative">
                {/* Animated Gradient Progress */}
                <div
                    className="absolute top-0 left-0 h-full transition-all duration-700 ease-out group-hover:duration-1000 rounded-full"
                    style={{
                        width: `${progress}%`,
                        background: `linear-gradient(90deg, 
              ${mainColor}80,
              ${mainColor}, 
              ${mainColor}80
            )`,
                        boxShadow: `0 0 10px ${mainColor}50`,
                        animation: 'shimmer 2s infinite linear'
                    }}
                >
                    {/* Shine Effect */}
                    <div
                        className="absolute top-0 left-0 w-full h-full"
                        style={{
                            background: `linear-gradient(90deg,
                transparent 0%,
                rgba(255,255,255,0.2) 50%,
                transparent 100%)`,
                            animation: 'shine 2s infinite linear'
                        }}
                    />
                </div>

                {/* Glowing Dots */}
                <div
                    className="absolute top-1/2 -translate-y-1/2"
                    style={{
                        left: `${progress}%`,
                        transform: 'translate(-50%, -50%)'
                    }}
                >
                    <div
                        className="w-3 h-3 rounded-full animate-pulse"
                        style={{
                            backgroundColor: mainColor,
                            boxShadow: `0 0 10px ${mainColor}, 0 0 20px ${mainColor}80`,
                            animation: 'glow 1.5s infinite alternate'
                        }}
                    />
                </div>
            </div>

            {/* Progress Text */}
            <div className="absolute -top-5 text-xs transition-all duration-500"
                style={{
                    left: `${progress}%`,
                    transform: 'translateX(-50%)',
                    color: mainColor
                }}
            >
                {progress}%
            </div>

            <style jsx>{`
        @keyframes shimmer {
          0% {
            background-position: -200% center;
          }
          100% {
            background-position: 200% center;
          }
        }

        @keyframes shine {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }

        @keyframes glow {
          0% {
            opacity: 0.5;
            transform: scale(0.8);
          }
          100% {
            opacity: 1;
            transform: scale(1.2);
          }
        }
      `}</style>
        </div>
    );
};