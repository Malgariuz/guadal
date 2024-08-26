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








async function seleccionarRutasInteligentes() {
  if (!userLocation) {
    console.error("Ubicación del usuario no disponible");
    return;
  }

  // Obtener los locales de Firebase
  const snapshot = await get(localesRef);
  if (snapshot.exists()) {
    const locales = snapshot.val();
    const localesNoListos = Object.values(locales).filter(local => local.estado === 'no-listo');
    
    // Ordenar locales por distancia desde la ubicación del usuario
    localesNoListos.sort((a, b) => {
      const distanciaA = calcularDistancia(userLocation, a.coordinates);
      const distanciaB = calcularDistancia(userLocation, b.coordinates);
      return distanciaA - distanciaB;
    });

    // Seleccionar los locales más cercanos
    const localesCercanos = localesNoListos.slice(0, 3); // Por ejemplo, seleccionar los 3 más cercanos

    // Obtener la ruta al primer local más cercano
    if (localesCercanos.length > 0) {
      const primerLocal = localesCercanos[0];
      getRoute(primerLocal.coordinates);
    }
  }
}



function mostrarLocalesInteligentes() {
  // Suponiendo que tienes una lista de locales cargada de Firebase
  var locales = obtenerLocales(); // Reemplazar con tu método para obtener los locales desde Firebase
  
  // Filtrar los locales que no estén listos
  var localesNoListos = locales.filter(function(local) {
      return local.estado === 'no listo';
  });

  // Ordenar locales por proximidad a la posición del usuario
  localesNoListos.sort(function(a, b) {
      return calcularDistancia(a.coordenadas, posicionUsuario) - calcularDistancia(b.coordenadas, posicionUsuario);
  });

  // Limpiar la lista actual de locales
  var listaLocalesDiv = document.getElementById('locales-list');
  listaLocalesDiv.innerHTML = '';

  // Mostrar los locales filtrados y ordenados
  localesNoListos.forEach(function(local) {
      var localItem = document.createElement('div');
      localItem.textContent = local.nombre + ' - ' + local.direccion;
      listaLocalesDiv.appendChild(localItem);
  });
}





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
                // Determinar el color del marcador según el estado del local
                const color = local.estado === 'no-listo' ? '#A9A9A9' :   // Gris oscuro para 'no listo'
                              local.estado === 'problema' ? '#ffc107' :  // Dorado para 'problema'
                              local.estado === 'realizado' ? 'green' : // Verde para 'realizado'
                              'red';  // Rojo como color por defecto para cualquier otro estado no definido

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


  const rutasInteligentesButton = document.getElementById('rutas-inteligentes-button');
  if (rutasInteligentesButton) {
    rutasInteligentesButton.addEventListener('click', seleccionarRutasInteligentes);
  } else {
    console.error('El botón de rutas inteligentes no se encuentra en el DOM.');
  }
});


document.getElementById('rutas-inteligentes-button').addEventListener('click', seleccionarRutasInteligentes);

// Modificaciones adicionales

// Añadir nuevos locales
// Función para activar el clic en el mapa y capturar coordenadas

// Añadir nuevos locales
// Añadir nuevos locales
document.getElementById('add-local-button').addEventListener('click', () => {
  // Mostrar el formulario y el botón "Terminar"
  document.getElementById('add-local-form').style.display = 'block';
  document.getElementById('terminar-button').style.display = 'inline';

  // Temporalmente cambiar las funciones del cursor y clic del mapa
  map.getCanvas().style.cursor = 'crosshair';

  const clickHandler = (e) => {
    // Capturar las coordenadas del clic
    const lat = e.lngLat.lat;
    const lng = e.lngLat.lng;

    // Añadir marcador al mapa con estado "no-listo" (color gris oscuro)
    const marker = new mapboxgl.Marker({ color: '#6c757d' })
      .setLngLat([lng, lat])
      .addTo(map);

    // Restaurar funciones normales del mapa
    map.off('click', clickHandler);
    map.getCanvas().style.cursor = '';

    // Guardar las coordenadas en el formulario para la entrada manual
    document.getElementById('coordinates').value = `${lng}, ${lat}`;
  };

  // Escuchar el clic en el mapa
  map.on('click', clickHandler);

  // Manejar el botón "Terminar"
  document.getElementById('terminar-button').addEventListener('click', async () => {
    const localName = document.getElementById('local-name').value;
    const localAddress = document.getElementById('local-address').value;
    const costo = document.getElementById('costo').value;
    const factura = document.getElementById('factura').value;
    const numeroFinca = document.getElementById('numero-finca').value;
    const coordinates = document.getElementById('coordinates').value.split(',').map(Number);

    if (localName && localAddress && coordinates.length === 2) {
      // Obtener el próximo ID secuencial
      const newId = await obtenerProximoId();

      // Añadir a Firebase en el formato adecuado
      const newLocalRef = ref(db, `locales/${newId}`);
      await set(newLocalRef, {
        id: newId,
        direccion: localAddress,
        nombre: localName,
        estado: "no-listo",
        coordinates: coordinates,
        costo: costo,
        factura: factura,
        numeroFinca: numeroFinca
      });

      // Ocultar el formulario y el botón "Terminar"
      document.getElementById('add-local-form').style.display = 'none';
      document.getElementById('terminar-button').style.display = 'none';
    } else {
      alert('Debe completar todos los campos del formulario.');
    }
  });
});






document.getElementById('desplegar-lista').addEventListener('click', async () => {
  const listaLocalesDiv = document.getElementById('locales-list');
  if (listaLocalesDiv.style.display === 'none' || listaLocalesDiv.style.display === '') {
      listaLocalesDiv.style.display = 'block'; // Mostrar la lista

      const snapshot = await get(localesRef);
      if (snapshot.exists()) {
          const locales = snapshot.val();
          listaLocalesDiv.innerHTML = '';  // Limpiar la lista

          Object.values(locales).forEach(local => {
              // Crear el contenedor del local
              const localItem = document.createElement('div');
              localItem.className = 'local-item';

              // Añadir la información del local
              localItem.innerHTML = `
                  <h4 style="margin: 0 0 5px 0;">${local.nombre}</h4>
                  <p style="margin: 5px 0;">Dirección: ${local.direccion}</p>
                  <p style="margin: 5px 0;">Costo: ${local.costo}</p>
                  <p style="margin: 5px 0;">Tipo de Factura: ${local.factura}</p>
                  <p style="margin: 5px 0;">Número de Finca: ${local.numeroFinca}</p>
                  <p style="margin: 5px 0;">Estado Actual: ${local.estado}</p>
                  <button class="start-route-btn">Iniciar Recorrido</button>
                  <button class="update-status-btn">Actualizar Estado</button>
                  <select class="status-select" style="display:none;">
                      <option value="no-listo">No Listo</option>
                      <option value="problema">Problema</option>
                      <option value="realizado">Realizado</option>
                  </select>
              `;

              // Añadir evento de clic para generar la ruta
              localItem.querySelector('.start-route-btn').addEventListener('click', () => {
                  getRoute(local.coordinates);
              });

              // Añadir evento para mostrar/ocultar el menú de estado y actualizar el estado
              const updateStatusBtn = localItem.querySelector('.update-status-btn');
              const statusSelect = localItem.querySelector('.status-select');

              updateStatusBtn.addEventListener('click', () => {
                  statusSelect.style.display = statusSelect.style.display === 'none' ? 'block' : 'none';
              });

              statusSelect.addEventListener('change', async (e) => {
                  const nuevoEstado = e.target.value;
                  await update(ref(database, `locales/${local.id}`), { estado: nuevoEstado });
                  alert(`Estado actualizado a: ${nuevoEstado}`);
                  statusSelect.style.display = 'none';
              });

              // Añadir el local al contenedor
              listaLocalesDiv.appendChild(localItem);
          });
      } else {
          console.error('No se encontraron locales en la base de datos.');
      }
  } else {
      listaLocalesDiv.style.display = 'none'; // Ocultar la lista
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