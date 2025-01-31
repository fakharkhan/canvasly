<<<<<<< SEARCH
=======
import React from 'react';
import Inertia from 'inertiajs';

const EventList = ({ events }: { events: Array<{ id: string; date: Date; type: string; title: string; description: string }> }) => {
  return (
    <div className="space-y-4">
      {events.map((event) => (
        <div key={event.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
          <h3 className="font-medium text-gray-700">{event.type}</h3>
          <div className="flex items-center gap-4">
            <div className="relative">
              <span className="absolute -bottom-2 right-2 bg-blue-500 text-white rounded-full px-2 py-1 text-xs font-medium block w-6 h-6 flex items-center justify-center text-vertically-center">
                {event.date.toLocaleDateString()}
              </span>
            </div>
            <div className="flex-1">
              <h4 className="font-medium text-gray-700">{event.title}</h4>
              <p className="text-sm text-gray-500 truncate">{event.description}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
>>>>>>> REPLACE
