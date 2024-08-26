// Configuración de Mapbox y Firebase
mapboxgl.accessToken = 'pk.eyJ1IjoibWFsZ2FyaXV6IiwiYSI6ImNsenpoa3A1ZTB3em0ybW9xMmc0ZjNmMHEifQ.MeeRQSZk5zgeosIbPG3LCg';


// Importar las funciones necesarias de los SDKs
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import { getDatabase, ref, set, get, child, update, remove } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-database.js";

const map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/mapbox/streets-v12',
  center: [-65.466666666667, -33.666666666667], // Posición inicial para Villa Mercedes
  zoom: 12
});

map.addControl(new MapboxGeocoder({
  accessToken: mapboxgl.accessToken
}));
map.addControl(new mapboxgl.NavigationControl());
map.addControl(new mapboxgl.FullscreenControl());
const geolocateControl = new mapboxgl.GeolocateControl({
  positionOptions: {
      enableHighAccuracy: true
  },
  trackUserLocation: true
});

map.addControl(geolocateControl);

let userLocation = null;

geolocateControl.on('geolocate', (event) => {
  userLocation = [event.coords.longitude, event.coords.latitude];
});

map.on('mousemove', function (e) {
  document.getElementById('coordenadas').innerHTML =
      JSON.stringify(e.lngLat);
});

// Inicializar Firebase
const firebaseConfig = {
    apiKey: "AIzaSyA_W6iFuTLoWVf0VExW7QTy9VJlXnMUOS0",
    authDomain: "malgariuz.firebaseapp.com",
    databaseURL: "https://malgariuz-default-rtdb.firebaseio.com",
    projectId: "malgariuz",
    storageBucket: "malgariuz.appspot.com",
    messagingSenderId: "18994913717",
    appId: "1:18994913717:web:be2e0b0e5d63211d6bb9fc",
    measurementId: "G-56D4TMG32S"
};

const app = initializeApp(firebaseConfig);
/** @type {import("https://malgariuz-default-rtdb.firebaseio.com/").Database} */
const db = getDatabase(app);

// Función para obtener el próximo ID secuencial
async function obtenerProximoId() {
  const snapshot = await get(child(ref(db), 'locales'));
  const locales = snapshot.exists() ? snapshot.val() : {};
  const ids = Object.keys(locales).map(Number);
  return ids.length > 0 ? Math.max(...ids) + 1 : 0; // Retorna el próximo ID secuencial
}

const localesRef = ref(db, 'locales');
get(localesRef).then((snapshot) => {
    if (snapshot.exists()) {
        const locales = snapshot.val();
        for (const id in locales) {
            const local = locales[id];
            const coords = local.coordinates; // Suponiendo que las coordenadas están almacenadas en el formato [lng, lat]

            // Validación de las coordenadas
            if (Array.isArray(coords) && coords.length === 2 && !isNaN(coords[0]) && !isNaN(coords[1])) {
                const color = local.state === 'problema' ? '#ffc107' : '#3887be';
                new mapboxgl.Marker({ color })
                    .setLngLat(coords)
                    .addTo(map);
            } else {
                console.error(`Coordenadas inválidas para el local ${id}:`, coords);
            }
        }
    }
}).catch((error) => {
    console.error("Error al obtener los datos:", error);
});

// Configuración del mapa
const bounds = [
  [-65.5, -33.7],
  [-65.4, -33.6]
];
map.setMaxBounds(bounds);

const start = [-65.466666666667, -33.666666666667]; // Villa Mercedes

map.on('click', (event) => {
  const coords = Object.keys(event.lngLat).map((key) => event.lngLat[key]);
  const end = {
      type: 'FeatureCollection',
      features: [
          {
              type: 'Feature',
              properties: {},
              geometry: {
                  type: 'Point',
                  coordinates: coords
              }
          }
      ]
  };

  if (map.getLayer('end')) {
      map.getSource('end').setData(end);
  } else {
      map.addLayer({
          id: 'end',
          type: 'circle',
          source: {
              type: 'geojson',
              data: {
                  type: 'FeatureCollection',
                  features: [
                      {
                          type: 'Feature',
                          properties: {},
                          geometry: {
                              type: 'Point',
                              coordinates: coords
                          }
                      }
                  ]
              }
          },
          paint: {
              'circle-radius': 10,
              'circle-color': '#f30'
          }
      });
  }

  getRoute(coords);
});

// Crear una función para hacer una solicitud de direcciones
async function getRoute(end) {
  if (!userLocation) {
    console.error("Ubicación del usuario no disponible");
    return;
  }

  const query = await fetch(
    `https://api.mapbox.com/directions/v5/mapbox/driving/${userLocation[0]},${userLocation[1]};${end[0]},${end[1]}?steps=true&geometries=geojson&overview=full&access_token=${mapboxgl.accessToken}`,
    { method: 'GET' }
  );

  const json = await query.json();
  const data = json.routes[0];
  const route = data.geometry.coordinates;
  const geojson = {
    type: 'Feature',
    properties: {},
    geometry: {
      type: 'LineString',
      coordinates: route
    }
  };

  if (map.getSource('route')) {
    map.getSource('route').setData(geojson);
  } else {
    map.addLayer({
      id: 'route',
      type: 'line',
      source: {
        type: 'geojson',
        data: geojson
      },
      layout: {
        'line-join': 'round',
        'line-cap': 'round'
      },
      paint: {
        'line-color': '#3887be',
        'line-width': 5,
        'line-opacity': 0.75
      }
    });
  }

  // Añadir instrucciones de giro aquí
  const instructions = document.getElementById('instructions-content');
  const steps = data.legs[0].steps;
  let tripInstructions = '';
  for (const step of steps) {
    tripInstructions += `<li>${step.maneuver.instruction}</li>`;
  }
  instructions.innerHTML = `<p><strong>Duración del viaje: ${Math.floor(data.duration / 60)} min 🚗 </strong></p><ol>${tripInstructions}</ol>`;
}

map.on('load', async () => {
  getRoute(start);

  // Añadir punto de inicio al mapa
  map.addLayer({
    id: 'point',
    type: 'circle',
    source: {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            properties: {},
            geometry: {
              type: 'Point',
              coordinates: start
            }
          }
        ]
      }
    },
    paint: {
      'circle-radius': 10,
      'circle-color': '#3887be'
    }
  });
});

// Función para filtrar locales por mes
async function filtrarPorMes(mes) {
  const snapshot = await get(child(ref(db), 'locales'));
  if (snapshot.exists()) {
      const locales = snapshot.val() || [];
      const localesFiltrados = locales.filter(local => {
          // Supongamos que tienes una fecha en el formato `dd/MM/yyyy`
          const fecha = local.fecha; // Asegúrate de que la fecha esté guardada en cada local
          const mesLocal = new Date(fecha).toLocaleString('es-ES', { month: 'long' });
          return mesLocal.toLowerCase() === mes.toLowerCase();
      });
      // Mostrar solo los locales filtrados
      cargarLocalesFiltrados(localesFiltrados);
  }
}

// Función para cargar los locales filtrados en la página
function cargarLocalesFiltrados(localesFiltrados) {
  const listaLocales = document.getElementById('lista-locales');
  listaLocales.innerHTML = '';  // Limpia la lista actual

  localesFiltrados.forEach(local => {
    const localElement = document.createElement('div');
    localElement.className = 'local-item';
    localElement.textContent = `${local.name} - ${local.address}`;
    listaLocales.appendChild(localElement);
  });
}

function actualizarEstadoMapa(local) {
  const color = local.estado === 'realizado' ? 'green' :
                local.estado === 'problema' ? 'red' : 'blue';

  const marker = new mapboxgl.Marker({
      color: color
  }).setLngLat([local.latitud, local.longitud]).addTo(map);

  marker.on('click', function() {
      cambiarEstadoEnMapa(local.id, nuevoEstado);
  });
}

async function cambiarEstadoEnMapa(id, nuevoEstado) {
  const snapshot = await get(child(ref(db), `locales/${id}`));
  if (snapshot.exists()) {
    const local = snapshot.val();
    local.state = nuevoEstado;

    const updates = {};
    updates[`/locales/${id}`] = local;
    await update(ref(db), updates);

    // Recarga los marcadores en el mapa
    cargarLocales([local]);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  // Añadir escuchadores de eventos para los botones de filtro
  const filtroJulio = document.getElementById('filtro-julio');
  const filtroAgosto = document.getElementById('filtro-agosto');
  const hamburgerMenu = document.getElementById('hamburger-menu');
  const sidebar = document.getElementById('sidebar');

  if (filtroJulio) {
      filtroJulio.addEventListener('click', () => filtrarPorMes('julio'));
  } else {
      console.error('El elemento con ID "filtro-julio" no se encuentra en el DOM.');
  }

  if (filtroAgosto) {
      filtroAgosto.addEventListener('click', () => filtrarPorMes('agosto'));
  } else {
      console.error('El elemento con ID "filtro-agosto" no se encuentra en el DOM.');
  }

  // Funcionalidad de la barra lateral
  if (hamburgerMenu && sidebar) {
      hamburgerMenu.addEventListener('click', () => {
          sidebar.classList.toggle('open');
      });
  } else {
      console.error('Los elementos con ID "hamburger-menu" o "sidebar" no se encuentran en el DOM.');
  }
});
// Modificaciones adicionales

// Añadir nuevos locales
// Función para activar el clic en el mapa y capturar coordenadas

// Añadir nuevos locales
// Añadir nuevos locales
document.getElementById('add-local-button').addEventListener('click', async () => {
  const localName = prompt('Ingrese el nombre del local:');
  const localAddress = prompt('Ingrese la dirección del local:');
  let lat, lng;

  if (localName && localAddress) {
      const response = await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(localAddress)}.json?access_token=${mapboxgl.accessToken}`);
      const data = await response.json();
      [lng, lat] = data.features[0].center;

      // Temporalmente cambiar las funciones del cursor y clic del mapa
      map.getCanvas().style.cursor = 'crosshair';

      const clickHandler = (e) => {
          // Capturar las coordenadas del clic
          lat = e.lngLat.lat;
          lng = e.lngLat.lng;

          // Añadir marcador al mapa
          new mapboxgl.Marker({ color: '#3887be' })
              .setLngLat([lng, lat])
              .addTo(map);

          // Restaurar funciones normales del mapa
          map.off('click', clickHandler);
          map.getCanvas().style.cursor = '';
      };

      // Escuchar el clic en el mapa
      map.on('click', clickHandler);

      // Opción para ingresar manualmente las coordenadas
      const manualEntry = confirm('¿Desea ingresar las coordenadas manualmente?');
      if (manualEntry) {
          lat = prompt('Ingrese la latitud:', lat);
          lng = prompt('Ingrese la longitud:', lng);

          // Añadir marcador al mapa con coordenadas manuales
          new mapboxgl.Marker({ color: '#3887be' })
              .setLngLat([lng, lat])
              .addTo(map);

          // Restaurar funciones normales del mapa
          map.off('click', clickHandler);
          map.getCanvas().style.cursor = '';
      }

      // Obtener el próximo ID secuencial
      const newId = await obtenerProximoId();

      // Añadir a Firebase en el formato adecuado
      const newLocalRef = ref(db, `locales/${newId}`);
      await set(newLocalRef, {
          id: newId,
          direccion: localAddress,
          nombre: localName,
          estado: "no-listo",
          coordinates: [lng, lat],
          costo: 2500 + tasa, // Valor por defecto o calculado
          factura: 'A', // Valor por defecto o seleccionado
          numeroFinca: '', // Valor por defecto o ingresado
          
      });

  } else {
      alert('Debe ingresar el nombre y la dirección del local.');
  }
});






// Escuchar cambios en Firebase y actualizar el estado de los locales

localesRef.on('child_changed', (snapshot) => {
  const local = snapshot.val();
  const coords = local.coordinates;

  if (Array.isArray(coords) && coords.length === 2 && !isNaN(coords[0]) && !isNaN(coords[1])) {
    const markerColor = local.state === 'realizado' ? 'green' : local.state === 'problema' ? 'yellow' : 'gray';
    new mapboxgl.Marker({ color: markerColor })
      .setLngLat(coords)
      .addTo(map);
  }
});