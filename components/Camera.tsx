import React, { useRef, useEffect, useState, useCallback } from 'react';

interface CameraProps {
  onCapture: (imageSrc: string) => void;
  onClose: () => void;
}

export const Camera: React.FC<CameraProps> = ({ onCapture, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [error, setError] = useState<string>('');

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } // Prefer back camera for classroom view
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      setError('Unable to access camera. Please allow permissions.');
      console.error(err);
    }
  }, []);

  useEffect(() => {
    startCamera();
    return () => {
      // Cleanup stream
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [startCamera]);

  const handleCapture = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      if (context) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageSrc = canvas.toDataURL('image/jpeg', 0.8);
        onCapture(imageSrc);
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      <div className="relative flex-1 bg-black flex items-center justify-center overflow-hidden">
        {error ? (
          <div className="text-white p-6 text-center">
            <p className="text-red-500 text-xl mb-2">⚠</p>
            {error}
            <button onClick={onClose} className="mt-4 text-blue-400 underline">Go Back</button>
          </div>
        ) : (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}
        
        {/* Overlay Grid for Alignment */}
        {!error && (
          <div className="absolute inset-0 pointer-events-none opacity-30">
            <div className="w-full h-full border-4 border-white/20 grid grid-cols-3 grid-rows-3">
              <div className="border-r border-b border-white/20"></div>
              <div className="border-r border-b border-white/20"></div>
              <div className="border-b border-white/20"></div>
              <div className="border-r border-b border-white/20"></div>
              <div className="border-r border-b border-white/20 flex items-center justify-center">
                <div className="w-12 h-12 border border-white/50 rounded-full"></div>
              </div>
              <div className="border-b border-white/20"></div>
              <div className="border-r border-white/20"></div>
              <div className="border-r border-white/20"></div>
              <div className=""></div>
            </div>
          </div>
        )}
      </div>

      <div className="h-32 bg-gray-900 flex items-center justify-around pb-6 px-6">
        <button 
          onClick={onClose}
          className="text-white p-4 rounded-full bg-gray-800 active:bg-gray-700"
        >
          Cancel
        </button>
        
        <button
          onClick={handleCapture}
          className="w-20 h-20 rounded-full bg-white border-4 border-gray-300 flex items-center justify-center active:scale-95 transition-transform"
        >
          <div className="w-16 h-16 rounded-full bg-blue-600 border-2 border-white"></div>
        </button>

        <div className="w-16"></div> {/* Spacer for symmetry */}
      </div>

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};