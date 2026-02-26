/**
 * SmartBuy — Main App with Routing
 * Groww-style layout with top navbar, ticker bar, and full-width content.
 */
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from './firebase';
import Navbar from './components/Navbar';
import TickerBar from './components/TickerBar';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Segmentation from './pages/Segmentation';
import DriftAnalysis from './pages/DriftAnalysis';
import Recommendations from './pages/Recommendations';
import Upload from './pages/Upload';

function App() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-surface-900">
                <div className="w-10 h-10 border-3 border-groww-green/30 border-t-groww-green rounded-full animate-spin" />
            </div>
        );
    }

    if (!user) {
        return (
            <Router>
                <Login />
            </Router>
        );
    }

    const handleLogout = async () => {
        await signOut(auth);
    };

    return (
        <Router>
            <div className="min-h-screen bg-surface-900">
                {/* Fixed top navbar */}
                <Navbar onLogout={handleLogout} user={user} />

                {/* Ticker bar below navbar */}
                <div className="pt-14">
                    <TickerBar />
                </div>

                {/* Main content — full width */}
                <main className="px-6 lg:px-10 py-8 max-w-[1400px] mx-auto">
                    <Routes>
                        <Route path="/" element={<Dashboard user={user} />} />
                        <Route path="/dashboard" element={<Dashboard user={user} />} />
                        <Route path="/segmentation" element={<Segmentation />} />
                        <Route path="/drift" element={<DriftAnalysis />} />
                        <Route path="/recommendations" element={<Recommendations />} />
                        <Route path="/upload" element={<Upload />} />
                        <Route path="*" element={<Navigate to="/" />} />
                    </Routes>
                </main>
            </div>
        </Router>
    );
}

export default App;
