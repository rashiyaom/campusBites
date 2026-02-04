"use client";

import React, { useState, useEffect } from 'react';
import { Clock, AlertCircle, CheckCircle2, Timer } from 'lucide-react';

interface OrderTimeTrackerProps {
  orderId: string;
  status: string;
  estimatedTime: string;
  createdAt: Date;
  updatedAt: Date;
  onSetEstimatedTime?: (minutes: number) => void;
}

export const OrderTimeTracker: React.FC<OrderTimeTrackerProps> = ({
  orderId,
  status,
  estimatedTime,
  createdAt,
  updatedAt,
  onSetEstimatedTime,
}) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showETAInput, setShowETAInput] = useState(false);
  const [etaMinutes, setEtaMinutes] = useState('');

  // Update current time every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  // Calculate time in current status
  const getStatusTime = () => {
    const updated = new Date(updatedAt);
    const diffMs = currentTime.getTime() - updated.getTime();
    return Math.floor(diffMs / 60000); // Minutes
  };

  // Calculate total time since order creation
  const getTotalTime = () => {
    const created = new Date(createdAt);
    const diffMs = currentTime.getTime() - created.getTime();
    return Math.floor(diffMs / 60000); // Minutes
  };

  // Extract estimated minutes from estimatedTime string
  const getEstimatedMinutes = () => {
    const match = estimatedTime.match(/(\d+)/);
    return match ? parseInt(match[1]) : 15;
  };

  // Check if order is late
  const isLate = () => {
    const totalTime = getTotalTime();
    const estimated = getEstimatedMinutes();
    return totalTime > estimated + 5; // 5 minute buffer
  };

  // Get progress percentage
  const getProgress = () => {
    const totalTime = getTotalTime();
    const estimated = getEstimatedMinutes();
    return Math.min((totalTime / estimated) * 100, 100);
  };

  const statusTime = getStatusTime();
  const totalTime = getTotalTime();
  const estimatedMinutes = getEstimatedMinutes();
  const late = isLate();
  const progress = getProgress();

  // Format time display
  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const handleSetETA = () => {
    const minutes = parseInt(etaMinutes);
    if (minutes > 0 && onSetEstimatedTime) {
      onSetEstimatedTime(minutes);
      setShowETAInput(false);
      setEtaMinutes('');
    }
  };

  return (
    <div className="space-y-3">
      {/* Time Info Row */}
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <Clock size={14} className="text-gray-400" />
          <span className="text-gray-600 dark:text-gray-400">
            In <span className="font-bold text-gray-900 dark:text-white">{status}</span> for {formatTime(statusTime)}
          </span>
        </div>
        <div className={`flex items-center gap-1.5 font-bold ${
          late ? 'text-red-600 dark:text-red-400' : 'text-gray-600 dark:text-gray-400'
        }`}>
          {late ? (
            <>
              <AlertCircle size={14} />
              <span>Late by {formatTime(totalTime - estimatedMinutes)}</span>
            </>
          ) : totalTime >= estimatedMinutes ? (
            <>
              <CheckCircle2 size={14} className="text-green-600" />
              <span className="text-green-600">On time</span>
            </>
          ) : (
            <span>{formatTime(estimatedMinutes - totalTime)} remaining</span>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="relative">
        <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-500 ${
              late 
                ? 'bg-red-500' 
                : progress > 80 
                  ? 'bg-yellow-500' 
                  : 'bg-green-500'
            }`}
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex justify-between mt-1 text-[10px] text-gray-500 dark:text-gray-400">
          <span>Created {formatTime(totalTime)} ago</span>
          <span>ETA: {estimatedMinutes}m</span>
        </div>
      </div>

      {/* ETA Management */}
      {status === 'preparing' && (
        <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
          {!showETAInput ? (
            <button
              onClick={() => setShowETAInput(true)}
              className="flex items-center gap-1.5 text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium"
            >
              <Timer size={12} />
              Update ETA
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={etaMinutes}
                onChange={(e) => setEtaMinutes(e.target.value)}
                placeholder="Minutes"
                className="w-20 px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                autoFocus
              />
              <button
                onClick={handleSetETA}
                className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 font-medium"
              >
                Set
              </button>
              <button
                onClick={() => {
                  setShowETAInput(false);
                  setEtaMinutes('');
                }}
                className="px-2 py-1 text-xs text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      )}

      {/* Status Timeline Indicator */}
      <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${
            status === 'pending' ? 'bg-yellow-500 animate-pulse' :
            status === 'preparing' ? 'bg-blue-500 animate-pulse' :
            status === 'ready' ? 'bg-green-500 animate-pulse' :
            status === 'completed' ? 'bg-gray-400' :
            'bg-red-500'
          }`} />
          <span className="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-wider font-bold">
            {status}
          </span>
        </div>
        <span className="text-[10px] text-gray-400 dark:text-gray-500">
          Order #{orderId.slice(0, 8)}
        </span>
      </div>
    </div>
  );
};

export default OrderTimeTracker;
