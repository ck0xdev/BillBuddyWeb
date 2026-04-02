import React from 'react';

export default function DayScroller({ currentDay, onDayChange, scheduledDays = [] }) {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Mobile', 'Natubhai'];

  return (
    <div className="no-scrollbar container" style={{ 
      display: 'flex', 
      gap: 10, 
      overflowX: 'auto', 
      padding: '4px 0 20px', 
      width: '100%',
      // borderBottom: '1px solid var(--border-light)' 
    }}>
      {days.map(day => {
        const isActive = currentDay === day;
        const isScheduled = scheduledDays.includes(day);
        
        return (
          <button
            key={day}
            onClick={() => onDayChange(day)}
            style={{
              flex: '0 0 60px',
              height: 44,
              borderRadius: '14px',
              background: isActive ? 'var(--primary)' : 'var(--surface)',
              border: isActive ? 'none' : '1px solid var(--border)',
              boxShadow: isActive ? '0 4px 12px rgba(0, 122, 255, 0.3)' : 'none',
              color: isActive ? 'white' : 'var(--text-secondary)',
              fontWeight: 700,
              fontSize: 14,
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
            }}
          >
            {day}
            {isScheduled && !isActive && (
              <span style={{ 
                position: 'absolute', 
                bottom: 6, 
                width: 4, 
                height: 4, 
                borderRadius: '50%', 
                background: 'var(--primary-light)' 
              }}></span>
            )}
          </button>
        );
      })}
    </div>
  );
}
/* No separate stats.jsx file modification needed here as I'll consolidate stats styling in Dashboard.jsx for better control */