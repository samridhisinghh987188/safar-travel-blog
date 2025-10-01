import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, Plus, Trash2, Check, Clock, Plane, Train, Car, Hotel, DollarSign, Save, Edit3, CalendarDays, Bus, ChevronDown, ChevronUp, X } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { toast } from 'react-hot-toast';
import { supabase } from '../lib/supabase';
import ReactCalendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import TripCard from '../components/TripCard';
import { useAuth } from '../contexts/AuthContext';
import { setUserData, getUserData } from '../utils/userStorage';

const TripPlanning = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [savedTrips, setSavedTrips] = useState([]);
  const [currentTripId, setCurrentTripId] = useState(null);
  const [showStartCalendar, setShowStartCalendar] = useState(false);
  const [showEndCalendar, setShowEndCalendar] = useState(false);
  const [showCheckInCalendar, setShowCheckInCalendar] = useState(false);
  const [showCheckOutCalendar, setShowCheckOutCalendar] = useState(false);
  const [expandedTripCards, setExpandedTripCards] = useState({});
  const [showPlanningInterface, setShowPlanningInterface] = useState(false);
  const [selectedTripForModal, setSelectedTripForModal] = useState(null);
  const [tripData, setTripData] = useState({
    // Overview
    destination: '',
    startDate: '',
    endDate: '',
    
    // Itinerary
    itinerary: [],
    
    // Accommodation & Transport
    accommodation: {
      name: '',
      location: '',
      checkIn: '',
      checkOut: '',
      isBooked: false
    },
    transport: {
      method: 'flight',
      details: '',
      time: ''
    },
    
    // Budget
    budget: {
      transport: 0,
      stay: 0,
      food: 0,
      activities: 0,
      currency: 'INR'
    },
    
    // Checklist
    checklist: [
      { id: 1, text: 'Book accommodation', completed: false },
      { id: 2, text: 'Book transport', completed: false },
      { id: 3, text: 'Check visa requirements', completed: false },
      { id: 4, text: 'Pack essentials', completed: false }
    ]
  });

  const tabs = [
    { id: 'overview', label: 'Overview', icon: MapPin },
    { id: 'itinerary', label: 'Itinerary', icon: Calendar },
    { id: 'budget', label: 'Budget', icon: DollarSign }
  ];

  // Calculate total budget
  const totalBudget = Object.values(tripData.budget).reduce((sum, amount) => sum + Number(amount || 0), 0);

  // Generate date range for itinerary
  const getDateRange = () => {
    if (!tripData.startDate || !tripData.endDate) return [];
    
    const start = new Date(tripData.startDate);
    const end = new Date(tripData.endDate);
    const dates = [];
    
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      dates.push(new Date(d));
    }
    
    return dates;
  };

  // Add activity to specific date
  const addActivity = (dateIndex) => {
    const newActivity = {
      id: Date.now(),
      name: '',
      time: '',
      notes: ''
    };
    
    const updatedItinerary = [...tripData.itinerary];
    if (!updatedItinerary[dateIndex]) {
      updatedItinerary[dateIndex] = [];
    }
    updatedItinerary[dateIndex].push(newActivity);
    
    setTripData(prev => ({
      ...prev,
      itinerary: updatedItinerary
    }));
  };

  // Update activity
  const updateActivity = (dateIndex, activityId, field, value) => {
    const updatedItinerary = [...tripData.itinerary];
    const activityIndex = updatedItinerary[dateIndex]?.findIndex(a => a.id === activityId);
    
    if (activityIndex !== -1) {
      updatedItinerary[dateIndex][activityIndex][field] = value;
      setTripData(prev => ({
        ...prev,
        itinerary: updatedItinerary
      }));
    }
  };

  // Remove activity
  const removeActivity = (dateIndex, activityId) => {
    const updatedItinerary = [...tripData.itinerary];
    updatedItinerary[dateIndex] = updatedItinerary[dateIndex]?.filter(a => a.id !== activityId) || [];
    
    setTripData(prev => ({
      ...prev,
      itinerary: updatedItinerary
    }));
  };

  // Add checklist item
  const addChecklistItem = () => {
    const newItem = {
      id: Date.now(),
      text: '',
      completed: false
    };
    
    setTripData(prev => ({
      ...prev,
      checklist: [...prev.checklist, newItem]
    }));
  };

  // Update checklist item
  const updateChecklistItem = (id, field, value) => {
    setTripData(prev => ({
      ...prev,
      checklist: prev.checklist.map(item =>
        item.id === id ? { ...item, [field]: value } : item
      )
    }));
  };

  // Remove checklist item
  const removeChecklistItem = (id) => {
    setTripData(prev => ({
      ...prev,
      checklist: prev.checklist.filter(item => item.id !== id)
    }));
  };

  // Save trip to Supabase and add to saved trips
  const saveTrip = async () => {
    try {
      if (!tripData.destination.trim()) {
        toast.error('Please enter a destination before saving');
        return;
      }

      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        // Save locally if not logged in
        const tripId = Date.now().toString();
        const tripToSave = {
          id: tripId,
          ...tripData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        // Add to saved trips list
        setSavedTrips(prev => {
          const existingIndex = prev.findIndex(trip => trip.destination === tripData.destination);
          if (existingIndex !== -1) {
            // Update existing trip
            const updated = [...prev];
            updated[existingIndex] = tripToSave;
            if (user?.id) {
              setUserData('savedTrips', updated, user.id);
            }
            return updated;
          } else {
            // Add new trip
            const updated = [...prev, tripToSave];
            if (user?.id) {
              setUserData('savedTrips', updated, user.id);
            }
            return updated;
          }
        });

        setCurrentTripId(tripId);
        toast.success('Trip saved locally!');
        return;
      }

      const tripToSave = {
        ...tripData,
        user_id: session.user.id,
        updated_at: new Date().toISOString()
      };

      let savedTripData;

      // Check if updating current trip
      if (currentTripId) {
        const { data: updatedTrip, error: updateError } = await supabase
          .from('trip_plans')
          .update(tripToSave)
          .eq('id', currentTripId)
          .select()
          .single();

        if (updateError) throw updateError;
        savedTripData = updatedTrip;
        toast.success('Trip updated successfully!');
      } else {
        // Create new trip
        const { data: newTrip, error: insertError } = await supabase
          .from('trip_plans')
          .insert([tripToSave])
          .select()
          .single();

        if (insertError) throw insertError;
        savedTripData = newTrip;
        setCurrentTripId(newTrip.id);
        toast.success('Trip saved successfully!');
      }

      // Update saved trips list
      setSavedTrips(prev => {
        const existingIndex = prev.findIndex(trip => trip.id === savedTripData.id);
        if (existingIndex !== -1) {
          const updated = [...prev];
          updated[existingIndex] = savedTripData;
          return updated;
        } else {
          return [...prev, savedTripData];
        }
      });

      // Also save to user-specific storage as backup
      if (user?.id) {
        setUserData('currentTrip', tripData, user.id);
      }
      
      // Return to cards view after saving
      setTimeout(() => {
        setShowPlanningInterface(false);
      }, 1000);
    } catch (error) {
      console.error('Error saving trip:', error);
      // Fallback to localStorage
      const tripId = currentTripId || Date.now().toString();
      const tripToSave = {
        id: tripId,
        ...tripData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      setSavedTrips(prev => {
        const existingIndex = prev.findIndex(trip => trip.id === tripId);
        if (existingIndex !== -1) {
          const updated = [...prev];
          updated[existingIndex] = tripToSave;
          if (user?.id) {
            setUserData('savedTrips', updated, user.id);
          }
          return updated;
        } else {
          const updated = [...prev, tripToSave];
          if (user?.id) {
            setUserData('savedTrips', updated, user.id);
          }
          return updated;
        }
      });

      setCurrentTripId(tripId);
      if (user?.id) {
        setUserData('currentTrip', tripData, user.id);
      }
      toast.success('Trip saved locally!');
      
      // Return to cards view after saving
      setTimeout(() => {
        setShowPlanningInterface(false);
      }, 1000);
    }
  };

  // Load a specific trip for editing
  const loadTrip = (trip) => {
    setTripData({
      destination: trip.destination || '',
      startDate: trip.startDate || '',
      endDate: trip.endDate || '',
      itinerary: trip.itinerary || [],
      accommodation: trip.accommodation || {
        name: '',
        location: '',
        checkIn: '',
        checkOut: '',
        isBooked: false
      },
      transport: trip.transport || {
        method: 'flight',
        details: '',
        time: ''
      },
      budget: trip.budget || {
        transport: 0,
        stay: 0,
        food: 0,
        activities: 0,
        currency: 'INR'
      },
      checklist: trip.checklist || [
        { id: 1, text: 'Book accommodation', completed: false },
        { id: 2, text: 'Book transport', completed: false },
        { id: 3, text: 'Check visa requirements', completed: false },
        { id: 4, text: 'Pack essentials', completed: false }
      ]
    });
    setCurrentTripId(trip.id);
    setActiveTab('overview');
    setShowPlanningInterface(true);
  };

  // View trip details in modal
  const viewTripDetails = (trip) => {
    setSelectedTripForModal(trip);
  };

  // Create new trip
  const createNewTrip = () => {
    setTripData({
      destination: '',
      startDate: '',
      endDate: '',
      itinerary: [],
      accommodation: {
        name: '',
        location: '',
        checkIn: '',
        checkOut: '',
        isBooked: false
      },
      transport: {
        method: 'flight',
        details: '',
        time: ''
      },
      budget: {
        transport: 0,
        stay: 0,
        food: 0,
        activities: 0,
        currency: 'INR'
      },
      checklist: [
        { id: 1, text: 'Book accommodation', completed: false },
        { id: 2, text: 'Book transport', completed: false },
        { id: 3, text: 'Check visa requirements', completed: false },
        { id: 4, text: 'Pack essentials', completed: false }
      ]
    });
    setCurrentTripId(null);
    setActiveTab('overview');
    setShowPlanningInterface(true);
  };

  // Update checklist item for a saved trip
  const updateSavedTripChecklist = async (tripId, checklistItemId, field, value) => {
    try {
      // Update in saved trips state
      setSavedTrips(prev => {
        const updated = prev.map(trip => {
          if (trip.id === tripId) {
            const updatedChecklist = trip.checklist.map(item =>
              item.id === checklistItemId ? { ...item, [field]: value } : item
            );
            return { ...trip, checklist: updatedChecklist };
          }
          return trip;
        });
        if (user?.id) {
          setUserData('savedTrips', updated, user.id);
        }
        return updated;
      });

      // If this is the current trip, also update tripData
      if (currentTripId === tripId) {
        setTripData(prev => ({
          ...prev,
          checklist: prev.checklist.map(item =>
            item.id === checklistItemId ? { ...item, [field]: value } : item
          )
        }));
      }

      // Update in database if logged in
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const tripToUpdate = savedTrips.find(trip => trip.id === tripId);
        if (tripToUpdate) {
          const updatedChecklist = tripToUpdate.checklist.map(item =>
            item.id === checklistItemId ? { ...item, [field]: value } : item
          );
          
          await supabase
            .from('trip_plans')
            .update({ checklist: updatedChecklist })
            .eq('id', tripId);
        }
      }
    } catch (error) {
      console.error('Error updating checklist:', error);
    }
  };

  // Delete a saved trip
  const deleteTrip = async (tripId) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        const { error } = await supabase
          .from('trip_plans')
          .delete()
          .eq('id', tripId);
        
        if (error) throw error;
      }

      // Remove from local state
      setSavedTrips(prev => {
        const updated = prev.filter(trip => trip.id !== tripId);
        if (user?.id) {
          setUserData('savedTrips', updated, user.id);
        }
        return updated;
      });

      // If deleting current trip, reset
      if (currentTripId === tripId) {
        createNewTrip();
      }

      toast.success('Trip deleted successfully');
    } catch (error) {
      console.error('Error deleting trip:', error);
      // Still remove from local state
      setSavedTrips(prev => {
        const updated = prev.filter(trip => trip.id !== tripId);
        if (user?.id) {
          setUserData('savedTrips', updated, user.id);
        }
        return updated;
      });
      toast.success('Trip deleted locally');
    }
  };

  // Load saved trips and current trip on mount
  useEffect(() => {
    if (user?.id) {
      // Load user-specific data
      const savedTripsData = getUserData('savedTrips', user.id, []);
      setSavedTrips(savedTripsData);

      const savedTrip = getUserData('currentTrip', user.id, null);
      if (savedTrip) {
        setTripData(savedTrip);
      }
    } else {
      // Clear data when no user
      setSavedTrips([]);
      setTripData({
        destination: '',
        startDate: '',
        endDate: '',
        itinerary: [],
        accommodation: {
          name: '',
          location: '',
          checkIn: '',
          checkOut: '',
          isBooked: false
        },
        transport: {
          method: 'flight',
          details: '',
          time: ''
        },
        budget: {
          transport: 0,
          stay: 0,
          food: 0,
          activities: 0,
          currency: 'INR'
        },
        checklist: [
          { id: 1, text: 'Book accommodation', completed: false },
          { id: 2, text: 'Book transport', completed: false },
          { id: 3, text: 'Check visa requirements', completed: false },
          { id: 4, text: 'Pack essentials', completed: false }
        ]
      });
    }
  }, [user]);

  // Toggle trip card expansion
  const toggleTripCardExpansion = (tripId) => {
    setExpandedTripCards(prev => ({
      ...prev,
      [tripId]: !prev[tripId]
    }));
  };

  // Go back to cards view
  const goBackToCards = () => {
    setShowPlanningInterface(false);
    setCurrentTripId(null);
    setActiveTab('overview');
    // Reset trip data to default state
    setTripData({
      destination: '',
      startDate: '',
      endDate: '',
      itinerary: [],
      accommodation: {
        name: '',
        location: '',
        checkIn: '',
        checkOut: '',
        isBooked: false
      },
      transport: {
        method: 'flight',
        details: '',
        time: ''
      },
      budget: {
        transport: 0,
        stay: 0,
        food: 0,
        activities: 0,
        currency: 'INR'
      },
      checklist: [
        { id: 1, text: 'Book accommodation', completed: false },
        { id: 2, text: 'Book transport', completed: false },
        { id: 3, text: 'Check visa requirements', completed: false },
        { id: 4, text: 'Pack essentials', completed: false }
      ]
    });
  };

  // Close trip details modal
  const closeTripModal = () => {
    setSelectedTripForModal(null);
  };

  // Close calendars when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.react-calendar-custom') && 
          !event.target.closest('[data-calendar-trigger]')) {
        setShowStartCalendar(false);
        setShowEndCalendar(false);
        setShowCheckInCalendar(false);
        setShowCheckOutCalendar(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const renderOverview = () => (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <MapPin className="w-5 h-5 mr-2 text-blue-500" />
          Destination & Dates
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="destination">Destination</Label>
            <Input
              id="destination"
              placeholder="e.g., Paris, France"
              value={tripData.destination}
              onChange={(e) => setTripData(prev => ({ ...prev, destination: e.target.value }))}
            />
          </div>
          
          <div>
            <Label htmlFor="startDate">Start Date</Label>
            <div className="relative">
              <Input
                id="startDate"
                type="text"
                value={tripData.startDate ? new Date(tripData.startDate).toLocaleDateString() : ''}
                onClick={() => setShowStartCalendar(!showStartCalendar)}
                readOnly
                className="cursor-pointer"
                placeholder="Select start date"
                data-calendar-trigger
              />
              <CalendarDays 
                className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 cursor-pointer"
                onClick={() => setShowStartCalendar(!showStartCalendar)}
                data-calendar-trigger
              />
              {showStartCalendar && (
                <div className="absolute top-full left-0 z-50 mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg">
                  <ReactCalendar
                    onChange={(date) => {
                      const formattedDate = date.toISOString().split('T')[0];
                      setTripData(prev => ({ ...prev, startDate: formattedDate }));
                      setShowStartCalendar(false);
                    }}
                    value={tripData.startDate ? new Date(tripData.startDate + 'T00:00:00') : new Date()}
                    minDate={new Date()}
                    maxDate={new Date(new Date().getFullYear() + 5, 11, 31)}
                    className="react-calendar-custom"
                  />
                </div>
              )}
            </div>
          </div>
          
          <div>
            <Label htmlFor="endDate">End Date</Label>
            <div className="relative">
              <Input
                id="endDate"
                type="text"
                value={tripData.endDate ? new Date(tripData.endDate).toLocaleDateString() : ''}
                onClick={() => setShowEndCalendar(!showEndCalendar)}
                readOnly
                className="cursor-pointer"
                placeholder="Select end date"
                data-calendar-trigger
              />
              <CalendarDays 
                className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 cursor-pointer"
                onClick={() => setShowEndCalendar(!showEndCalendar)}
                data-calendar-trigger
              />
              {showEndCalendar && (
                <div className="absolute top-full left-0 z-50 mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg">
                  <ReactCalendar
                    onChange={(date) => {
                      const formattedDate = date.toISOString().split('T')[0];
                      setTripData(prev => ({ ...prev, endDate: formattedDate }));
                      setShowEndCalendar(false);
                    }}
                    value={tripData.endDate ? new Date(tripData.endDate + 'T00:00:00') : new Date()}
                    minDate={tripData.startDate ? new Date(tripData.startDate + 'T00:00:00') : new Date()}
                    maxDate={new Date(new Date().getFullYear() + 5, 11, 31)}
                    className="react-calendar-custom"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold flex items-center">
            <Hotel className="w-5 h-5 mr-2 text-green-500" />
            Accommodation
          </h3>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="isBooked"
              checked={tripData.accommodation.isBooked}
              onChange={(e) => setTripData(prev => ({
                ...prev,
                accommodation: { ...prev.accommodation, isBooked: e.target.checked }
              }))}
              className="w-4 h-4 text-green-600"
            />
            <Label htmlFor="isBooked" className="text-sm font-medium">
              {tripData.accommodation.isBooked ? 'Booked ✓' : 'Not Booked Yet'}
            </Label>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="accName">Hotel/Accommodation Name</Label>
            <Input
              id="accName"
              placeholder="Hotel name"
              value={tripData.accommodation.name}
              onChange={(e) => setTripData(prev => ({
                ...prev,
                accommodation: { ...prev.accommodation, name: e.target.value }
              }))}
            />
          </div>
          
          <div>
            <Label htmlFor="accLocation">Location</Label>
            <Input
              id="accLocation"
              placeholder="Address or area"
              value={tripData.accommodation.location}
              onChange={(e) => setTripData(prev => ({
                ...prev,
                accommodation: { ...prev.accommodation, location: e.target.value }
              }))}
            />
          </div>
          
          <div>
            <Label htmlFor="checkIn">Check-in Date</Label>
            <div className="relative">
              <Input
                id="checkIn"
                type="text"
                value={tripData.accommodation.checkIn ? new Date(tripData.accommodation.checkIn).toLocaleDateString() : ''}
                onClick={() => setShowCheckInCalendar(!showCheckInCalendar)}
                readOnly
                className="cursor-pointer"
                placeholder="Select check-in date"
                data-calendar-trigger
              />
              <CalendarDays 
                className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 cursor-pointer"
                onClick={() => setShowCheckInCalendar(!showCheckInCalendar)}
                data-calendar-trigger
              />
              {showCheckInCalendar && (
                <div className="absolute top-full left-0 z-50 mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg">
                  <ReactCalendar
                    onChange={(date) => {
                      const formattedDate = date.toISOString().split('T')[0];
                      setTripData(prev => ({
                        ...prev,
                        accommodation: { ...prev.accommodation, checkIn: formattedDate }
                      }));
                      setShowCheckInCalendar(false);
                    }}
                    value={tripData.accommodation.checkIn ? new Date(tripData.accommodation.checkIn + 'T00:00:00') : new Date()}
                    minDate={tripData.startDate ? new Date(tripData.startDate + 'T00:00:00') : new Date()}
                    maxDate={new Date(new Date().getFullYear() + 5, 11, 31)}
                    className="react-calendar-custom"
                  />
                </div>
              )}
            </div>
          </div>
          
          <div>
            <Label htmlFor="checkOut">Check-out Date</Label>
            <div className="relative">
              <Input
                id="checkOut"
                type="text"
                value={tripData.accommodation.checkOut ? new Date(tripData.accommodation.checkOut).toLocaleDateString() : ''}
                onClick={() => setShowCheckOutCalendar(!showCheckOutCalendar)}
                readOnly
                className="cursor-pointer"
                placeholder="Select check-out date"
                data-calendar-trigger
              />
              <CalendarDays 
                className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 cursor-pointer"
                onClick={() => setShowCheckOutCalendar(!showCheckOutCalendar)}
                data-calendar-trigger
              />
              {showCheckOutCalendar && (
                <div className="absolute top-full left-0 z-50 mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg">
                  <ReactCalendar
                    onChange={(date) => {
                      const formattedDate = date.toISOString().split('T')[0];
                      setTripData(prev => ({
                        ...prev,
                        accommodation: { ...prev.accommodation, checkOut: formattedDate }
                      }));
                      setShowCheckOutCalendar(false);
                    }}
                    value={tripData.accommodation.checkOut ? new Date(tripData.accommodation.checkOut + 'T00:00:00') : new Date()}
                    minDate={tripData.accommodation.checkIn ? new Date(tripData.accommodation.checkIn + 'T00:00:00') : (tripData.startDate ? new Date(tripData.startDate + 'T00:00:00') : new Date())}
                    maxDate={new Date(new Date().getFullYear() + 5, 11, 31)}
                    className="react-calendar-custom"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <Plane className="w-5 h-5 mr-2 text-purple-500" />
          Transport
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="transportMethod">Method</Label>
            <select
              id="transportMethod"
              className="w-full p-2 border border-gray-300 rounded-md dark:border-gray-600 dark:bg-gray-800"
              value={tripData.transport.method}
              onChange={(e) => setTripData(prev => ({
                ...prev,
                transport: { ...prev.transport, method: e.target.value }
              }))}
            >
              <option value="flight">Flight</option>
              <option value="train">Train</option>
              <option value="car">Car</option>
              <option value="bus">Bus</option>
            </select>
          </div>
          
          <div>
            <Label htmlFor="transportDetails">Details</Label>
            <Input
              id="transportDetails"
              placeholder="Flight number, route, etc."
              value={tripData.transport.details}
              onChange={(e) => setTripData(prev => ({
                ...prev,
                transport: { ...prev.transport, details: e.target.value }
              }))}
            />
          </div>
          
          <div>
            <Label htmlFor="transportTime">Time</Label>
            <Input
              id="transportTime"
              placeholder="Departure time"
              value={tripData.transport.time}
              onChange={(e) => setTripData(prev => ({
                ...prev,
                transport: { ...prev.transport, time: e.target.value }
              }))}
            />
          </div>
        </div>
      </Card>
    </div>
  );

  const renderItinerary = () => {
    const dateRange = getDateRange();
    
    if (dateRange.length === 0) {
      return (
        <Card className="p-6 text-center">
          <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-600 dark:text-gray-400">
            Please set your travel dates in the Overview tab to create an itinerary.
          </p>
        </Card>
      );
    }

    return (
      <div className="space-y-6">
        {dateRange.map((date, dateIndex) => (
          <Card key={dateIndex} className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
                Day {dateIndex + 1} - {date.toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </h3>
              <Button
                onClick={() => addActivity(dateIndex)}
                size="sm"
                className="flex items-center"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Activity
              </Button>
            </div>
            
            <div className="space-y-3">
              {tripData.itinerary[dateIndex]?.map((activity) => (
                <div key={activity.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <div className="md:col-span-2">
                      <Label>Activity</Label>
                      <Input
                        placeholder="Activity name"
                        value={activity.name}
                        onChange={(e) => updateActivity(dateIndex, activity.id, 'name', e.target.value)}
                      />
                    </div>
                    
                    <div>
                      <Label>Time</Label>
                      <Input
                        placeholder="e.g., 10:00 AM"
                        value={activity.time}
                        onChange={(e) => updateActivity(dateIndex, activity.id, 'time', e.target.value)}
                      />
                    </div>
                    
                    <div className="flex items-end">
                      <Button
                        onClick={() => removeActivity(dateIndex, activity.id)}
                        variant="outline"
                        size="sm"
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="mt-3">
                    <Label>Notes</Label>
                    <Textarea
                      placeholder="Additional notes..."
                      value={activity.notes}
                      onChange={(e) => updateActivity(dateIndex, activity.id, 'notes', e.target.value)}
                      rows={2}
                    />
                  </div>
                </div>
              )) || (
                <p className="text-gray-500 text-center py-4">
                  No activities planned for this day. Click "Add Activity" to get started.
                </p>
              )}
            </div>
          </Card>
        ))}
      </div>
    );
  };

  const renderBudget = () => {
    const currencySymbols = {
      'INR': '₹',
      'USD': '$',
      'EUR': '€',
      'GBP': '£',
      'JPY': '¥'
    };

    const formatCurrency = (amount) => {
      const symbol = currencySymbols[tripData.budget.currency] || '₹';
      return `${symbol}${Number(amount || 0).toLocaleString()}`;
    };

    return (
      <div className="space-y-6">
        <Card className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold flex items-center">
              <DollarSign className="w-5 h-5 mr-2 text-green-500" />
              Budget Breakdown
            </h3>
            <div>
              <Label htmlFor="currency" className="text-sm">Currency</Label>
              <select
                id="currency"
                className="ml-2 p-2 border border-gray-300 rounded-md dark:border-gray-600 dark:bg-gray-800 text-sm"
                value={tripData.budget.currency}
                onChange={(e) => setTripData(prev => ({
                  ...prev,
                  budget: { ...prev.budget, currency: e.target.value }
                }))}
              >
                <option value="INR">Indian Rupee (₹)</option>
                <option value="USD">US Dollar ($)</option>
                <option value="EUR">Euro (€)</option>
                <option value="GBP">British Pound (£)</option>
                <option value="JPY">Japanese Yen (¥)</option>
              </select>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="transportBudget">Transport</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                  {currencySymbols[tripData.budget.currency]}
                </span>
                <Input
                  id="transportBudget"
                  type="number"
                  placeholder="0"
                  className="pl-8"
                  value={tripData.budget.transport}
                  onChange={(e) => setTripData(prev => ({
                    ...prev,
                    budget: { ...prev.budget, transport: e.target.value }
                  }))}
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="stayBudget">Accommodation</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                  {currencySymbols[tripData.budget.currency]}
                </span>
                <Input
                  id="stayBudget"
                  type="number"
                  placeholder="0"
                  className="pl-8"
                  value={tripData.budget.stay}
                  onChange={(e) => setTripData(prev => ({
                    ...prev,
                    budget: { ...prev.budget, stay: e.target.value }
                  }))}
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="foodBudget">Food</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                  {currencySymbols[tripData.budget.currency]}
                </span>
                <Input
                  id="foodBudget"
                  type="number"
                  placeholder="0"
                  className="pl-8"
                  value={tripData.budget.food}
                  onChange={(e) => setTripData(prev => ({
                    ...prev,
                    budget: { ...prev.budget, food: e.target.value }
                  }))}
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="activitiesBudget">Activities</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                  {currencySymbols[tripData.budget.currency]}
                </span>
                <Input
                  id="activitiesBudget"
                  type="number"
                  placeholder="0"
                  className="pl-8"
                  value={tripData.budget.activities}
                  onChange={(e) => setTripData(prev => ({
                    ...prev,
                    budget: { ...prev.budget, activities: e.target.value }
                  }))}
                />
              </div>
            </div>
          </div>
          
          <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold">Total Estimated Budget:</span>
              <span className="text-2xl font-bold text-green-600 dark:text-green-400">
                {formatCurrency(totalBudget)}
              </span>
            </div>
          </div>
        </Card>
      </div>
    );
  };

  const renderChecklist = () => (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold flex items-center">
            <Check className="w-5 h-5 mr-2 text-blue-500" />
            Travel Checklist
          </h3>
          <Button onClick={addChecklistItem} size="sm">
            <Plus className="w-4 h-4 mr-1" />
            Add Item
          </Button>
        </div>
        
        <div className="space-y-3">
          {tripData.checklist.map((item) => (
            <div key={item.id} className="flex items-center space-x-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
              <input
                type="checkbox"
                checked={item.completed}
                onChange={(e) => updateChecklistItem(item.id, 'completed', e.target.checked)}
                className="w-5 h-5 text-blue-600"
              />
              <Input
                placeholder="Checklist item"
                value={item.text}
                onChange={(e) => updateChecklistItem(item.id, 'text', e.target.value)}
                className={`flex-1 ${item.completed ? 'line-through text-gray-500' : ''}`}
              />
              <Button
                onClick={() => removeChecklistItem(item.id)}
                variant="outline"
                size="sm"
                className="text-red-500 hover:text-red-700"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
        
        <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
          {tripData.checklist.filter(item => item.completed).length} of {tripData.checklist.length} items completed
        </div>
      </Card>
    </div>
  );

  return (
    <>
      <style jsx>{`
        .react-calendar-custom {
          background: white;
          border: none;
          font-family: inherit;
          border-radius: 8px;
          padding: 12px;
        }
        .dark .react-calendar-custom {
          background: #1f2937;
          color: white;
        }
        .react-calendar-custom .react-calendar__navigation {
          margin-bottom: 12px;
        }
        .react-calendar-custom .react-calendar__navigation button {
          background: none;
          border: none;
          color: #374151;
          font-size: 16px;
          font-weight: 500;
          padding: 8px;
          border-radius: 6px;
          transition: background-color 0.2s;
        }
        .dark .react-calendar-custom .react-calendar__navigation button {
          color: #d1d5db;
        }
        .react-calendar-custom .react-calendar__navigation button:hover {
          background-color: #f3f4f6;
        }
        .dark .react-calendar-custom .react-calendar__navigation button:hover {
          background-color: #374151;
        }
        .react-calendar-custom .react-calendar__tile {
          background: none;
          border: none;
          padding: 8px;
          border-radius: 6px;
          transition: all 0.2s;
          color: #374151;
        }
        .dark .react-calendar-custom .react-calendar__tile {
          color: #d1d5db;
        }
        .react-calendar-custom .react-calendar__tile:hover {
          background-color: #e5e7eb;
        }
        .dark .react-calendar-custom .react-calendar__tile:hover {
          background-color: #4b5563;
        }
        .react-calendar-custom .react-calendar__tile--active {
          background-color: #3b82f6 !important;
          color: white !important;
        }
        .react-calendar-custom .react-calendar__tile--now {
          background-color: #fef3c7;
          color: #92400e;
        }
        .dark .react-calendar-custom .react-calendar__tile--now {
          background-color: #451a03;
          color: #fbbf24;
        }
        
        /* Hide scrollbars */
        .scrollbar-hide {
          -ms-overflow-style: none;  /* Internet Explorer 10+ */
          scrollbar-width: none;  /* Firefox */
        }
        .scrollbar-hide::-webkit-scrollbar { 
          display: none;  /* Safari and Chrome */
        }
      `}</style>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 shadow-sm">
          <div className="container mx-auto px-4 py-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  Trip Planning
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  {showPlanningInterface 
                    ? (tripData.destination ? `Planning your trip to ${tripData.destination}` : 'Plan your perfect trip')
                    : 'Manage your saved trips'
                  }
                </p>
                {showPlanningInterface && currentTripId && (
                  <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
                    Editing saved trip
                  </p>
                )}
              </div>
              <div className="flex space-x-3">
                {showPlanningInterface ? (
                  <>
                    <Button onClick={goBackToCards} variant="outline" className="flex items-center">
                      <MapPin className="w-4 h-4 mr-2" />
                      Back to Trips
                    </Button>
                    <Button onClick={saveTrip} className="flex items-center">
                      <Save className="w-4 h-4 mr-2" />
                      {currentTripId ? 'Update Trip' : 'Save Trip'}
                    </Button>
                  </>
                ) : (
                  <Button onClick={createNewTrip} variant="outline" className="flex items-center">
                    <Plus className="w-4 h-4 mr-2" />
                    New Trip
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Planning Interface */}
        {showPlanningInterface ? (
          <div className="container mx-auto px-4 py-6">
            {/* Tabs */}
            <div className="flex space-x-1 bg-gray-200 dark:bg-gray-700 p-1 rounded-lg mb-6 overflow-x-auto">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
                      activeTab === tab.id
                        ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow-sm'
                        : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                    }`}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Tab Content */}
            <div className="max-w-4xl mx-auto">
              {activeTab === 'overview' && renderOverview()}
              {activeTab === 'itinerary' && renderItinerary()}
              {activeTab === 'budget' && renderBudget()}
            </div>
          </div>
        ) : (
          /* Saved Trips Cards View */
          <div className="container mx-auto px-4 py-6">
            <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Your Saved Trips
            </h2>
            <Button onClick={createNewTrip} variant="outline" className="flex items-center">
              <Plus className="w-4 h-4 mr-2" />
              New Trip
            </Button>
          </div>

          {savedTrips.length === 0 ? (
            <Card className="p-8 text-center">
              <div className="text-gray-400 mb-4">
                <MapPin className="w-12 h-12 mx-auto mb-4" />
                <p className="text-lg">No saved trips yet</p>
                <p className="text-sm">Start planning your first trip and save it to see it here!</p>
              </div>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {savedTrips.map((trip) => (
                <TripCard
                  key={trip.id}
                  trip={trip}
                  isCurrentTrip={currentTripId === trip.id}
                  isExpanded={expandedTripCards[trip.id]}
                  onView={viewTripDetails}
                  onEdit={loadTrip}
                  onDelete={deleteTrip}
                  onToggleExpand={toggleTripCardExpansion}
                  onUpdateChecklist={updateSavedTripChecklist}
                />
              ))}
            </div>
          )}
            </div>
          </div>
        )}

        {/* Trip Details Modal */}
        {selectedTripForModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-5xl max-h-[95vh] overflow-hidden shadow-2xl">
              {/* Header with gradient background */}
              <div className="relative bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-3xl font-bold mb-2">
                      {selectedTripForModal.destination || 'Trip Details'}
                    </h2>
                    {selectedTripForModal.startDate && selectedTripForModal.endDate && (
                      <div className="flex items-center text-blue-100">
                        <Calendar className="w-4 h-4 mr-2" />
                        <span className="text-lg">
                          {new Date(selectedTripForModal.startDate).toLocaleDateString()} - {new Date(selectedTripForModal.endDate).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>
                  <button 
                    onClick={closeTripModal}
                    className="text-white hover:text-gray-200 transition-colors bg-white bg-opacity-20 rounded-full p-2"
                    type="button"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>
                {/* Decorative elements */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-white bg-opacity-10 rounded-full -translate-y-16 translate-x-16"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-white bg-opacity-10 rounded-full translate-y-12 -translate-x-12"></div>
              </div>

              {/* Content */}
              <div className="p-6 overflow-y-auto max-h-[calc(95vh-200px)]">
                
                {/* Quick Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                  {/* Duration Card */}
                  {selectedTripForModal.startDate && selectedTripForModal.endDate && (
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl p-4 border border-blue-200 dark:border-blue-700">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-blue-600 dark:text-blue-400 text-sm font-medium">Duration</div>
                          <div className="text-2xl font-bold text-blue-800 dark:text-blue-300">
                            {Math.ceil((new Date(selectedTripForModal.endDate) - new Date(selectedTripForModal.startDate)) / (1000 * 60 * 60 * 24))} Days
                          </div>
                        </div>
                        <Calendar className="w-8 h-8 text-blue-500" />
                      </div>
                    </div>
                  )}
                  
                  {/* Transport Card */}
                  {selectedTripForModal.transport?.method && (
                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl p-4 border border-purple-200 dark:border-purple-700">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-purple-600 dark:text-purple-400 text-sm font-medium">Transport</div>
                          <div className="text-lg font-bold text-purple-800 dark:text-purple-300 capitalize">
                            {selectedTripForModal.transport.method}
                          </div>
                        </div>
                        {selectedTripForModal.transport.method === 'flight' && <Plane className="w-8 h-8 text-purple-500" />}
                        {selectedTripForModal.transport.method === 'train' && <Train className="w-8 h-8 text-purple-500" />}
                        {selectedTripForModal.transport.method === 'car' && <Car className="w-8 h-8 text-purple-500" />}
                        {selectedTripForModal.transport.method === 'bus' && <Bus className="w-8 h-8 text-purple-500" />}
                      </div>
                    </div>
                  )}

                  {/* Budget Card */}
                  {(() => {
                    const totalBudget = Object.values(selectedTripForModal.budget || {}).reduce((sum, amount) => {
                      if (typeof amount === 'number') return sum + amount;
                      return sum + (Number(amount) || 0);
                    }, 0);
                    const currencySymbol = {
                      'INR': '₹', 'USD': '$', 'EUR': '€', 'GBP': '£', 'JPY': '¥'
                    }[selectedTripForModal.budget?.currency || 'INR'] || '₹';
                    
                    return totalBudget > 0 ? (
                      <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl p-4 border border-green-200 dark:border-green-700">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-green-600 dark:text-green-400 text-sm font-medium">Budget</div>
                            <div className="text-2xl font-bold text-green-800 dark:text-green-300">
                              {currencySymbol}{totalBudget.toLocaleString()}
                            </div>
                          </div>
                          <DollarSign className="w-8 h-8 text-green-500" />
                        </div>
                      </div>
                    ) : null;
                  })()}
                </div>

                {/* Trip Details Content */}
                <div className="space-y-8">

                  {/* Accommodation */}
                  {selectedTripForModal.accommodation?.name && (
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/10 dark:to-emerald-900/10 rounded-2xl p-6 border border-green-200 dark:border-green-700">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-bold text-green-800 dark:text-green-300 flex items-center">
                          <Hotel className="w-6 h-6 mr-3 text-green-600" />
                          Accommodation
                        </h3>
                        {selectedTripForModal.accommodation.isBooked && (
                          <span className="bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-200 px-3 py-1 rounded-full text-sm font-medium flex items-center">
                            <Check className="w-4 h-4 mr-1" />
                            Booked
                          </span>
                        )}
                      </div>
                      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
                        <div className="font-semibold text-lg text-gray-900 dark:text-white mb-2">
                          {selectedTripForModal.accommodation.name}
                        </div>
                        {selectedTripForModal.accommodation.location && (
                          <div className="text-gray-600 dark:text-gray-300 flex items-center">
                            <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                            {selectedTripForModal.accommodation.location}
                          </div>
                        )}
                        {selectedTripForModal.accommodation.checkIn && selectedTripForModal.accommodation.checkOut && (
                          <div className="mt-3 flex items-center text-sm text-gray-500">
                            <Calendar className="w-4 h-4 mr-2" />
                            Check-in: {new Date(selectedTripForModal.accommodation.checkIn).toLocaleDateString()} • 
                            Check-out: {new Date(selectedTripForModal.accommodation.checkOut).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Itinerary */}
                  {selectedTripForModal.itinerary && selectedTripForModal.itinerary.length > 0 && (
                    <div className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/10 dark:to-indigo-900/10 rounded-2xl p-6 border border-purple-200 dark:border-purple-700">
                      <h3 className="text-xl font-bold text-purple-800 dark:text-purple-300 mb-6 flex items-center">
                        <Calendar className="w-6 h-6 mr-3 text-purple-600" />
                        Daily Itinerary
                      </h3>
                      <div className="space-y-6">
                        {selectedTripForModal.itinerary.map((dayActivities, dayIndex) => {
                          if (!dayActivities || dayActivities.length === 0) return null;
                          
                          const dayDate = new Date(selectedTripForModal.startDate);
                          dayDate.setDate(dayDate.getDate() + dayIndex);
                          
                          return (
                            <div key={dayIndex} className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border-l-4 border-purple-400">
                              <div className="flex items-center justify-between mb-4">
                                <h4 className="font-bold text-lg text-gray-900 dark:text-white">
                                  Day {dayIndex + 1}
                                </h4>
                                <div className="text-sm text-purple-600 dark:text-purple-400 font-medium">
                                  {dayDate.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                                </div>
                              </div>
                              <div className="space-y-3">
                                {dayActivities.map((activity, activityIndex) => (
                                  <div key={activityIndex} className="flex items-start space-x-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                    <div className="bg-purple-100 dark:bg-purple-800 rounded-full p-2 flex-shrink-0">
                                      <Clock className="w-4 h-4 text-purple-600 dark:text-purple-300" />
                                    </div>
                                    <div className="flex-1">
                                      <div className="flex items-center space-x-3 mb-1">
                                        <span className="font-semibold text-purple-700 dark:text-purple-300 text-sm">
                                          {activity.time}
                                        </span>
                                        <span className="font-medium text-gray-900 dark:text-white">
                                          {activity.activity}
                                        </span>
                                      </div>
                                      {activity.location && (
                                        <div className="flex items-center text-gray-600 dark:text-gray-300 text-sm">
                                          <MapPin className="w-3 h-3 mr-1" />
                                          {activity.location}
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
                    </div>
                  )}

                  {/* Checklist */}
                  {selectedTripForModal.checklist && selectedTripForModal.checklist.length > 0 && (
                    <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/10 dark:to-cyan-900/10 rounded-2xl p-6 border border-blue-200 dark:border-blue-700">
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-bold text-blue-800 dark:text-blue-300 flex items-center">
                          <Check className="w-6 h-6 mr-3 text-blue-600" />
                          Travel Checklist
                        </h3>
                        <div className="bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-full text-sm font-medium">
                          {selectedTripForModal.checklist.filter(item => item.completed).length} / {selectedTripForModal.checklist.length} Complete
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {selectedTripForModal.checklist.map((item) => (
                          <div key={item.id} className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
                            <label className="flex items-center space-x-3 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={item.completed}
                                onChange={(e) => updateSavedTripChecklist(selectedTripForModal.id, item.id, 'completed', e.target.checked)}
                                className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                              />
                              <span className={`font-medium ${
                                item.completed 
                                  ? 'line-through text-gray-500 dark:text-gray-400' 
                                  : 'text-gray-700 dark:text-gray-300'
                              }`}>
                                {item.text}
                              </span>
                              {item.completed && (
                                <Check className="w-4 h-4 text-green-500 ml-auto" />
                              )}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Modal Footer */}
                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-6 mt-8">
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {selectedTripForModal.updated_at ? (
                        <>Last updated: {new Date(selectedTripForModal.updated_at).toLocaleDateString()}</>
                      ) : (
                        <>Trip saved as draft</>
                      )}
                    </div>
                    <div className="flex space-x-3">
                      <Button onClick={closeTripModal} variant="outline" className="px-6">
                        Close
                      </Button>
                      <Button 
                        onClick={() => { loadTrip(selectedTripForModal); closeTripModal(); }} 
                        className="flex items-center px-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                      >
                        <Edit3 className="w-4 h-4 mr-2" />
                        Edit Trip
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default TripPlanning;
