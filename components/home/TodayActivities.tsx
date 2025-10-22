'use client';

import { useState, useEffect } from 'react';

interface Activity {
  id: string;
  type: string;
  duration: number;
  distance?: number;
  category?: string;
  notes?: string;
}

const activityConfig = {
  cycling: { icon: '🚴', color: 'blue', label: 'Cycling' },
  running: { icon: '🏃', color: 'red', label: 'Running' },
  gym: { icon: '💪', color: 'purple', label: 'Gym' },
  swimming: { icon: '🏊', color: 'cyan', label: 'Swimming' },
  yoga: { icon: '🧘', color: 'green', label: 'Yoga' },
  walking: { icon: '🚶', color: 'gray', label: 'Walking' },
};

export default function TodayActivities() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  
  useEffect(() => {
    fetchTodayActivities();
  }, []);
  
  const fetchTodayActivities = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const response = await fetch(`/api/activities?date=${today}`);
      const data = await response.json();
      setActivities(data);
    } catch (error) {
      console.error('Error fetching activities:', error);
    }
  };
  
  const getActivityCard = (type: keyof typeof activityConfig) => {
    const config = activityConfig[type];
    const activity = activities.find(a => a.type === type);
    
    const colorClasses = {
      blue: activity ? 'border-blue-400 dark:border-blue-600' : 'border-gray-200 dark:border-gray-700',
      red: activity ? 'border-red-400 dark:border-red-600' : 'border-gray-200 dark:border-gray-700',
      purple: activity ? 'border-purple-400 dark:border-purple-600' : 'border-gray-200 dark:border-gray-700',
      cyan: activity ? 'border-cyan-400 dark:border-cyan-600' : 'border-gray-200 dark:border-gray-700',
      green: activity ? 'border-green-400 dark:border-green-600' : 'border-gray-200 dark:border-gray-700',
      gray: activity ? 'border-gray-400 dark:border-gray-600' : 'border-gray-200 dark:border-gray-700',
    };
    
    const textColorClasses = {
      blue: 'text-blue-600 dark:text-blue-400',
      red: 'text-red-600 dark:text-red-400',
      purple: 'text-purple-600 dark:text-purple-400',
      cyan: 'text-cyan-600 dark:text-cyan-400',
      green: 'text-green-600 dark:text-green-400',
      gray: 'text-gray-600 dark:text-gray-400',
    };
    
    return (
      <div 
        key={type}
        className={`bg-white dark:bg-gray-800 rounded-xl p-4 border-2 ${
          colorClasses[config.color as keyof typeof colorClasses]
        } ${
          !activity && 'opacity-60'
        } transition-all hover:shadow-lg cursor-pointer`}
      >
        <div className="text-3xl mb-2">{config.icon}</div>
        <div className="font-semibold text-gray-900 dark:text-white text-sm mb-1">
          {config.label}
        </div>
        {activity ? (
          <>
            <div className={`text-lg font-bold ${textColorClasses[config.color as keyof typeof textColorClasses]}`}>
              {activity.duration} min
            </div>
            {activity.distance && (
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {activity.distance} km
              </div>
            )}
            {activity.category && (
              <div className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                {activity.category}
              </div>
            )}
          </>
        ) : (
          <div className="text-xs text-gray-400 dark:text-gray-500">
            No activity
          </div>
        )}
      </div>
    );
  };
  
  return (
    <div className="mt-8">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
          🏋️ Today&apos;s Activities
        </h3>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors text-sm"
        >
          ➕ Log Activity
        </button>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {(Object.keys(activityConfig) as Array<keyof typeof activityConfig>).map(type => 
          getActivityCard(type)
        )}
      </div>
      
      {/* Add Activity Modal - implement this next if needed */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
              Log Activity
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Activity logging modal coming soon! For now, use the admin panel to add activities.
            </p>
            <button
              onClick={() => setShowAddModal(false)}
              className="w-full px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-lg font-medium transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
