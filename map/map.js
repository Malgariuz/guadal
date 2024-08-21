// Configuración de Mapbox y Firebase
mapboxgl.accessToken = 'pk.eyJ1IjoibWFsZ2FyaXV6IiwiYSI6ImNsenpoa3A1ZTB3em0ybW9xMmc0ZjNmMHEifQ.MeeRQSZk5zgeosIbPG3LCg';

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

firebase.initializeApp(firebaseConfig);
const db = firebase.database();

db.ref('locales').on('value', (snapshot) => {
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
  // Aquí puedes reutilizar la lógica de `cargarLocales`,
  // pero con `localesFiltrados` en lugar de `locales`
  const listaLocales = document.getElementById('lista-locales');
  listaLocales.innerHTML = '';  // Limpia la lista actual

  localesFiltrados.forEach(local => {
      // Crear elementos HTML para cada local filtrado
      const localElement = document.createElement('div');
      localElement.className = 'local-item';
      localElement.textContent = `${local.nombre} - ${local.direccion}`;
      listaLocales.appendChild(localElement);
  });
}



function actualizarEstadoMapa(local) {
  const color = local.estado === 'realizado' ? 'green' :
                local.estado === 'problema' ? 'red' : 'blue';

  const marker = L.marker([local.latitud, local.longitud], {
      color: color
  }).addTo(map);

  marker.on('click', function() {
      cambiarEstadoEnMapa(local.id, nuevoEstado);
  });
}

async function cambiarEstadoEnMapa(id, nuevoEstado) {
  const snapshot = await get(child(ref(db), 'locales'));
  let locales = snapshot.exists() ? snapshot.val() : [];
  const local = locales.find(local => local.id === id);

  if (local) {
      local.estado = nuevoEstado;
      await set(ref(db, 'locales'), locales);
      cargarLocales();  // Recargar la lista de locales
  }
}






// Funcionalidad de búsqueda
document.getElementById('search-button').addEventListener('click', async () => {
    const query = document.getElementById('search-input').value;
    const mapCenter = map.getCenter(); // Obtén el centro actual del mapa
    const [centerLng, centerLat] = [mapCenter.lng, mapCenter.lat];
  
    // Añadir parámetro de proximidad para ajustar la búsqueda a la región visible
    const response = await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?proximity=${centerLng},${centerLat}&access_token=${mapboxgl.accessToken}`);
    const data = await response.json();
  
    // Verificar si se obtuvieron resultados
    if (data.features && data.features.length > 0) {
      // Obtener el resultado más relevante
      const bestResult = data.features[0];
      const [lng, lat] = bestResult.center;
  
      // Limpiar marcador anterior si existe
      if (map.getLayer('end')) {
        map.removeLayer('end');
        map.removeSource('end');
      }
  
      // Añadir nuevo marcador y ruta
      const end = [lng, lat];
      const endMarker = {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            properties: {},
            geometry: {
              type: 'Point',
              coordinates: end
            }
          }
        ]
      };
      map.addLayer({
        id: 'end',
        type: 'circle',
        source: {
          type: 'geojson',
          data: endMarker
        },
        paint: {
          'circle-radius': 10,
          'circle-color': '#f30'
        }
      });
      getRoute(end);
    } else {
      alert('No se encontraron resultados para la dirección proporcionada.');
    }
  });

// Funcionalidad de la barra lateral
document.getElementById('hamburger-menu').addEventListener('click', () => {
  const sidebar = document.getElementById('sidebar');
  sidebar.classList.toggle('open');
});
// Modificaciones adicionales

// Añadir nuevos locales
document.getElementById('add-local-button').addEventListener('click', async () => {
  const localName = prompt('Ingrese el nombre del local:');
  const localAddress = prompt('Ingrese la dirección del local:');

  if (localName && localAddress) {
    const response = await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(localAddress)}.json?access_token=${mapboxgl.accessToken}`);
    const data = await response.json();
    const [lng, lat] = data.features[0].center;

    // Añadir a Firebase
    const newLocalRef = db.ref('locales').push();
    newLocalRef.set({
      name: localName,
      address: localAddress,
      coordinates: [lng, lat],
      state: 'pending'
    });

    // Añadir marcador al mapa
    new mapboxgl.Marker({ color: '#3887be' })
      .setLngLat([lng, lat])
      .addTo(map);
  } else {
    alert('Debe ingresar el nombre y la dirección del local.');
  }
});

// Escuchar cambios en Firebase y actualizar el estado de los locales
db.ref('locales').on('child_changed', (snapshot) => {
  const local = snapshot.val();
  const coords = local.coordinates;

  if (Array.isArray(coords) && coords.length === 2 && !isNaN(coords[0]) && !isNaN(coords[1])) {
    const markerColor = local.state === 'realizado' ? 'green' : local.state === 'problema' ? 'yellow' : 'gray';
    new mapboxgl.Marker({ color: markerColor })
      .setLngLat(coords)
      .addTo(map);
  }
});