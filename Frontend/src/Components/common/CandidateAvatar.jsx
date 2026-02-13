// import React from 'react'; 

/**
 * Reusable CandidateAvatar Component
 * Displays a candidate's avatar with initials
 * 
 * @param {string} name - Candidate name
 * @param {string} bgColor - Background color for the avatar
 * @param {string} size - Size class (w-8 h-8, w-10 h-10, w-12 h-12, etc.)
 * @param {string} textSize - Text size class (text-xs, text-sm, etc.)
 */
const CandidateAvatar = ({ 
  name, 
  bgColor = '#6AE8D3', 
  size = 'w-10 h-10', 
  textSize = 'text-sm' 
}) => {
  const getInitials = (fullName) => {
    return fullName
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };

  return (
    <div 
      className={`${size} rounded-full flex items-center justify-center font-semibold text-white shrink-0 ${textSize}`}
      style={{ backgroundColor: bgColor }}
    >
      {getInitials(name)}
    </div>
  );
};

export default CandidateAvatar;
