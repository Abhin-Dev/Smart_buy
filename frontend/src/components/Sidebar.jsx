/**
 * SmartBuy — Sidebar Navigation
 * Vertical sidebar with nav links, branding, and logout.
 */
import React from 'react';
import { NavLink } from 'react-router-dom';
import {
    LayoutDashboard, Users, TrendingUp,
    ShoppingBag, Upload, LogOut, Activity,
} from 'lucide-react';

const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/upload', label: 'Upload Dataset', icon: Upload },
    { to: '/segmentation', label: 'Segmentation', icon: Users },
    { to: '/drift', label: 'Drift Analysis', icon: Activity },
    { to: '/recommendations', label: 'Recommendations', icon: ShoppingBag },
];

export default function Sidebar({ onLogout, user }) {
    // Get display name and email from Firebase user
    const displayName = user?.displayName || user?.email?.split('@')[0] || 'User';
    const email = user?.email || '';
    const initials = displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

    return (
        <aside className="fixed left-0 top-0 h-screen w-64 glass flex flex-col z-50">
            {/* Brand */}
            <div className="p-6 border-b border-brand-500/10">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-purple-500
                          flex items-center justify-center shadow-lg glow-indigo">
                        <TrendingUp size={20} className="text-white" />
                    </div>
                    <div>
                        <h1 className="text-lg font-bold gradient-text">SmartBuy</h1>
                        <p className="text-[11px] text-slate-500 tracking-wide uppercase">Retail Analytics</p>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
                {navItems.map(({ to, label, icon: Icon }) => (
                    <NavLink
                        key={to}
                        to={to}
                        className={({ isActive }) =>
                            `nav-link flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium
               transition-all duration-200
               ${isActive
                                ? 'active text-brand-300'
                                : 'text-slate-400 hover:text-slate-200'}`
                        }
                    >
                        <Icon size={18} />
                        <span>{label}</span>
                    </NavLink>
                ))}
            </nav>

            {/* User Profile + Logout */}
            <div className="p-4 border-t border-brand-500/10 space-y-3">
                {/* User info */}
                <div className="flex items-center gap-3 px-2">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-500 to-purple-500
                          flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                        {initials}
                    </div>
                    <div className="min-w-0">
                        <p className="text-sm font-medium text-white truncate">{displayName}</p>
                        <p className="text-[11px] text-slate-500 truncate">{email}</p>
                    </div>
                </div>

                <button
                    onClick={onLogout}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium
                     text-slate-400 hover:text-red-400 hover:bg-red-500/10
                     transition-all duration-200 w-full"
                >
                    <LogOut size={18} />
                    <span>Logout</span>
                </button>
            </div>
        </aside>
    );
}
