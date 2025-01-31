<<<<<<< SEARCH
=======
import React, { useState } from 'react';
import Inertia from 'inertiajs';
import './EventForm';
import './EventList';

const App = () => {
  const [store] = Inertia.create({
    getRootProps: () => {},
    actions: [
      { id: 'initialize', name: 'Initialize' },
    ],
  });

  const { selectedDate, eventType } = store.get('events');

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-3xl font-bold text-center mb-8">Event Scheduler</h1>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-xl font-semibold mb-4">Create New Event</h2>
          <EventForm selectedDate={selectedDate} eventType={eventType} />
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-xl font-semibold mb-4">List of Events</h2>
          <EventList events={() => []} />
        </div>
      </div>
    </div>
  );
};

export default App;
>>>>>>> REPLACE
