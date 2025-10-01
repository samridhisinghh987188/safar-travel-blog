import React from 'react';
import { Calendar, MapPin, Plane, Train, Car, Bus, Hotel, DollarSign, Check, Edit3, Trash2, ChevronDown, ChevronUp, Clock } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';

const TripCard = ({ 
  trip, 
  isCurrentTrip, 
  isExpanded, 
  onView, 
  onEdit, 
  onDelete, 
  onToggleExpand,
  onUpdateChecklist 
}) => {
  // Calculate total budget
  const totalBudget = Object.values(trip.budget || {}).reduce((sum, amount) => {
    if (typeof amount === 'number') return sum + amount;
    return sum + (Number(amount) || 0);
  }, 0);
  
  const currencySymbol = {
    'INR': '₹',
    'USD': '$',
    'EUR': '€',
    'GBP': '£',
    'JPY': '¥'
  }[trip.budget?.currency || 'INR'] || '₹';

  // Get transport icon
  const getTransportIcon = (method) => {
    switch (method?.toLowerCase()) {
      case 'flight': return <Plane className="w-4 h-4" />;
      case 'train': return <Train className="w-4 h-4" />;
      case 'car': return <Car className="w-4 h-4" />;
      case 'bus': return <Bus className="w-4 h-4" />;
      default: return <Plane className="w-4 h-4" />;
    }
  };

  // Calculate trip duration
  const getTripDuration = () => {
    if (!trip.startDate || !trip.endDate) return null;
    const start = new Date(trip.startDate);
    const end = new Date(trip.endDate);
    const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    return days;
  };

  const duration = getTripDuration();

  return (
    <Card 
      className={`group relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${
        isCurrentTrip 
          ? 'ring-2 ring-blue-500 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20' 
          : 'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-750'
      }`}
    >
      {/* Gradient overlay for visual appeal */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
      
      {/* Card Content */}
      <div className="p-6">
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1 cursor-pointer" onClick={onView}>
            <div className="flex items-center space-x-3 mb-2">
              <h3 className="font-bold text-xl text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {trip.destination || 'Untitled Trip'}
              </h3>
              {isCurrentTrip && (
                <span className="bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200 px-2 py-1 rounded-full text-xs font-medium">
                  Current
                </span>
              )}
            </div>
            
            {/* Quick Info Row */}
            <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-300">
              {duration && (
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-1 text-blue-500" />
                  <span>{duration} days</span>
                </div>
              )}
              {trip.transport?.method && (
                <div className="flex items-center">
                  <div className="mr-1 text-purple-500">
                    {getTransportIcon(trip.transport.method)}
                  </div>
                  <span className="capitalize">{trip.transport.method}</span>
                </div>
              )}
              {totalBudget > 0 && (
                <div className="flex items-center">
                  <DollarSign className="w-4 h-4 mr-1 text-green-500" />
                  <span className="font-semibold text-green-600 dark:text-green-400">
                    {currencySymbol}{totalBudget.toLocaleString()}
                  </span>
                </div>
              )}
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              onClick={(e) => { e.stopPropagation(); onEdit(trip); }}
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0 text-blue-600 hover:text-blue-800 hover:bg-blue-50"
            >
              <Edit3 className="w-3 h-3" />
            </Button>
            <Button
              onClick={(e) => { e.stopPropagation(); onDelete(trip.id); }}
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="w-3 h-3" />
            </Button>
          </div>
        </div>

        {/* Travel Dates */}
        {trip.startDate && trip.endDate && (
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 mb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center text-sm">
                <Calendar className="w-4 h-4 mr-2 text-blue-500" />
                <span className="font-medium text-gray-900 dark:text-white">
                  {new Date(trip.startDate).toLocaleDateString()} - {new Date(trip.endDate).toLocaleDateString()}
                </span>
              </div>
              {trip.accommodation?.isBooked && (
                <div className="flex items-center text-xs text-green-600 dark:text-green-400">
                  <Check className="w-3 h-3 mr-1" />
                  <span>Accommodation Booked</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Accommodation Preview */}
        {trip.accommodation?.name && (
          <div className="flex items-center text-sm text-gray-600 dark:text-gray-300 mb-3">
            <Hotel className="w-4 h-4 mr-2 text-green-500" />
            <div className="flex-1">
              <span className="font-medium">{trip.accommodation.name}</span>
              {trip.accommodation.location && (
                <span className="text-gray-500 ml-2">• {trip.accommodation.location}</span>
              )}
            </div>
          </div>
        )}

        {/* Checklist Progress */}
        {trip.checklist && trip.checklist.length > 0 && (
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Travel Checklist</span>
              <span className="text-xs text-gray-500">
                {trip.checklist.filter(item => item.completed).length}/{trip.checklist.length}
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-300"
                style={{ 
                  width: `${(trip.checklist.filter(item => item.completed).length / trip.checklist.length) * 100}%` 
                }}
              ></div>
            </div>
          </div>
        )}

        {/* Expandable Itinerary Section */}
        {trip.itinerary && trip.itinerary.length > 0 && (
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleExpand(trip.id);
              }}
              className="flex items-center justify-between w-full text-left hover:bg-gray-50 dark:hover:bg-gray-700 p-2 rounded-md transition-colors"
            >
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-2 text-purple-500" />
                <span className="font-medium text-gray-900 dark:text-white">
                  Itinerary ({trip.itinerary.reduce((total, day) => total + (day?.length || 0), 0)} activities)
                </span>
              </div>
              {isExpanded ? (
                <ChevronUp className="w-4 h-4 text-gray-500" />
              ) : (
                <ChevronDown className="w-4 h-4 text-gray-500" />
              )}
            </button>

            {isExpanded && (
              <div className="mt-3 space-y-3 max-h-64 overflow-y-auto scrollbar-hide">
                {trip.itinerary.map((dayActivities, dayIndex) => {
                  if (!dayActivities || dayActivities.length === 0) return null;
                  
                  const dayDate = new Date(trip.startDate);
                  dayDate.setDate(dayDate.getDate() + dayIndex);
                  
                  return (
                    <div key={dayIndex} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                      <h5 className="font-medium text-sm text-gray-900 dark:text-white mb-2">
                        Day {dayIndex + 1} - {dayDate.toLocaleDateString()}
                      </h5>
                      <div className="space-y-2">
                        {dayActivities.map((activity, activityIndex) => (
                          <div key={activityIndex} className="flex items-start space-x-2">
                            <Clock className="w-3 h-3 mt-1 text-gray-400 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center space-x-2">
                                <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                                  {activity.time}
                                </span>
                                <span className="text-sm text-gray-900 dark:text-white truncate">
                                  {activity.activity}
                                </span>
                              </div>
                              {activity.location && (
                                <div className="flex items-center mt-1">
                                  <MapPin className="w-3 h-3 mr-1 text-gray-400" />
                                  <span className="text-xs text-gray-500 truncate">
                                    {activity.location}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex justify-between items-center pt-4 mt-4 border-t border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-500">
            {trip.updated_at ? `Updated ${new Date(trip.updated_at).toLocaleDateString()}` : 'Draft'}
          </p>
          <Button
            onClick={(e) => {
              e.stopPropagation();
              onView(trip);
            }}
            variant="ghost"
            size="sm"
            className="text-xs text-blue-600 hover:text-blue-800 hover:bg-blue-50 dark:hover:bg-blue-900/20"
          >
            View Details
          </Button>
        </div>
      </div>

      {/* Hover effect overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
    </Card>
  );
};

export default TripCard;
