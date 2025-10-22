'use client';

interface SummaryStatsProps {
  type: 'steps' | 'calories';
  todayValue: number;
  weekAverage: number;
  bestDay: number;
  streak?: number;
}

export default function HealthSummaryStats({ 
  type, 
  todayValue, 
  weekAverage, 
  bestDay, 
  streak 
}: SummaryStatsProps) {
  const isSteps = type === 'steps';
  const unit = isSteps ? 'steps' : 'cal';
  const icon = isSteps ? '👟' : '🔥';
  
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
      {/* Today */}
      <div className={`${
        isSteps 
          ? 'bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-purple-200 dark:border-purple-700/50' 
          : 'bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 border-orange-200 dark:border-orange-700/50'
      } rounded-xl p-4 border-2`}>
        <div className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1">
          Today
        </div>
        <div className={`text-2xl sm:text-3xl font-black ${
          isSteps 
            ? 'text-purple-600 dark:text-purple-400' 
            : 'text-orange-600 dark:text-orange-400'
        }`}>
          {todayValue.toLocaleString()}
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          {unit}
        </div>
      </div>
      
      {/* 7-Day Average */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border-2 border-gray-200 dark:border-gray-700">
        <div className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1">
          7-Day Avg
        </div>
        <div className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white">
          {weekAverage.toLocaleString()}
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          {unit}
        </div>
      </div>
      
      {/* Best Day */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border-2 border-gray-200 dark:border-gray-700">
        <div className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1">
          Best Day
        </div>
        <div className="text-2xl sm:text-3xl font-black text-green-600 dark:text-green-400">
          {bestDay.toLocaleString()}
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          {unit}
        </div>
      </div>
      
      {/* Streak (for steps) or Weekly Total (for calories) */}
      <div className="bg-gradient-to-br from-yellow-50 to-orange-100 dark:from-yellow-900/20 dark:to-orange-800/20 rounded-xl p-4 border-2 border-yellow-200 dark:border-yellow-700/50">
        <div className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1">
          {isSteps ? 'Streak' : 'Weekly Total'}
        </div>
        <div className="text-2xl sm:text-3xl font-black text-yellow-600 dark:text-yellow-400 flex items-center gap-2">
          {isSteps ? (
            <>
              <span>🔥</span>
              <span>{streak || 0}</span>
            </>
          ) : (
            <span>{(weekAverage * 7).toLocaleString()}</span>
          )}
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          {isSteps ? 'days' : 'cal'}
        </div>
      </div>
    </div>
  );
}
