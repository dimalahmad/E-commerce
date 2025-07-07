"use client";

export default function Error({ error }: { error: Error }) {
  return (
    <div className="p-8 text-red-500">
      <h1>Terjadi Error</h1>
      <pre>{error.message}</pre>
    </div>
  );
} 
 
 
 
 
 
 
 