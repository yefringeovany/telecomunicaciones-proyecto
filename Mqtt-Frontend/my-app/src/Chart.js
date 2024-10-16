// Chart.js
import React from 'react';
import { Line } from 'react-chartjs-2';

const Chart = ({ temperaturaData, humedadData }) => {
  const temperaturaValues = temperaturaData.map(data => data.valor);
  const humedadValues = humedadData.map(data => data.valor);
  const timestamps = temperaturaData.map(data => new Date(data.timestamp).toLocaleTimeString());

  const data = {
    labels: timestamps,
    datasets: [
      {
        label: 'Temperatura (°C)',
        data: temperaturaValues,
        borderColor: 'rgba(255, 99, 132, 1)',
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        fill: true,
      },
      {
        label: 'Humedad (%)',
        data: humedadValues,
        borderColor: 'rgba(54, 162, 235, 1)',
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        fill: true,
      },
    ],
  };

  const options = {
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  return <Line data={data} options={options} />;
};

export default Chart;
