// Importar las funciones necesarias de los SDKs
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import { getDatabase, ref, set, get, child, update, remove } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-database.js";

// Configuración de tu aplicación web en Firebase
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

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// Clave requerida para la autenticación
const CLAVE_CORRECTA = 'malgariuz';

// Verifica si el usuario está autenticado
function verificarAutenticacion() {
    const autenticado = localStorage.getItem('autenticado');
    
    if (autenticado === CLAVE_CORRECTA) {
        document.getElementById('estado-usuario').textContent = 'Ingresado como malgariuz';
    } else {
        document.getElementById('estado-usuario').textContent = 'Vista previa';
        redirigirSiNoAutenticado();
    }
}



// Redirige a la página de inicio si no está autenticado
function redirigirSiNoAutenticado() {
    if (window.location.pathname !== '/index.html' && window.location.pathname !== '/map/map.html') {
        window.location.href = 'index.html';
    }
}

// Autentica al usuario y guarda el estado
function autenticarUsuario(clave) {
    if (clave === CLAVE_CORRECTA) {
        localStorage.setItem('autenticado', CLAVE_CORRECTA);
        window.location.href = 'locales.html'; // Redirige a locales.html
    } else {
        alert('Clave incorrecta');
    }
}





// Función para generar un identificador único
function generarId(locales) {
    return locales.length > 0 ? Math.max(...locales.map(local => local.id)) + 1 : 1;
}

// Función para guardar los locales en Firebase
// Función para guardar los locales en Firebase
async function guardarLocales() {
    const locales = document.querySelectorAll('.local');
    const localesArray = Array.from(locales).map(local => ({
        id: parseInt(local.getAttribute('data-id')),
        costo: local.getAttribute('data-costo'),
        factura: local.getAttribute('data-factura'),
        direccion: local.getAttribute('data-direccion'),
        nombre: local.getAttribute('data-nombre'),
        estado: local.querySelector('select').value,
        numeroFinca: local.getAttribute('data-numero-finca'), // Guardar el número de finca
        coordinates: [parseFloat(local.getAttribute('data-longitud')), parseFloat(local.getAttribute('data-latitud'))]
    }));
    await set(ref(db, 'locales'), localesArray);
    
}


// Función para cargar los locales desde Firebase
async function cargarLocales() {
    const listaLocales = document.getElementById('lista-locales');
    const lineaSeparadora = document.getElementById('linea-separadora');
    listaLocales.innerHTML = ''; // Limpiar la lista antes de cargar
 
    const snapshot = await get(child(ref(db), 'locales'));
    if (snapshot.exists()) {
        const locales = snapshot.val() || [];
 
        // Ordenar los locales
        locales.sort((a, b) => a.estado === 'realizado' ? 1 : -1);
 
        let seMostroSeparador = false;
 
        locales.forEach(local => {
            const localDiv = document.createElement('div');
            localDiv.classList.add('local');
            localDiv.setAttribute('data-id', local.id);
            localDiv.setAttribute('data-costo', local.costo);
            localDiv.setAttribute('data-factura', local.factura === 'otra' ? 'B' : local.factura);
            localDiv.setAttribute('data-direccion', local.direccion);
            localDiv.setAttribute('data-nombre', local.nombre);
            localDiv.setAttribute('data-numero-finca', local.numeroFinca);
            localDiv.setAttribute('data-latitud', local.coordinates[1]); // Usar el segundo valor del array como latitud
            localDiv.setAttribute('data-longitud', local.coordinates[0]); // Usar el primer valor del array como longitud
 
            localDiv.innerHTML = `
                <label>${local.nombre} - ${local.direccion} - ${local.numeroFinca}</label>
                <select onchange="cambiarEstado(this)">
                    <option value="no-listo" ${local.estado === 'no-listo' ? 'selected' : ''}>No Listo</option>
                    <option value="realizado" ${local.estado === 'realizado' ? 'selected' : ''}>Realizado</option>
                    <option value="problema" ${local.estado === 'problema' ? 'selected' : ''}>Problema</option>
                </select>
                <button onclick="verDetalles(this)">Ver Detalles</button>
                <input type="checkbox" class="check-realizado" ${local.estado === 'realizado' ? 'checked' : ''} disabled>
                <button class="btn-eliminar" onclick="eliminarLocal(${local.id})">Eliminar</button>
            `;
 
            if (local.estado === 'realizado') {
                localDiv.classList.add('realizado');
                if (!seMostroSeparador) {
                    listaLocales.appendChild(lineaSeparadora);
                    lineaSeparadora.style.display = 'block';
                    seMostroSeparador = true;
                }
            } else if (local.estado === 'problema') {
                localDiv.classList.add('problema');
            }
 
            listaLocales.appendChild(localDiv);
        });
 
        if (!seMostroSeparador) {
            lineaSeparadora.style.display = 'none';
        }
 
        actualizarContadores();
    } else {
        console.log("No data available");
    }
}

 

/// Función para agregar un nuevo local a la lista
async function agregarLocal() {
    const nombreLocal = document.getElementById('nombre-local').value;
    const direccion = document.getElementById('direccion').value;
    const numeroFinca = document.getElementById('numero-finca').value;
    const factura = document.getElementById('factura').value;
    const coordinates = document.getElementById('coordinates').value.split(',');
    const latitud = parseFloat(coordinates[0].trim());
    const longitud = parseFloat(coordinates[1].trim());
    const tasa = parseFloat(document.getElementById('tasa').value) || 0;

    // Validación para que solo se acepten números en el campo número de finca
    if (!/^\d+$/.test(numeroFinca)) {
        alert('Por favor, ingresa un número de finca válido.');
        document.getElementById('numero-finca').style.borderColor = 'red';
        return;
    } else {
        document.getElementById('numero-finca').style.borderColor = '';
    }

    if (nombreLocal.trim() === '' || direccion.trim() === '' || numeroFinca.trim() === '' || factura === '' || isNaN(latitud) || isNaN(longitud)) {
        alert('Por favor, completa todos los campos obligatorios.');
        return;
    }

    const snapshot = await get(child(ref(db), 'locales'));
    const locales = snapshot.exists() ? snapshot.val() : [];
    const newId = generarId(locales);

    const nuevoLocal = {
        id: newId,
        costo: 2500 + tasa,
        factura: factura,
        direccion: direccion,
        nombre: nombreLocal,
        estado: 'no-listo',
        numeroFinca: numeroFinca, // Guardar el número de finca
        coordinates: [longitud, latitud] // Guardar longitud y latitud como un array
    };

    locales.push(nuevoLocal);
    location.reload()

    await set(ref(db, 'locales'), locales);

    // Crear y añadir el nuevo div del local
    const localDiv = document.createElement('div');
    localDiv.classList.add('local');
    localDiv.setAttribute('data-id', nuevoLocal.id);
    localDiv.setAttribute('data-costo', nuevoLocal.costo);
    localDiv.setAttribute('data-factura', nuevoLocal.factura);
    localDiv.setAttribute('data-direccion', nuevoLocal.direccion);
    localDiv.setAttribute('data-nombre', nuevoLocal.nombre);
    localDiv.setAttribute('data-numero-finca', nuevoLocal.numeroFinca);
    localDiv.setAttribute('data-latitud', nuevoLocal.coordinates[1]);
    localDiv.setAttribute('data-longitud', nuevoLocal.coordinates[0]);

    localDiv.innerHTML = `
        <label>${nuevoLocal.nombre} - ${nuevoLocal.direccion} - ${nuevoLocal.numeroFinca}</label>
        <select onchange="cambiarEstado(this)">
            <option value="no-listo">No Listo</option>
            <option value="realizado">Realizado</option>
            <option value="problema">Problema</option>
        </select>
        <button onclick="verDetalles(this)">Ver Detalles</button>
        <input type="checkbox" class="check-realizado" disabled>
        <button class="btn-eliminar" onclick="eliminarLocal(${nuevoLocal.id})">Eliminar</button>
    `;

    const listaLocales = document.getElementById('lista-locales');
    listaLocales.insertBefore(localDiv, document.getElementById('linea-separadora'));

    // Limpiar formulario
    document.getElementById('nombre-local').value = '';
    document.getElementById('direccion').value = '';
    document.getElementById('numero-finca').value = '';
    document.getElementById('factura').value = '';
    document.getElementById('coordinates').value = '';

    // Actualizar los contadores
    actualizarContadores();

}



// Función para eliminar un local y reorganizar los IDs
async function eliminarLocal(localId) {
    const snapshot = await get(child(ref(db), 'locales'));
    const locales = snapshot.exists() ? snapshot.val() : [];

    // Filtra para eliminar el local deseado
    const localesActualizados = locales.filter(local => local.id !== localId);

    // Reorganiza los IDs de los locales restantes
    for (let i = 0; i < localesActualizados.length; i++) {
        localesActualizados[i].id = i;  // Asigna nuevos IDs secuenciales
    }

    // Guarda los locales actualizados en Firebase
    await set(ref(db, 'locales'), localesActualizados);

    // Recargar la lista de locales y limpiar el formulario
    cargarLocales();
    limpiarFormulario();
}

// Función para limpiar el formulario
function limpiarFormulario() {
    document.getElementById('nombre-local').value = '';
    document.getElementById('direccion').value = '';
    document.getElementById('numero-finca').value = '';
    document.getElementById('factura').value = 'A';
    document.getElementById('tasa').value = '';
}

// Variable de control para mostrar solo desinfectados o todos
// Variable de control para mostrar solo desinfectados o todos
let mostrandoSoloDesinfectados = false;

// Función para cambiar el estado del local
async function cambiarEstado(selectElement) {
    const localDiv = selectElement.closest('.local');
    const localId = localDiv.getAttribute('data-id');

    const snapshot = await get(child(ref(db), 'locales'));
    const locales = snapshot.exists() ? snapshot.val() : [];

    const localIndex = locales.findIndex(local => local.id === parseInt(localId));
    if (localIndex !== -1) {
        locales[localIndex].estado = selectElement.value;

        await set(ref(db, 'locales'), locales);
    }

    if (selectElement.value === 'realizado') {
        localDiv.classList.add('realizado');
        localDiv.querySelector('.check-realizado').checked = true;

        // Mover el local a la sección de realizados
        const seccionRealizados = document.querySelector('#seccion-realizados');
        seccionRealizados.appendChild(localDiv);
    } else {
        localDiv.classList.remove('realizado');
        localDiv.querySelector('.check-realizado').checked = false;

        // Mover el local de vuelta a su posición original
        const seccionPendientes = document.querySelector('#seccion-pendientes');
        seccionPendientes.appendChild(localDiv);
    }

    // Reordenar los locales
    cargarLocales();
    actualizarContadores();
}

// Evento para alternar entre mostrar solo los desinfectados y todos los locales
document.getElementById('desinfectados').addEventListener('click', () => {
    const todosLosLocales = document.querySelectorAll('.local');

    if (mostrandoSoloDesinfectados) {
        // Restaurar todos los locales a su estado original
        todosLosLocales.forEach(local => {
            const displayOriginal = local.getAttribute('data-display-original');
            local.style.display = displayOriginal || '';
        });
        mostrandoSoloDesinfectados = false;
    } else {
        // Mostrar solo los locales realizados
        todosLosLocales.forEach(local => {
            if (!local.classList.contains('realizado')) {
                // Guardar el valor original de display antes de ocultar
                local.setAttribute('data-display-original', local.style.display);
                local.style.display = 'none';
            } else {
                local.style.display = local.getAttribute('data-display-original') || '';
            }
        });
        mostrandoSoloDesinfectados = true;
    }
});




// Función para ver los detalles de un local
function verDetalles(button) {
    const localDiv = button.closest('.local');
    const nombreLocal = localDiv.getAttribute('data-nombre');
    const direccion = localDiv.getAttribute('data-direccion');
    const numeroFinca = localDiv.getAttribute('data-numero-finca');
    const latitud = localDiv.getAttribute('data-latitud'); // Obtener latitud
    const longitud = localDiv.getAttribute('data-longitud'); // Obtener longitud

    alert(`Nombre: ${nombreLocal}\nDirección: ${direccion}\nNúmero de Finca: ${numeroFinca}\nLatitud: ${latitud}\nLongitud: ${longitud}`);
}

// Función para actualizar los contadores de locales
function actualizarContadores() {
    const totalLocales = document.querySelectorAll('.local').length;
    const localesRealizados = document.querySelectorAll('.local.realizado').length;
    const localesNoListos = totalLocales - localesRealizados;

    document.getElementById('total-locales').textContent = totalLocales;
    document.getElementById('locales-realizados').textContent = localesRealizados;
    document.getElementById('locales-no-listos').textContent = localesNoListos;
}

// Llama a verificar autenticación al cargar la página
window.addEventListener('load', () => {
    verificarAutenticacion();
    cargarLocales();
});

// Función para acceso en modo vista previa
function accesoVistaPrevia() {
   localStorage.setItem('autenticado', 'vista-previa');
   window.location.href = 'locales.html'; // Redirige a locales.html
}

// Función para abrir el mapa en una nueva ventana
function irAlMapa() {
   window.open('map/map.html', '_blank');
}

// Exponer funciones globalmente
window.autenticarUsuario = autenticarUsuario;
window.accesoVistaPrevia = accesoVistaPrevia;
window.agregarLocal = agregarLocal;
window.cambiarEstado = cambiarEstado;
window.verDetalles = verDetalles;
window.eliminarLocal = eliminarLocal;
window.guardarLocales = guardarLocales;
window.irAlMapa = irAlMapa;


