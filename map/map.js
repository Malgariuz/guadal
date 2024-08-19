// map.js

mapboxgl.accessToken = 'pk.eyJ1IjoibWFsZ2FyaXV6IiwiYSI6ImNsenpoa3A1ZTB3em0ybW9xMmc0ZjNmMHEifQ.MeeRQSZk5zgeosIbPG3LCg';
const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v11',
    center: [-58.4173, -34.6118], // Coordenadas de Buenos Aires
    zoom: 12
});

// Recuperar y mostrar los locales desde localStorage
const listaLocales = JSON.parse(localStorage.getItem('locales')) || [];
listaLocales.forEach(local => {
    const { direccion, nombre, estado, longitude, latitude } = local;
    if (typeof longitude === 'number' && typeof latitude === 'number') {
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
    } else {
        console.error('Datos inválidos para el local:', local);
    }
});

// Manejo de la barra lateral
document.getElementById('hamburger-menu').addEventListener('click', () => {
    const sidebar = document.getElementById('sidebar');
    sidebar.style.display = sidebar.style.display === 'block' ? 'none' : 'block';
});

// Manejo de la opción de añadir local
document.getElementById('add-local-btn').addEventListener('click', () => {
    map.once('click', (e) => {
        const lngLat = e.lngLat;
        const nombre = prompt('Ingrese el nombre del local:');
        const direccion = prompt('Ingrese la dirección del local:');
        const estado = prompt('Ingrese el estado del local (realizado, problema, etc.):');

        if (nombre && direccion && estado) {
            const local = {
                nombre,
                direccion,
                estado,
                longitude: lngLat.lng,
                latitude: lngLat.lat
            };

            // Guardar en localStorage
            const listaLocales = JSON.parse(localStorage.getItem('locales')) || [];
            listaLocales.push(local);
            localStorage.setItem('locales', JSON.stringify(listaLocales));

            // Añadir marcador al mapa
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
                .setLngLat([lngLat.lng, lngLat.lat])
                .setPopup(new mapboxgl.Popup().setText(`${nombre}: ${direccion}`))
                .addTo(map);
        }
    });
});
