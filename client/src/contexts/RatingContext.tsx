import React, { createContext, useContext, useEffect, useState } from 'react';

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
  const [ratings, setRatings] = useState<number[]>(() => {
    const savedRatings = localStorage.getItem('taskio-ratings');
    return savedRatings ? JSON.parse(savedRatings) : [];
  });

  const [averageRating, setAverageRating] = useState<number>(0);
  const [totalRatings, setTotalRatings] = useState<number>(0);

  // Calculate average rating whenever ratings change
  useEffect(() => {
    if (ratings.length === 0) {
      setAverageRating(0);
      setTotalRatings(0);
      return;
    }

    const sum = ratings.reduce((acc, rating) => acc + rating, 0);
    setAverageRating(sum / ratings.length);
    setTotalRatings(ratings.length);

    // Save to localStorage
    localStorage.setItem('taskio-ratings', JSON.stringify(ratings));
  }, [ratings]);

  const addRating = (rating: number) => {
    if (rating < 1 || rating > 5) {
      console.error('Rating must be between 1 and 5');
      return;
    }
    
    setRatings(prevRatings => [...prevRatings, rating]);
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
