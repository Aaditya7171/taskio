import React from 'react';
import { ExternalLink } from 'lucide-react';

interface NotesDisplayProps {
  content: string;
  className?: string;
}

const NotesDisplay: React.FC<NotesDisplayProps> = ({ content, className = '' }) => {
  // Function to detect and convert URLs to clickable links
  const linkifyText = (text: string) => {
    // Regular expression to match URLs
    const urlRegex = /(https?:\/\/[^\s]+|www\.[^\s]+|[^\s]+\.[a-z]{2,}(?:\/[^\s]*)?)/gi;
    
    const parts = text.split(urlRegex);
    
    return parts.map((part, index) => {
      if (urlRegex.test(part)) {
        // Ensure the URL has a protocol
        let href = part;
        if (!part.startsWith('http://') && !part.startsWith('https://')) {
          href = `https://${part}`;
        }
        
        return (
          <a
            key={index}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 underline decoration-blue-600/30 hover:decoration-blue-800/50 transition-colors"
          >
            {part}
            <ExternalLink className="w-3 h-3" />
          </a>
        );
      }
      return part;
    });
  };

  // Function to process text with line breaks and links
  const processText = (text: string) => {
    const lines = text.split('\n');
    
    return lines.map((line, lineIndex) => (
      <React.Fragment key={lineIndex}>
        {linkifyText(line)}
        {lineIndex < lines.length - 1 && <br />}
      </React.Fragment>
    ));
  };

  if (!content || content.trim() === '') {
    return (
      <div className={`text-gray-500 dark:text-gray-400 italic ${className}`}>
        No notes added yet.
      </div>
    );
  }

  return (
    <div className={`whitespace-pre-wrap text-gray-900 dark:text-gray-100 ${className}`}>
      {processText(content)}
    </div>
  );
};

export default NotesDisplay;
