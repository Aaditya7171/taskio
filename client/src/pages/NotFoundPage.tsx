import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, ArrowLeft } from 'lucide-react';
import Button from '@/components/ui/Button';

const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-9xl font-bold gradient-text mb-4">404</h1>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Page Not Found
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
            The page you're looking for doesn't exist or has been moved to another location.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              as={Link}
              to="/dashboard"
              className="inline-flex items-center"
            >
              <Home className="w-4 h-4 mr-2" />
              Go to Dashboard
            </Button>
            
            <Button
              variant="outline"
              onClick={() => window.history.back()}
              className="inline-flex items-center"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default NotFoundPage;
