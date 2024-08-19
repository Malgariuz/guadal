import mapboxgl from 'mapbox-gl';
import './map.css';

mapboxgl.accessToken = 'pk.eyJ1IjoibWFsZ2FyaXV6IiwiYSI6ImNsenpoa3A1ZTB3em0ybW9xMmc0ZjNmMHEifQ.MeeRQSZk5zgeosIbPG3LCg';
const map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/mapbox/streets-v11',
  center: [-58.4173, -34.6118], // Coordenadas de Buenos Aires
  zoom: 12
});

const listaLocales = JSON.parse(localStorage.getItem('locales')) || [];
listaLocales.forEach(local => {
  const { direccion, nombre, estado, longitude, latitude } = local;
  let color;
  switch (estado) {
    case 'realizado':
      color = 'green';
      break;
    case 'problema':
      color = 'yellow';
      break;
    default:
      color = 'gray';
  }

  new mapboxgl.Marker({ color })
    .setLngLat([longitude, latitude])
    .setPopup(new mapboxgl.Popup().setText(`${nombre}: ${direccion}`))
    .addTo(map);
});

document.getElementById('hamburger-menu').addEventListener('click', () => {
  const sidebar = document.getElementById('sidebar');
  sidebar.style.display = sidebar.style.display === 'block' ? 'none' : 'block';
});
