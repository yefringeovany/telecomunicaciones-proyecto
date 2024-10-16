import { useEffect, useState } from 'react';
import io from 'socket.io-client';

const socket = io(process.env.REACT_APP_SOCKET_URL); // URL del servidor Socket.IO

function useSocket() {
  const [temperatura, setTemperatura] = useState(null);
  const [humedad, setHumedad] = useState(null);
  const [temperaturaData, setTemperaturaData] = useState([]);
  const [humedadData, setHumedadData] = useState([]);

  useEffect(() => {
    socket.on('temperatura', (data) => {
      setTemperatura(data);
      setTemperaturaData((prev) => [...prev, data].slice(-10)); // Limita a los últimos 10 datos
    });

    socket.on('humedad', (data) => {
      setHumedad(data);
      setHumedadData((prev) => [...prev, data].slice(-10)); // Limita a los últimos 10 datos
    });

    return () => {
      socket.off('temperatura');
      socket.off('humedad');
    };
  }, []);

  return { temperatura, humedad, temperaturaData, humedadData };
}

export default useSocket;
