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
 async function guardarLocales() {
     const locales = document.querySelectorAll('.local');
     const localesArray = Array.from(locales).map(local => ({
         id: parseInt(local.getAttribute('data-id')),
         costo: local.getAttribute('data-costo'),
         factura: local.getAttribute('data-factura'),
         direccion: local.getAttribute('data-direccion'),
         nombre: local.getAttribute('data-nombre'),
         estado: local.querySelector('select').value,
         numeroFinca: local.getAttribute('data-numero-finca') // Guardar el número de finca
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

        // Ordenar para mover los realizados al final
        locales.sort((a, b) => a.estado === 'realizado' ? 1 : -1);

        let seMostroSeparador = false; // Para saber si ya se mostró la línea separadora

        locales.forEach(local => {
            const localDiv = document.createElement('div');
            localDiv.classList.add('local');
            localDiv.setAttribute('data-id', local.id);
            localDiv.setAttribute('data-costo', local.costo);
            localDiv.setAttribute('data-factura', local.factura === 'otra' ? 'B' : local.factura);
            localDiv.setAttribute('data-direccion', local.direccion);
            localDiv.setAttribute('data-nombre', local.nombre);
            localDiv.setAttribute('data-numero-finca', local.numeroFinca); // Agregar el número de finca

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

            // Aplicar clase y estilo según el estado
            if (local.estado === 'realizado') {
                localDiv.classList.add('realizado');
                // Mostrar la línea separadora si no se ha mostrado
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

        // Ocultar la línea separadora si no hay locales "realizados"
        if (!seMostroSeparador) {
            lineaSeparadora.style.display = 'none';
        }

        actualizarContadores();
    } else {
        console.log("No data available");
    }
}

 // Función para agregar un nuevo local a la lista
 async function agregarLocal() {
     const nombreLocal = document.getElementById('nombre-local').value;
     const direccion = document.getElementById('direccion').value;
     const numeroFinca = document.getElementById('numero-finca').value;
     const factura = document.getElementById('factura').value;
     const tasa = parseFloat(document.getElementById('tasa').value) || 0;

     // Validación para que solo se acepten números en el campo número de finca
     if (!/^\d+$/.test(numeroFinca)) {
         alert('Por favor, ingresa un número de finca válido.');
         document.getElementById('numero-finca').style.borderColor = 'red';
         return;
     } else {
         document.getElementById('numero-finca').style.borderColor = '';
     }

     if (nombreLocal.trim() === '' || direccion.trim() === '' || numeroFinca.trim() === '' || factura === '') {
         alert('Por favor, completa todos los campos obligatorios.');
         return;
     }

     const snapshot = await get(child(ref(db), 'locales'));
     const locales = snapshot.exists() ? snapshot.val() : [];
     const localDiv = document.createElement('div');
     const newId = generarId(locales);

     localDiv.classList.add('local');
     localDiv.setAttribute('data-id', newId);
     localDiv.setAttribute('data-costo', 2500 + tasa);
     localDiv.setAttribute('data-factura', factura === 'otra' ? 'B' : factura);
     localDiv.setAttribute('data-direccion', direccion);
     localDiv.setAttribute('data-nombre', nombreLocal);
     localDiv.setAttribute('data-numero-finca', numeroFinca); // Agregar el número de finca

     localDiv.innerHTML = `
         <label>${nombreLocal} - ${direccion} - ${numeroFinca}</label>
         <select onchange="cambiarEstado(this)">
             <option value="no-listo">No Listo</option>
             <option value="realizado">Realizado</option>
             <option value="problema">Problema</option>
         </select>
         <button onclick="verDetalles(this)">Ver Detalles</button>
         <input type="checkbox" class="check-realizado" disabled>
         <button class="btn-eliminar" onclick="eliminarLocal(${newId})">Eliminar</button>
     `;

     locales.push({
         id: newId,
         costo: 2500 + tasa,
         factura: factura === 'otra' ? 'B' : factura,
         direccion: direccion,
         nombre: nombreLocal,
         estado: 'no-listo',
         numeroFinca: numeroFinca
     });

     await set(ref(db, 'locales'), locales);

     const listaLocales = document.getElementById('lista-locales');
     listaLocales.appendChild(localDiv);
     actualizarContadores();
     limpiarFormulario();
 }

 // Función para eliminar un local
 async function eliminarLocal(id) {
     const snapshot = await get(child(ref(db), 'locales'));
     let locales = snapshot.exists() ? snapshot.val() : [];
     locales = locales.filter(local => local.id !== id);
     await set(ref(db, 'locales'), locales);
     cargarLocales();
 }

 // Función para limpiar el formulario
 function limpiarFormulario() {
     document.getElementById('nombre-local').value = '';
     document.getElementById('direccion').value = '';
     document.getElementById('numero-finca').value = '';
     document.getElementById('factura').value = 'A';
     document.getElementById('tasa').value = '';
 }

 // Función para cambiar el estado de un local
async function cambiarEstado(select) {
    const localDiv = select.parentNode;
    const id = parseInt(localDiv.getAttribute('data-id'));

    const snapshot = await get(child(ref(db), 'locales'));
    let locales = snapshot.exists() ? snapshot.val() : [];
    const local = locales.find(local => local.id === id);

    if (local) {
        local.estado = select.value;
        await set(ref(db, 'locales'), locales);
    }

    // Marcar el div como realizado si corresponde
    if (local.estado === 'realizado') {
        localDiv.classList.add('realizado');
        localDiv.querySelector('.check-realizado').checked = true;
        localDiv.style.borderTop = '1px solid black'; // Línea separadora para realizado
        localDiv.style.marginTop = '10px'; // Espaciado con los locales anteriores
    } else {
        localDiv.classList.remove('realizado');
        localDiv.querySelector('.check-realizado').checked = false;
        localDiv.style.borderTop = ''; // Quitar la línea separadora
        localDiv.style.marginTop = ''; // Quitar el espaciado
    }

    if (local.estado === 'problema') {
        localDiv.classList.add('problema');
    } else {
        localDiv.classList.remove('problema');
    }

    actualizarContadores();
}


 // Función para ver los detalles de un local
 function verDetalles(boton) {
     const localDiv = boton.parentNode;
     const nombre = localDiv.getAttribute('data-nombre');
     const direccion = localDiv.getAttribute('data-direccion');
     const numeroFinca = localDiv.getAttribute('data-numero-finca');
     const factura = localDiv.getAttribute('data-factura');
     const costo = localDiv.getAttribute('data-costo');

     alert(`Detalles del Local:\nNombre: ${nombre}\nDirección: ${direccion}\nNúmero de Finca: ${numeroFinca}\nFactura: ${factura}\nCosto: ${costo}`);
 }

 // Función para actualizar los contadores de locales
 function actualizarContadores() {
     const locales = document.querySelectorAll('.local');
     const total = locales.length;
     const realizados = document.querySelectorAll('.local.realizado').length;
     const problemas = document.querySelectorAll('.local.problema').length;

     document.getElementById('total-locales').textContent = total;
     document.getElementById('locales-realizados').textContent = realizados;
     document.getElementById('locales-problemas').textContent = problemas;
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


