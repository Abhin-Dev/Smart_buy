/**
 * SmartBuy — Login Page
 * Groww-style dark login with green accent buttons.
 */
import React, { useState } from 'react';
import { ShoppingBag, LogIn, Eye, EyeOff, UserPlus } from 'lucide-react';
import { auth } from '../firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';

export default function Login() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [isSignUp, setIsSignUp] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            if (isSignUp) {
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                await updateProfile(userCredential.user, { displayName: name });
            } else {
                await signInWithEmailAndPassword(auth, email, password);
            }
        } catch (err) {
            const messages = {
                'auth/user-not-found': 'No account found with this email.',
                'auth/wrong-password': 'Incorrect password.',
                'auth/invalid-credential': 'Invalid email or password.',
                'auth/email-already-in-use': 'An account with this email already exists.',
                'auth/weak-password': 'Password must be at least 6 characters.',
                'auth/invalid-email': 'Please enter a valid email address.',
                'auth/too-many-requests': 'Too many attempts. Please try again later.',
            };
            setError(messages[err.code] || err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
            {/* Background */}
            <div className="absolute inset-0 bg-surface-900">
                <div className="absolute top-1/4 -left-20 w-80 h-80 bg-groww-green/10 rounded-full blur-3xl animate-pulse-soft" />
                <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-groww-blue/8 rounded-full blur-3xl animate-pulse-soft" style={{ animationDelay: '1s' }} />
            </div>

            {/* Login card */}
            <div className="relative z-10 w-full max-w-md mx-4 animate-slide-up">
                <div className="glass-card p-8">
                    {/* Brand header */}
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-groww-green
                            flex items-center justify-center shadow-xl glow-green">
                            <ShoppingBag size={28} className="text-white" />
                        </div>
                        <h1 className="text-3xl font-bold gradient-text mb-2">SmartBuy</h1>
                        <p className="text-gray-500 text-sm">
                            Customer Behaviour Intelligence Platform
                        </p>
                    </div>

                    {/* Error */}
                    {error && (
                        <div className="mb-4 p-3 bg-groww-red/10 border border-groww-red/30 rounded-xl text-groww-red text-sm text-center">
                            {error}
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {isSignUp && (
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">
                                    Full Name
                                </label>
                                <input
                                    id="login-name"
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder=""
                                    className="w-full px-4 py-3 bg-surface-700 border border-surface-300 rounded-xl
                                     text-white placeholder-gray-600 focus:outline-none focus:border-groww-green/50
                                     focus:ring-2 focus:ring-groww-green/20 transition-all duration-200"
                                    required
                                />
                            </div>
                        )}
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">
                                Email Address
                            </label>
                            <input
                                id="login-email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder=""
                                className="w-full px-4 py-3 bg-surface-700 border border-surface-300 rounded-xl
                                 text-white placeholder-gray-600 focus:outline-none focus:border-groww-green/50
                                 focus:ring-2 focus:ring-groww-green/20 transition-all duration-200"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">
                                Password
                            </label>
                            <div className="relative">
                                <input
                                    id="login-password"
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder=""
                                    className="w-full px-4 py-3 bg-surface-700 border border-surface-300 rounded-xl
                                     text-white placeholder-gray-600 focus:outline-none focus:border-groww-green/50
                                     focus:ring-2 focus:ring-groww-green/20 transition-all duration-200 pr-12"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500
                                     hover:text-gray-300 transition-colors"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <button
                            id="login-submit"
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 btn-primary rounded-xl text-sm flex items-center justify-center gap-2
                                     shadow-lg glow-green disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    {isSignUp ? <UserPlus size={18} /> : <LogIn size={18} />}
                                    {isSignUp ? 'Create Account' : 'Sign In'}
                                </>
                            )}
                        </button>
                    </form>

                    {/* Toggle */}
                    <p className="text-center text-gray-500 text-xs mt-6">
                        {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
                        <button
                            onClick={() => { setIsSignUp(!isSignUp); setError(''); }}
                            className="text-groww-green hover:text-groww-green-light transition-colors font-medium"
                        >
                            {isSignUp ? 'Sign In' : 'Sign Up'}
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
}
