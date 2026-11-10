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
  gym: { icon: '💪', color: 'blue', label: 'Gym' },
  swimming: { icon: '🏊', color: 'blue', label: 'Swimming' },
  yoga: { icon: '🧘', color: 'blue', label: 'Yoga' },
  walking: { icon: '🚶', color: 'blue', label: 'Walking' },
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
      blue: activity ? 'border-riso-blue' : 'border-riso-blue',
      red: activity ? 'border-riso-red' : 'border-riso-blue',
    };
    
    const textColorClasses = {
      blue: 'text-riso-blue',
      red: 'text-riso-red',
    };
    
    return (
      <div 
        key={type}
        className={`bg-slip p-4 border-2 ${
          colorClasses[config.color as keyof typeof colorClasses]
        } ${
          !activity && 'opacity-60'
        } cursor-pointer`}
      >
        <div className="text-3xl mb-2">{config.icon}</div>
        <div className="t-label text-base text-ink mb-1">
          {config.label}
        </div>
        {activity ? (
          <>
            <div className={`t-title nums text-lg ${textColorClasses[config.color as keyof typeof textColorClasses]}`}>
              {activity.duration} min
            </div>
            {activity.distance && (
              <div className="text-sm text-riso-blue">
                {activity.distance} km
              </div>
            )}
            {activity.category && (
              <div className="text-sm text-riso-blue capitalize">
                {activity.category}
              </div>
            )}
          </>
        ) : (
          <div className="text-sm text-riso-blue/70">
            No activity
          </div>
        )}
      </div>
    );
  };
  
  return (
    <div className="mt-8">
      <div className="flex items-center justify-between mb-4">
        <h3 className="t-title text-xl text-ink">
          Today&apos;s activities
        </h3>
        <button
          onClick={() => setShowAddModal(true)}
          className="btn min-h-[44px]"
        >
          Log activity
        </button>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {(Object.keys(activityConfig) as Array<keyof typeof activityConfig>).map(type => 
          getActivityCard(type)
        )}
      </div>
      
      {/* Add Activity Modal - implement this next if needed */}
      {showAddModal && (
        <div className="fixed inset-0 bg-ink/40 flex items-center justify-center z-50 p-4">
          <div className="bg-slip border-2 border-riso-blue p-6 max-w-md w-full">
            <h3 className="t-title text-xl mb-4 text-ink">
              Log Activity
            </h3>
            <p className="text-riso-blue mb-4">
              Activity logging modal coming soon! For now, use the admin panel to add activities.
            </p>
            <button
              onClick={() => setShowAddModal(false)}
              className="btn btn-line w-full min-h-[44px]"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
