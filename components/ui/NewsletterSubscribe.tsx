"use client";

import { Mail, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useState } from 'react';

export function NewsletterSubscribe() {
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [errorMessage, setErrorMessage] = useState('');

    const validateEmail = (email: string) => {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        return regex.test(email);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Reset status
        setStatus('idle');
        setErrorMessage('');

        // Validate email
        if (!email) {
            setStatus('error');
            setErrorMessage('Please enter an email address');

            return;
        }

        if (!validateEmail(email)) {
            setStatus('error');
            setErrorMessage('Please enter a valid email address');

            return;
        }

        try {
            // Here you can add the actual API call to handle subscription
            // For example: await fetch('/api/subscribe', { method: 'POST', body: JSON.stringify({ email }) })

            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 500));

            // Success handling
            setStatus('success');
            setEmail(''); // Clear input
        } catch {
            // Error handling
            setStatus('error');
            setErrorMessage('Subscription failed, please try again later');
        }
    };

    return (
        <div className="bg-gradient-to-br from-[#1A5276] to-[#154360] rounded-xl shadow-lg overflow-hidden">
            {/* Inner content container with semi-transparent overlay */}
            <div className="relative">
                {/* Content container with proper padding */}
                <div className="px-8 py-10 relative z-10">
                    {/* Header section with title */}
                    <div className="mb-6 text-center">
                        <div className="inline-flex items-center justify-center mb-2">
                            <Mail className="w-7 h-7 text-[#F39C12] mr-3" strokeWidth={1.5} />
                            <h3 className="text-2xl font-bold text-white">Newsletter</h3>
                        </div>
                        <p className="text-lg font-medium text-white/90 max-w-md mx-auto">
                            Subscribe to Our Deals Newsletter
                        </p>
                    </div>

                    {/* Main description */}
                    <div className="mb-8 text-center">
                        <p className="text-white/80 max-w-lg mx-auto">
                            Get the latest deals first-hand, don&apos;t miss any money-saving opportunity
                        </p>
                    </div>

                    {/* Form section */}
                    <form onSubmit={handleSubmit} className="max-w-lg mx-auto">
                        <div className="flex flex-col sm:flex-row gap-3">
                            <div className="flex-grow relative">
                                <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                                    <Mail className="w-5 h-5 text-gray-500" />
                                </div>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Enter your email address"
                                    className={`w-full pl-11 pr-4 py-3.5 rounded-lg bg-white/95 text-gray-800 
                                    focus:outline-none focus:ring-2 border border-transparent
                                    ${status === 'error'
                                            ? 'focus:ring-red-400 border-red-400/50'
                                            : 'focus:ring-[#F39C12] focus:border-[#F39C12]/30'
                                        } transition-all duration-200 shadow-sm`}
                                    aria-label="Email address"
                                />
                                {status === 'error' && (
                                    <div className="absolute text-xs bg-red-500/10 border border-red-400/20 text-red-400 px-3 py-1 rounded-md mt-1.5 left-0">
                                        {errorMessage}
                                    </div>
                                )}
                            </div>
                            <button
                                type="submit"
                                className="py-3.5 px-8 bg-[#F39C12] hover:bg-[#E67E22] text-white font-medium
                                rounded-lg transition-all duration-200 shadow-sm hover:shadow
                                flex items-center justify-center whitespace-nowrap"
                            >
                                Subscribe
                                <ArrowRight className="w-4 h-4 ml-2" />
                            </button>
                        </div>
                    </form>

                    {/* Success message */}
                    {status === 'success' && (
                        <div className="mt-6 bg-green-500/10 border border-green-500/20 px-4 py-3 rounded-lg 
                        text-green-400 text-sm flex items-center justify-center max-w-lg mx-auto">
                            <CheckCircle2 className="w-5 h-5 mr-2 flex-shrink-0" />
                            <span>Subscription successful! Thank you for subscribing.</span>
                        </div>
                    )}

                    {/* Privacy notice */}
                    <div className="mt-6 text-center">
                        <p className="text-xs text-white/60">
                            We respect your privacy and will never share your email with third parties.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
} 