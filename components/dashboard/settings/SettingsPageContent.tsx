"use client";

import { Facebook, Instagram, Linkedin, Twitter, Youtube } from 'lucide-react';
import { useState, useEffect } from 'react';

import { useSocialLinks } from '@/lib/hooks';
import { showErrorToast, showSuccessToast } from '@/lib/toast';
import type { SocialLinks } from '@/types/api';

export function SettingsPageContent() {
    const { data: socialLinks, isLoading, mutate } = useSocialLinks();
    const [isSaving, setIsSaving] = useState(false);
    const [formData, setFormData] = useState<SocialLinks>({
        twitter: '',
        facebook: '',
        instagram: '',
        pinterest: '',
        youtube: '',
        linkedin: '',
    });

    // 当获取到数据时更新表单
    useEffect(() => {
        if (socialLinks) {
            setFormData(socialLinks);
        }
    }, [socialLinks]);

    // 处理输入变化
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;

        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // 保存设置
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            setIsSaving(true);

            const response = await fetch('/api/settings/social-links', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                throw new Error('Update failed');
            }

            await mutate();
            showSuccessToast({
                title: 'Update successful',
                description: 'Social links updated',
            });
        } catch (error) {
            showErrorToast({
                title: 'Update failed',
                description: error instanceof Error ? error.message : 'Please try again later',
            });
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="animate-pulse">
                <div className="h-8 bg-gray-200 rounded w-1/4 mb-6" />
                <div className="space-y-4">
                    <div className="h-12 bg-gray-200 rounded" />
                    <div className="h-12 bg-gray-200 rounded" />
                    <div className="h-12 bg-gray-200 rounded" />
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">Settings</h1>

            <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-semibold mb-4">Social Links</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Twitter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Twitter URL
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Twitter className="h-4 w-4 text-gray-400" />
                                </div>
                                <input
                                    type="url"
                                    name="twitter"
                                    value={formData.twitter}
                                    onChange={handleInputChange}
                                    className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="https://twitter.com/youraccount"
                                />
                            </div>
                        </div>

                        {/* Facebook */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Facebook URL
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Facebook className="h-4 w-4 text-gray-400" />
                                </div>
                                <input
                                    type="url"
                                    name="facebook"
                                    value={formData.facebook}
                                    onChange={handleInputChange}
                                    className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="https://facebook.com/yourpage"
                                />
                            </div>
                        </div>

                        {/* Instagram */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Instagram URL
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Instagram className="h-4 w-4 text-gray-400" />
                                </div>
                                <input
                                    type="url"
                                    name="instagram"
                                    value={formData.instagram}
                                    onChange={handleInputChange}
                                    className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="https://instagram.com/youraccount"
                                />
                            </div>
                        </div>

                        {/* YouTube */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                YouTube URL
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Youtube className="h-4 w-4 text-gray-400" />
                                </div>
                                <input
                                    type="url"
                                    name="youtube"
                                    value={formData.youtube}
                                    onChange={handleInputChange}
                                    className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="https://youtube.com/yourchannel"
                                />
                            </div>
                        </div>

                        {/* LinkedIn */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                LinkedIn URL
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Linkedin className="h-4 w-4 text-gray-400" />
                                </div>
                                <input
                                    type="url"
                                    name="linkedin"
                                    value={formData.linkedin}
                                    onChange={handleInputChange}
                                    className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="https://linkedin.com/company/yourcompany"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end mt-6">
                        <button
                            type="submit"
                            disabled={isSaving}
                            className={`px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${isSaving ? 'opacity-50 cursor-not-allowed' : ''
                                }`}
                        >
                            {isSaving ? 'Saving...' : 'Save Settings'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
