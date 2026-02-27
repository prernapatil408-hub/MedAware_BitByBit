// lib/MedicineContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type Medicine = {
  id: string;
  name: string;
  time: string;
  dosage: string;
  status: 'pending' | 'taken' | 'missed';
  date: string;
};

type MedicineContextType = {
  medicines: Medicine[];
  reminders: Medicine[];
  addMedicine: (medicine: Omit<Medicine, 'id'>) => Promise<void>;
  markTaken: (id: string) => Promise<void>;
  deleteMedicine: (id: string) => Promise<void>;
  loading: boolean;
};

const MedicineContext = createContext<MedicineContextType | undefined>(undefined);

export function MedicineProvider({ children }: { children: ReactNode }) {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMedicines();
  }, []);

  const loadMedicines = async () => {
    try {
      const data = await AsyncStorage.getItem('medicines');
      if (data) {
        setMedicines(JSON.parse(data));
      }
    } catch (error) {
      console.log('Load error:', error);
    } finally {
      setLoading(false);
    }
  };

  const addMedicine = async (medicine: Omit<Medicine, 'id'>) => {
    const newMedicine: Medicine = {
      ...medicine,
      id: Date.now().toString(),
      status: 'pending' as const,
      date: new Date().toISOString().split('T')[0],
    };
    
    const updated = [...medicines, newMedicine];
    setMedicines(updated);
    await AsyncStorage.setItem('medicines', JSON.stringify(updated));
  };

  const markTaken = async (id: string) => {
    const updated = medicines.map(m => 
      m.id === id ? { ...m, status: 'taken' as const } : m
    );
    setMedicines(updated);
    await AsyncStorage.setItem('medicines', JSON.stringify(updated));
  };

  const deleteMedicine = async (id: string) => {
    const updated = medicines.filter(m => m.id !== id);
    setMedicines(updated);
    await AsyncStorage.setItem('medicines', JSON.stringify(updated));
  };

  const reminders = medicines.filter(m => m.status === 'pending');

  return (
    <MedicineContext.Provider value={{
      medicines, reminders, addMedicine, markTaken, deleteMedicine, loading
    }}>
      {children}
    </MedicineContext.Provider>
  );
}

export const useMedicines = () => {
  const context = useContext(MedicineContext);
  if (!context) throw new Error('useMedicines must be used within MedicineProvider');
  return context;
};
