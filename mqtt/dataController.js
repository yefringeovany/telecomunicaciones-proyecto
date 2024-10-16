import { useEffect, useState } from 'react';
import io from 'socket.io-client';

const socket = io('http://localhost:1001'); // Cambiado a puerto 1001

const useDataController = () => {
  const [temperatura, setTemperatura] = useState([]);
  const [humedad, setHumedad] = useState([]);

  useEffect(() => {
    // Escuchar los eventos de temperatura desde el backend
    socket.on('temperatura', (data) => {
      setTemperatura((prev) => [...prev, data]); // Agregar el nuevo dato
    });

    // Escuchar los eventos de humedad desde el backend
    socket.on('humedad', (data) => {
      setHumedad((prev) => [...prev, data]); // Agregar el nuevo dato
    });

    // Limpiar los eventos al desmontar el componente
    return () => {
      socket.off('temperatura');
      socket.off('humedad');
    };
  }, []);

  return { temperatura, humedad };
};

export default useDataController; 