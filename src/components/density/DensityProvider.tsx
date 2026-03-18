"use client";
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

type Density = 'comfortable' | 'compact';
interface DensityCtx {
  density: Density;
  toggle: () => void;
}

const DensityContext = createContext<DensityCtx | undefined>(undefined);

export function DensityProvider({ children }: { children: ReactNode }) {
  const [density, setDensity] = useState<Density>('comfortable');

  useEffect(() => {
    const stored = localStorage.getItem('density') as Density | null;
    if (stored) setDensity(stored);
  }, []);

  function toggle() {
    const next = density === 'comfortable' ? 'compact' : 'comfortable';
    setDensity(next);
    localStorage.setItem('density', next);
  }

  return (
    <DensityContext.Provider value={{ density, toggle }}>
      <div className={density === 'compact' ? 'density-compact' : 'density-comfortable'}>{children}</div>
    </DensityContext.Provider>
  );
}

export function useDensity() {
  const ctx = useContext(DensityContext);
  if (!ctx) throw new Error('useDensity must be used within DensityProvider');
  return ctx;
}
