import React from 'react';

export const Skeleton = ({ className = '' }) => (
  <div className={`bg-slate-200 rounded-xl animate-pulse ${className}`}></div>
);

// A specific skeleton for Job Cards
export const JobCardSkeleton = () => (
  <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col justify-between">
    <div>
      <div className="flex justify-between mb-3">
        <Skeleton className="w-2/3 h-6" />
        <Skeleton className="w-10 h-6" />
      </div>
      <Skeleton className="w-full h-4 mt-2" />
      <Skeleton className="w-4/5 h-4 mt-2" />
    </div>
    <div className="flex justify-between items-center mt-6 pt-4 border-t">
      <Skeleton className="w-16 h-4" />
      <Skeleton className="w-24 h-8 rounded-xl" />
    </div>
  </div>
);