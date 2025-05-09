    import React, { useState, useEffect, useCallback } from 'react';
    import { Calendar } from "@/components/ui/calendar"
    import { Button } from "@/components/ui/button"
    import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
    import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
    import { Input } from "@/components/ui/input"
    import { Label } from "@/components/ui/label"
    import { Textarea } from "@/components/ui/textarea"
    import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
    import { cn } from "@/lib/utils"
    import { CalendarIcon, PlusCircle, User, LogIn, LogOut, Settings, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
    import { format, parseISO } from 'date-fns';
    import { motion, AnimatePresence } from 'framer-motion';

    // Mock Data & Types (Replace with actual Firebase integration)
    interface Event {
        id: string;
        title: string;
        description: string;
        date: string; // ISO String
        location?: string;
    }

    interface UserProfile {
        uid: string;
        email: string;
        displayName: string;
        role: 'member' | 'admin';
    }

    const mockEvents: Event[] = [
        { id: '1', title: 'Volunteer Day', description: 'Help out at the local park.', date: new Date(Date.now() + 86400000).toISOString(), location: "Central Park" }, // Tomorrow
        { id: '2', title: 'Fundraising Gala', description: 'Formal event to raise funds.', date: new Date(Date.now() + (86400000 * 7)).toISOString(), location: "Hilton Hotel" }, // In 7 days
        { id: '3', title: 'Board Meeting', description: 'Monthly board meeting.', date: new Date(Date.now() + (86400000 * 30)).toISOString(), location: "Office HQ" }, // In 30 days
    ];

    const mockUser: UserProfile = {
        uid: 'user123',
        email: 'user@example.com',
        displayName: 'Test User',
        role: 'member', // Or 'admin'
    };

    const App: React.FC = () => {
        const [user, setUser] = useState<UserProfile | null>(mockUser); // Start with mock user
        const [events, setEvents] = useState<Event[]>(mockEvents); // Start with mock events
        const [selectedDate, setSelectedDate] = useState<Date | undefined>();
        const [isAddEventDialogOpen, setIsAddEventDialogOpen] = useState(false);
        const [newEvent, setNewEvent] = useState<Omit<Event, 'id'>>({
            title: '',
            description: '',
            date: new Date().toISOString(),
            location: '',
        });
        const [mode, setMode] = useState<'member' | 'admin'>('member'); // Added mode state
        const [loading, setLoading] = useState(false); // Added loading state
        const [error, setError] = useState<string | null>(null); // Added error state


        // Simulate login/logout (Replace with Firebase Auth)
        const handleLogin = () => {
            setLoading(true);
            setError(null);
            // Simulate an async operation (e.g., Firebase auth)
            setTimeout(() => {
                // In a real app, you'd get the user data from Firebase
                setUser({
                    uid: 'user123', // Replace with actual user ID
                    email: 'user@example.com', // Replace
                    displayName: 'Test User', // Replace
                    role: 'admin', // Or 'member' based on user role in DB
                });
                setMode('admin'); // for testing
                setLoading(false);
            }, 1000);
        };

        const handleLogout = () => {
            setLoading(true);
            setTimeout(() => {
                setUser(null);
                setMode('member'); // Default to member mode
                setLoading(false);
            }, 500);
        };

        // --- Event Management ---
        const handleDateSelect = (date: Date | undefined) => {
            setSelectedDate(date);
        };

        const handleAddEventInputChange = (field: keyof Omit<Event, 'id'>, value: string) => {
            setNewEvent({ ...newEvent, [field]: value });
        };

        const handleAddEvent = () => {
            setLoading(true);
            setError(null);
            if (!newEvent.title.trim() || !newEvent.description.trim() || !newEvent.date) {
                setError("Please fill in all fields.");
                setLoading(false);
                return;
            }

            // Simulate adding to a database (e.g., Firebase Firestore)
            setTimeout(() => {
                const eventToAdd: Event = {
                    id: crypto.randomUUID(), // Use a proper ID generator
                    ...newEvent,
                };
                setEvents([...events, eventToAdd]);
                setNewEvent({ title: '', description: '', date: new Date().toISOString(), location: '' }); // Reset form
                setIsAddEventDialogOpen(false);
                setLoading(false);
            }, 500);
        };

        const getEventsForDate = (date: Date) => {
            return events.filter(event => format(parseISO(event.date), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd'));
        };

        // --- UI ---
        // Event Card Component
        const EventCard: React.FC<{ event: Event }> = ({ event }) => {
            return (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.2 }}
                >
                    <Card className="mb-4 bg-white/5 border-white/10 backdrop-blur-md shadow-lg hover:shadow-xl transition-shadow duration-300">
                        <CardHeader>
                            <CardTitle className="text-lg text-white">{event.title}</CardTitle>
                            <CardDescription className="text-gray-300">
                                {event.location && <><span className="mr-2">📍</span>{event.location}</>}
                                {format(parseISO(event.date), 'PPPpp')}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-gray-200 leading-relaxed">{event.description}</p>
                        </CardContent>
                    </Card>
                </motion.div>
            );
        };

        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black p-4 md:p-8">
                <div className="max-w-4xl mx-auto">
                    {/* App Header */}
                    <div className="flex flex-col md:flex-row items-center justify-between mb-8">
                        <h1 className="text-3xl font-bold text-white mb-4 md:mb-0">
                            {/* App Name (e.g., "Non-Profit Events") */}
                            <span className="text-blue-400">Community</span> Events Hub
                        </h1>
                        <div className="flex items-center gap-4">
                            {user ? (
                                <>
                                    <span className="text-gray-300 hidden md:block">
                                        <User className="inline-block mr-1" size={16} />
                                        {user.displayName} ({user.role})
                                    </span>
                                    {user.role === 'admin' && (
                                        <Button
                                            variant={mode === 'admin' ? "default" : "outline"}
                                            onClick={() => setMode(prev => prev === 'member' ? 'admin' : 'member')}
                                            className={cn(
                                                "bg-white/10 text-white hover:bg-white/20 border-white/20",
                                                mode === 'admin' && "bg-blue-500/20 text-blue-400 border-blue-500/30 hover:bg-blue-500/30"
                                            )}
                                            disabled={loading}
                                        >
                                            {mode === 'member' ? (
                                                <>
                                                    <Settings className="mr-2" size={16} /> Admin Mode
                                                </>
                                            ) : (
                                                "Member Mode"
                                            )}
                                        </Button>
                                    )}
                                    <Button
                                        onClick={handleLogout}
                                        className="bg-red-500/20 text-red-400 hover:bg-red-500/30 border-red-500/30"
                                        disabled={loading}
                                    >
                                        {loading ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Logging Out...
                                            </>
                                        ) : (
                                            <>
                                                <LogOut className="mr-2" size={16} /> Logout
                                            </>
                                        )}
                                    </Button>
                                </>
                            ) : (
                                <Button
                                    onClick={handleLogin}
                                    className="bg-green-500/20 text-green-400 hover:bg-green-500/30 border-green-500/30"
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Logging In...
                                        </>
                                    ) : (
                                        <>
                                            <LogIn className="mr-2" size={16} /> Login
                                        </>
                                    )}
                                </Button>
                            )}
                        </div>
                    </div>

                    {/* Main Content Area */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Calendar */}
                        <Card className="bg-white/5 border-white/10 backdrop-blur-md shadow-lg">
                            <CardHeader>
                                <CardTitle className="text-white">Event Calendar</CardTitle>
                                <CardDescription className="text-gray-300">Select a date to view events.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Calendar
                                    mode="single"
                                    selected={selectedDate}
                                    onSelect={handleDateSelect}
                                    className="rounded-md border-white/10 bg-white/5 text-white"
                                    style={{
                                        '--calendar-background': 'rgba(255, 255, 255, 0.05)',
                                        '--calendar-text': 'white',
                                        '--calendar-border': '1px solid rgba(255, 255, 255, 0.1)',
                                        '--calendar-selected': '#93c5fd',       // Tailwind's blue-200
                                        '--calendar-selected-text': '#1e40af', // Tailwind's blue-800
                                        '--calendar-hover': 'rgba(255, 255, 255, 0.1)',
                                    }}
                                />
                                {user?.role === 'admin' && mode === 'admin' && (
                                    <div className="mt-4">
                                        <Dialog open={isAddEventDialogOpen} onOpenChange={setIsAddEventDialogOpen}>
                                            <DialogTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    className="w-full bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 border-blue-500/30"
                                                >
                                                    <PlusCircle className="mr-2" size={16} /> Add Event
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent className="bg-gray-900 border-gray-700 text-white">
                                                <DialogHeader>
                                                    <DialogTitle className="text-white">Add New Event</DialogTitle>
                                                    <DialogDescription className="text-gray-300">
                                                        Fill in the details for the new event.
                                                    </DialogDescription>
                                                </DialogHeader>
                                                <div className="space-y-4">
                                                    <div>
                                                        <Label htmlFor="title" className="text-gray-200">Title</Label>
                                                        <Input
                                                            id="title"
                                                            value={newEvent.title}
                                                            onChange={(e) => handleAddEventInputChange('title', e.target.value)}
                                                            className="bg-black/20 text-white border-gray-700"
                                                            placeholder="Event Title"
                                                        />
                                                    </div>
                                                    <div>
                                                        <Label htmlFor="description" className="text-gray-200">Description</Label>
                                                        <Textarea
                                                            id="description"
                                                            value={newEvent.description}
                                                            onChange={(e) => handleAddEventInputChange('description', e.target.value)}
                                                            className="bg-black/20 text-white border-gray-700"
                                                            placeholder="Event Description"
                                                        />
                                                    </div>
                                                    <div>
                                                        <Label htmlFor="date" className="text-gray-200">Date</Label>
                                                        <Input
                                                            type="datetime-local"
                                                            id="date"
                                                            value={newEvent.date.slice(0, 16)} // Remove seconds for datetime-local
                                                            onChange={(e) => handleAddEventInputChange('date', e.target.value)}
                                                            className="bg-black/20 text-white border-gray-700"
                                                        />
                                                    </div>
                                                    <div>
                                                        <Label htmlFor="location" className="text-gray-200">Location (Optional)</Label>
                                                        <Input
                                                            id="location"
                                                            value={newEvent.location}
                                                            onChange={(e) => handleAddEventInputChange('location', e.target.value)}
                                                            className="bg-black/20 text-white border-gray-700"
                                                            placeholder="Event Location"
                                                        />
                                                    </div>
                                                </div>
                                                <DialogFooter>
                                                    <Button
                                                        variant="outline"
                                                        onClick={() => setIsAddEventDialogOpen(false)}
                                                        className="bg-gray-700 text-white hover:bg-gray-600 border-gray-700"
                                                        disabled={loading}
                                                    >
                                                        Cancel
                                                    </Button>
                                                    <Button
                                                        onClick={handleAddEvent}
                                                        className="bg-blue-500 text-white hover:bg-blue-600"
                                                        disabled={loading}
                                                    >
                                                        {loading ? (
                                                            <>
                                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                                Adding...
                                                            </>
                                                        ) : (
                                                            <>
                                                                <CheckCircle className="mr-2" size={16} /> Add Event
                                                            </>
                                                        )}
                                                    </Button>
                                                </DialogFooter>
                                                {error && (
                                                    <div className="mt-4 text-red-400 bg-red-500/10 p-3 rounded-md border border-red-500/30 flex items-start gap-2">
                                                        <AlertCircle className="mt-0.5" size={16} />
                                                        {error}
                                                    </div>
                                                )}
                                            </DialogContent>
                                        </Dialog>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Event List */}
                        <div className="space-y-4">
                            <h2 className="text-2xl font-semibold text-white">
                                {selectedDate ? `Events on ${format(selectedDate, 'PPP')}` : 'Upcoming Events'}
                            </h2>
                            {selectedDate ? (
                                getEventsForDate(selectedDate).length > 0 ? (
                                    <AnimatePresence>
                                        {getEventsForDate(selectedDate).map(event => (
                                            <EventCard key={event.id} event={event} />
                                        ))}
                                    </AnimatePresence>
                                ) : (
                                    <p className="text-gray-400">No events found for this date.</p>
                                )
                            ) : (
                                <AnimatePresence>
                                    {events.map(event => (
                                        <EventCard key={event.id} event={event} />
                                    ))}
                                </AnimatePresence>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    export default App;