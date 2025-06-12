import React from 'react';
import {Loader as LoadingIcon} from 'lucide-react'

function Loader({ size = 24, color = 'text-indigo-600', text = 'loading ...'}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <LoadingIcon size={size} className={`text-indigo-600 animate-spin mb-4 ${color}`} />
      <h2 className="text-xl font-medium text-gray-700"> {text} </h2>
    </div>
  );
}

export default Loader;
