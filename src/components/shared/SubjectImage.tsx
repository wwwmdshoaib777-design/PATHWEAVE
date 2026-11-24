import React, { useState } from 'react';
import { BookOpen, FlaskConical, Sigma } from 'lucide-react';
import { SubjectId } from '../../types/domain';

interface SubjectImageProps {
  src: string;
  alt: string;
  subjectId: SubjectId;
  className?: string;
}

export const SubjectImage: React.FC<SubjectImageProps> = ({
  src,
  alt,
  subjectId,
  className = 'h-40 w-full object-cover',
}) => {
  const [failed, setFailed] = useState(false);

  if (failed || !src) {
    return (
      <div
        className={`flex flex-col items-center justify-center bg-slate-100 text-slate-600 ${className}`}
        role="img"
        aria-label={alt}
      >
        {subjectId === 'math' ? (
          <Sigma className="h-8 w-8 text-teal-700" aria-hidden="true" />
        ) : subjectId === 'science' ? (
          <FlaskConical className="h-8 w-8 text-teal-700" aria-hidden="true" />
        ) : (
          <BookOpen className="h-8 w-8 text-teal-700" aria-hidden="true" />
        )}
        <span className="mt-2 text-xs font-medium text-slate-600">{alt}</span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      className={className}
    />
  );
};
