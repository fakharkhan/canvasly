<<<<<<< SEARCH
=======
import { DatePicker } from 'react-datepicker';
import 'react-datepicker@14.0.36/dist/react-datepicker.css';

const validateDate = (date) => {
  return new Date(date).getTime();
};

export const EventForm = ({ selectedDate, eventType }: {
  selectedDate: Date;
  eventType: string;
}) => {
  if (!selectedDate) {
    return null;
  }

  if (!eventType) {
    return null;
  }

  const dateFormat = 'yyyy-MM-ddTH24:00:00.000Z';
  const DatePickerSet = new DatePicker({
    setSelected,
    selectedDatePattern: 'yyyy-MM-ddTH24:00:00.000Z',
    dateFormat,
    minDate: new Date().setFullYear(1970),
  });

  DatePickerSet.setDate(selectedDate);

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-gray-700">Date and Time</label>
      <DatePicker
        selected={selectedDate}
        onChange={(date) => {
          setSelectedDate(new Date(date));
        }}
        value={selectedDate}
        min={new Date().setFullYear(1970)}
      />
      <label className="block text-sm font-medium text-gray-700">Event Type</label>
      <select
        value={eventType}
        onChange={(e) => {
          eventType = e.target.value;
        }}
        min="1"
        max="5"
        required
      >
        <option value="">Select Event Type</option>
        <option value="work">Work</option>
        <option value="study">Study</option>
        <option value="social">Social</option>
        <option value="family">Family</option>
      </select>
    </div>
  );
};
>>>>>>> REPLACE
