// Charts.js
import React from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const GraphicCharts = ({ temperaturaData, humedadData }) => {
  const temperaturaChartData = {
    labels: temperaturaData.map(data => new Date(data.timestamp).toLocaleTimeString()), // Timestamps como etiquetas
    datasets: [
      {
        label: 'Temperatura (°C)',
        data: temperaturaData.map(data => data.valor),
        borderColor: 'rgba(255, 99, 132, 1)',
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        fill: true,
      },
    ],
  };

  const humedadChartData = {
    labels: humedadData.map(data => new Date(data.timestamp).toLocaleTimeString()), // Timestamps como etiquetas
    datasets: [
      {
        label: 'Humedad (%)',
        data: humedadData.map(data => data.valor),
        borderColor: 'rgba(54, 162, 235, 1)',
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        fill: true,
      },
    ],
  };

  return (
    <div className="charts-container">
      <h2>Gráfico de Temperatura</h2>
      <Line data={temperaturaChartData} />

      <h2>Gráfico de Humedad</h2>
      <Line data={humedadChartData} />
    </div>
  );
};

export default GraphicCharts;
