import { useEffect, useMemo, useState } from "react";
import { Event, getEvents } from "../interfaces/event";

const ManageEvents: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [titleFilter, setTitleFilter] = useState("");
  const [isAscending, setIsAscending] = useState(true);

  const sortedEvents = useMemo(() => {
    const sorted = events.sort((a, b) => {
      const timeA = a.timestamp.toDate().getTime();
      const timeB = b.timestamp.toDate().getTime();
      return isAscending ? timeA - timeB : timeB - timeA;
    });
    return sorted.filter((e) => {
      return e.title.toLowerCase().includes(titleFilter.toLowerCase());
    });
  }, [events, isAscending, titleFilter]);

  useEffect(() => {
    getEvents().then((newEvents) => {
      setEvents(newEvents);
    });
  }, []);

  return (
    <div className="max-w-6xl mx-auto p-6 min-h-screen">
      {/* Header & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <h1 className="text-3xl font-bold text-gray-800 tracking-tight">
          Manage Events
        </h1>
        <div className="flex items-center -space-x-px w-full md:w-auto self-end gap-2">
          <div className="relative w-full md:w-80">
            <input
              type="text"
              placeholder="Search by title..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none shadow-sm transition-all"
              onChange={(e) => setTitleFilter(e.target.value)}
            />
            <span className="absolute left-3 top-3 text-gray-400">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </span>
          </div>
          {/* Sort Toggle Button */}
          <button
            onClick={() => setIsAscending(!isAscending)}
            className="flex items-center justify-center p-2.5 bg-white border border-gray-300 rounded-xl shadow-sm hover:bg-gray-50 hover:border-indigo-300 transition-all text-gray-600 group"
            title={isAscending ? "Sort Newest First" : "Sort Oldest First"}
          >
            <div className="flex flex-col items-center justify-center">
              {/* Up Arrow - Highlights when Descending */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className={`h-3 w-3 transition-colors ${!isAscending ? "text-indigo-600" : "text-gray-300"}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={3}
                  d="M5 15l7-7 7 7"
                />
              </svg>
              {/* Down Arrow - Highlights when Ascending */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className={`h-3 w-3 -mt-1 transition-colors ${isAscending ? "text-indigo-600" : "text-gray-300"}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={3}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>
          </button>
        </div>
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedEvents.map((e) => (
          <div
            key={e.id}
            className="flex flex-col bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md transition-shadow overflow-hidden"
          >
            {/* Top Bar: Points & Actions */}
            <div className="flex items-center justify-between px-5 py-3 bg-gray-50 border-b border-gray-100">
              <span className="bg-indigo-100 text-indigo-700 text-xs font-bold px-2.5 py-1 rounded-md uppercase tracking-wide">
                {e.points} Points
              </span>
              <div className="flex items-center gap-1">
                <button className="p-1.5 text-gray-500 hover:text-indigo-600 hover:bg-white rounded-lg transition-all shadow-sm border border-transparent hover:border-gray-200">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                    />
                  </svg>
                </button>
                <button className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-white rounded-lg transition-all shadow-sm border border-transparent hover:border-gray-200">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="p-5 flex-grow">
              {/* Title: Now wraps instead of cutting off */}
              <h2 className="text-lg font-bold text-gray-900 leading-tight whitespace-normal break-words mb-2">
                {e.title}
              </h2>
              <p className="text-gray-600 text-sm leading-relaxed mb-4">
                {e.description}
              </p>
            </div>

            {/* Footer: Date AND Time */}
            <div className="px-5 py-3 bg-white border-t border-gray-50 mt-auto">
              <div className="flex items-center text-gray-400 text-[13px]">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <span>{e.timestamp.toDate().toLocaleDateString()}</span>
                <span className="mx-2">•</span>
                <span>
                  {e.timestamp.toDate().toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ManageEvents;
