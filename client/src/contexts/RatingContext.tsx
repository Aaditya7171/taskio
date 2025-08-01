import React, { createContext, useContext, useEffect, useState } from 'react';
import api from '@/utils/api';

interface RatingContextType {
  averageRating: number;
  totalRatings: number;
  addRating: (rating: number) => void;
}

const RatingContext = createContext<RatingContextType | undefined>(undefined);

export const useRating = () => {
  const context = useContext(RatingContext);
  if (context === undefined) {
    throw new Error('useRating must be used within a RatingProvider');
  }
  return context;
};

interface RatingProviderProps {
  children: React.ReactNode;
}

export const RatingProvider: React.FC<RatingProviderProps> = ({ children }) => {
  const [averageRating, setAverageRating] = useState<number>(0);
  const [totalRatings, setTotalRatings] = useState<number>(0);

  // Fetch rating stats from backend
  const fetchRatingStats = async () => {
    try {
      const response = await api.get('/ratings/stats');
      if (response.data.success) {
        setAverageRating(response.data.data.averageRating);
        setTotalRatings(response.data.data.totalRatings);
      }
    } catch (error) {
      console.error('Failed to fetch rating stats:', error);
    }
  };

  // Load rating stats on mount
  useEffect(() => {
    fetchRatingStats();
  }, []);

  const addRating = async (rating: number) => {
    if (rating < 1 || rating > 5) {
      console.error('Rating must be between 1 and 5');
      return;
    }

    try {
      const response = await api.post('/ratings', { rating });
      if (response.data.success) {
        // Update local state with new stats
        setAverageRating(response.data.data.averageRating);
        setTotalRatings(response.data.data.totalRatings);
      }
    } catch (error) {
      console.error('Failed to submit rating:', error);
      throw error;
    }
  };

  const value: RatingContextType = {
    averageRating,
    totalRatings,
    addRating
  };

  return (
    <RatingContext.Provider value={value}>
      {children}
    </RatingContext.Provider>
  );
};
