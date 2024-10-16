const express = require('express');
const cors = require('cors');
const mqtt = require('mqtt');
const admin = require('firebase-admin');
const http = require('http');
const socketIo = require('socket.io');
require('dotenv').config(); // Carga las variables de entorno desde .env

// Configuración de Firebase
const serviceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'), // Reemplaza el carácter \n
};

// Inicializa la aplicación Firebase
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: process.env.FIREBASE_DATABASE_URL,
});

// Inicializa la referencia a la base de datos
const db = admin.database(); // Añade esta línea

// Configuración del broker MQTT
const host = process.env.MQTT_HOST; // 'broker.emqx.io'
const port = process.env.MQTT_PORT; // 1883
const clientId = `mqtt_${Math.random().toString(16).slice(3)}`;
const username = process.env.MQTT_USERNAME; // 'duende'
const password = process.env.MQTT_PASSWORD; // '12345'

// Tópicos
const temperaturaTopic = 'casa/salon/temperatura';
const humedadTopic = 'casa/salon/humedad';
const bombaTopic = 'casa/salon/bomba';
const bombaControlTopic = 'casa/salon/control/bomba';

// URL de conexión MQTT
const connectUrl = `mqtt://${host}:${port}`;

// Conectar al broker MQTT
const client = mqtt.connect(connectUrl, {
  clientId,
  clean: true,
  connectTimeout: 4000,
  username,
  password,
  reconnectPeriod: 1000,
});

client.on('connect', () => {
  console.log('Conectado al broker MQTT');
  client.subscribe([temperaturaTopic, humedadTopic, bombaTopic, bombaControlTopic], () => {
    console.log(`Suscrito a los tópicos: ${temperaturaTopic}, ${humedadTopic}, ${bombaTopic}, ${bombaControlTopic}`);
  });
});

// Configuración del servidor Express y Socket.io
const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.CORS_ORIGIN, // 'http://localhost:3000'
    methods: ['GET', 'POST'], // Métodos permitidos
  },
});

// Usar CORS
app.use(cors({
  origin: process.env.CORS_ORIGIN, // 'http://localhost:3000'
  methods: ['GET', 'POST'], // Métodos permitidos
}));


// Middleware para parsear JSON
app.use(express.json());

// Procesar mensajes MQTT, enviar a Firebase y al frontend vía Socket.io
client.on('message', (topic, message) => {
  const valor = message.toString();
  const timestamp = Date.now();

  let data = {
    valor: parseFloat(valor),
    timestamp: timestamp,
  };

  if (topic === temperaturaTopic) {
    db.ref('mediciones/temperatura').push(data)
      .then(() => {
        console.log('Temperatura guardada en Firebase.');
        io.emit('temperatura', data);
      })
      .catch((error) => {
        console.error('Error al guardar temperatura en Firebase:', error);
      });
  } else if (topic === humedadTopic) {
    db.ref('mediciones/humedad').push(data)
      .then(() => {
        console.log('Humedad guardada en Firebase.');
        io.emit('humedad', data);
      })
      .catch((error) => {
        console.error('Error al guardar humedad en Firebase:', error);
      });
  } else if (topic === bombaTopic) {
    io.emit('bomba', data);
  } else if (topic === bombaControlTopic) {
    // Manejo de mensajes de control de la bomba
    console.log(`Acción de bomba recibida: ${valor}`);
    io.emit('control_bomba', { estado: valor, timestamp }); // Emitir evento para el frontend
  }
});

// Endpoint para obtener datos de temperatura y humedad
app.get('/api/mediciones', async (req, res) => {
  try {
    const temperaturaSnapshot = await db.ref('mediciones/temperatura').once('value');
    const humedadSnapshot = await db.ref('mediciones/humedad').once('value');

    const temperaturaData = temperaturaSnapshot.val();
    const humedadData = humedadSnapshot.val();

    res.json({
      temperatura: temperaturaData,
      humedad: humedadData,
    });
  } catch (error) {
    console.error('Error al obtener mediciones:', error);
    res.status(500).send('Error al obtener mediciones');
  }
});

// Control de la bomba desde el frontend
app.post('/api/bomba', (req, res) => {
  const { accion } = req.body;

  if (!accion || (accion !== 'encender' && accion !== 'apagar')) {
    return res.status(400).send('Acción no válida. Debe ser "encender" o "apagar".');
  }

  client.publish(bombaControlTopic, accion, { qos: 0, retain: false }, (error) => {
    if (error) {
      console.error('Error al publicar en el tópico de control de la bomba:', error);
      return res.status(500).send('Error al enviar acción a la bomba');
    }
    res.send(`Acción "${accion}" enviada a la bomba`);
  });
});

// Iniciar servidor
const backend_port = 1001;
server.listen(backend_port, () => {
  console.log(`Servidor ejecutándose en http://localhost:${backend_port}`);
});
