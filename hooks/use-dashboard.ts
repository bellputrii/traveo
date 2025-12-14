// hooks/use-dashboard.ts
"use client";

import { useState, useEffect } from 'react';

interface DashboardData {
    totalArticles: number;
    totalCategories: number;
    totalComments: number;
    totalUsers: number;
    recentArticles: Array<{
        id: string;
        title: string;
        views: number;
        likes: number;
        date: string;
    }>;
    monthlyStats: Array<{
        month: string;
        articles: number;
        views: number;
        comments: number;
    }>;
}

export function useDashboard() {
    const [data, setData] = useState<DashboardData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = async () => {
        try {
            setIsLoading(true);
            setError(null);
            
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Mock data
            const mockData: DashboardData = {
                totalArticles: 1245,
                totalCategories: 12,
                totalComments: 8923,
                totalUsers: 256,
                recentArticles: [
                    { id: '1', title: 'Exploring Bali Hidden Gems', views: 1234, likes: 89, date: '2024-01-15' },
                    { id: '2', title: 'Tokyo Food Guide 2024', views: 987, likes: 65, date: '2024-01-14' },
                    { id: '3', title: 'Santorini Sunset Spots', views: 1567, likes: 112, date: '2024-01-13' },
                ],
                monthlyStats: [
                    { month: 'Jan', articles: 45, views: 12345, comments: 234 },
                    { month: 'Feb', articles: 38, views: 9876, comments: 189 },
                    { month: 'Mar', articles: 52, views: 15678, comments: 312 },
                    { month: 'Apr', articles: 41, views: 13456, comments: 267 },
                    { month: 'May', articles: 49, views: 14567, comments: 289 },
                    { month: 'Jun', articles: 56, views: 16789, comments: 345 },
                ]
            };
            
            setData(mockData);
        } catch (err) {
            setError('Failed to load dashboard data');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const refetch = () => {
        fetchData();
    };

    return {
        data,
        isLoading,
        error,
        refetch
    };
}