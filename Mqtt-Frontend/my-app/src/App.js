import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import useSocket from './useSocket';
import Card from './card'; // Asegúrate de que el nombre del archivo es correcto
import GraphicCharts from './GraphicChart';
import './App.css';

function App() {
  const { temperatura, humedad, temperaturaData, humedadData } = useSocket();
  const [notificacion, setNotificacion] = useState('');
  const [bombaEstado, setBombaEstado] = useState('Desconocido');

  useEffect(() => {
    const socket = io(process.env.REACT_APP_SOCKET_URL); // Cambia aquí

    socket.on('temperatura', (data) => {
      if (data.valor > 30) {
        setNotificacion(`La temperatura ha superado los 30 °C: ${data.valor}`);
        setTimeout(() => setNotificacion(''), 5000);
      }
    });

    socket.on('humedad', (data) => {
      // Procesa la humedad si es necesario
    });

    socket.on('control_bomba', (data) => {
      if (data.estado) {
        setBombaEstado(data.estado);
      }
      if (data.estado === 'Bomba encendida manualmente') {
        setNotificacion('La bomba se encendió manualmente');
      } else if (data.estado === 'Bomba apagada manualmente') {
        setNotificacion('La bomba se apagó manualmente');
      }
      setTimeout(() => setNotificacion(''), 5000);
    });

    return () => socket.disconnect();
  }, []);

  const controlarBomba = (accion) => {
    fetch(`${process.env.REACT_APP_SOCKET_URL}/api/bomba`, { // Cambia aquí
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ accion }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (accion === 'encender') {
          setBombaEstado('Bomba encendida manualmente');
          setNotificacion('Bomba Encendida');
        } else if (accion === 'apagar') {
          setBombaEstado('Bomba apagada manualmente');
          setNotificacion('Bomba Apagada');
        }
        setTimeout(() => setNotificacion(''), 5000);
      })
      .catch((err) => console.error('Error:', err));
  };

  return (
    <div className="app-container">
      <h1>Monitor de Temperatura y Humedad</h1>
      
      {/* Notificación */}
      {notificacion && (
        <div className="notification">
          {notificacion}
        </div>
      )}
      
      <Card
        title="Temperatura"
        value={temperatura ? `${temperatura.valor} °C` : 'Cargando...'}
        timestamp={temperatura ? temperatura.timestamp : null}
        loading={!temperatura}
        icon="fa-solid fa-thermometer-half" // Icono de temperatura
      />
      <Card
        title="Humedad"
        value={humedad ? `${humedad.valor} %` : 'Cargando...'}
        timestamp={humedad ? humedad.timestamp : null}
        loading={!humedad}
        icon="fa-solid fa-tint" // Icono de humedad
      />
      
      <GraphicCharts temperaturaData={temperaturaData} humedadData={humedadData} />

      <div className="bomba-controls">
        <button className="bomba-button encender" onClick={() => controlarBomba('encender')}>Encender Bomba</button>
        <button className="bomba-button apagar" onClick={() => controlarBomba('apagar')}>Apagar Bomba</button>
      </div>

      <div className="bomba-status">
        Estado de la bomba: {bombaEstado}
      </div>
    </div>
  );
}

export default App;
