/**
 * SmartBuy — Top Navigation Bar
 * Groww-style horizontal navbar with logo, tabs, search, and user avatar.
 */
import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
    LayoutDashboard, Upload, Users, Activity,
    ShoppingBag, Search, LogOut, ChevronDown,
} from 'lucide-react';

const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/upload', label: 'Upload', icon: Upload },
    { to: '/segmentation', label: 'Segmentation', icon: Users },
    { to: '/drift', label: 'Drift Analysis', icon: Activity },
    { to: '/recommendations', label: 'Recommendations', icon: ShoppingBag },
];

export default function Navbar({ onLogout, user }) {
    const [showMenu, setShowMenu] = useState(false);
    const displayName = user?.displayName || user?.email?.split('@')[0] || 'User';
    const initials = displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

    return (
        <header className="fixed top-0 left-0 right-0 z-50 bg-surface-800 border-b border-surface-300/50">
            {/* Main navbar row */}
            <div className="flex items-center justify-between px-6 h-14">
                {/* Left: Logo + Nav */}
                <div className="flex items-center gap-8">
                    {/* Logo */}
                    <NavLink to="/dashboard" className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-groww-green flex items-center justify-center">
                            <ShoppingBag size={16} className="text-white" />
                        </div>
                        <span className="text-white font-bold text-lg tracking-tight">SmartBuy</span>
                    </NavLink>

                    {/* Nav tabs */}
                    <nav className="hidden md:flex items-center gap-1 h-14">
                        {navItems.map(({ to, label }) => (
                            <NavLink
                                key={to}
                                to={to}
                                className={({ isActive }) =>
                                    `nav-tab px-3 h-full flex items-center text-sm font-medium
                                     ${isActive ? 'active text-white' : 'text-gray-400 hover:text-gray-200'}`
                                }
                            >
                                {label}
                            </NavLink>
                        ))}
                    </nav>
                </div>

                {/* Right: Search + User */}
                <div className="flex items-center gap-4">
                    {/* Search */}
                    <div className="hidden lg:flex items-center gap-2 bg-surface-600 rounded-lg px-3 py-1.5 min-w-[220px]">
                        <Search size={14} className="text-gray-500" />
                        <input
                            type="text"
                            placeholder="Search SmartBuy..."
                            className="bg-transparent text-sm text-gray-300 placeholder-gray-500
                                       focus:outline-none w-full"
                        />
                        <kbd className="text-[10px] text-gray-500 bg-surface-400 px-1.5 py-0.5 rounded font-mono">
                            Ctrl+K
                        </kbd>
                    </div>

                    {/* User avatar */}
                    <div className="relative">
                        <button
                            onClick={() => setShowMenu(!showMenu)}
                            className="flex items-center gap-2 hover:opacity-90 transition-opacity"
                        >
                            <div className="w-8 h-8 rounded-full bg-groww-green
                                          flex items-center justify-center text-white text-xs font-bold">
                                {initials}
                            </div>
                        </button>

                        {/* Dropdown menu */}
                        {showMenu && (
                            <div className="absolute right-0 top-full mt-2 w-56 bg-surface-600 border border-surface-300
                                          rounded-xl shadow-2xl overflow-hidden animate-fade-in z-50">
                                <div className="p-4 border-b border-surface-300">
                                    <p className="text-sm font-medium text-white truncate">{displayName}</p>
                                    <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                                </div>
                                <button
                                    onClick={() => { setShowMenu(false); onLogout(); }}
                                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-400
                                             hover:text-red-400 hover:bg-red-500/10 transition-all"
                                >
                                    <LogOut size={16} />
                                    <span>Logout</span>
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
}
