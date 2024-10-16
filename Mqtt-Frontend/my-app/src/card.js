import React from 'react';
import './Card.css'; // Asegúrate de tener un archivo CSS para estilos si es necesario.

const Card = ({ title, value, timestamp, loading, icon }) => {
  return (
    <div className="card">
      <h2>
        {icon && <i className={icon} aria-hidden="true" style={{ marginRight: '8px' }}></i>}
        {title}
      </h2>
      <p>{loading ? <span className="loading">Cargando...</span> : value}</p>
      {timestamp && <p>{new Date(timestamp).toLocaleString()}</p>}
    </div>
  );
};

export default Card;
