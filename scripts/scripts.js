// Importar las funciones necesarias de los SDKs
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import { getDatabase, ref, set, get, child, update, remove } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-database.js";
// Importar los métodos necesarios desde Firebase EMAIL
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";


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


/// Inicializar Firebase Auth
const auth = getAuth(app);
auth.useDeviceLanguage(); // Usar el idioma del dispositivo
const provider = new GoogleAuthProvider();





// Función para iniciar sesión con correo electrónico y contraseña
function loginWithEmail() {
    const email = document.getElementById('email-input').value;
    const password = document.getElementById('password-input').value;

    signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            const user = userCredential.user;
            console.log('Usuario autenticado:', user.uid);

            // Mostrar el estado de autenticación
            document.getElementById('estado-usuario').innerText = 'Usuario autenticado';

            // Ocultar el formulario de inicio de sesión y mostrar el contenido protegido
            document.getElementById('login-container').style.display = 'none';
            document.getElementById('protected-content').style.display = 'block';
        })
        .catch((error) => {
            console.error('Error en la autenticación:', error);
            document.getElementById('estado-usuario').innerText = 'Error en la autenticación';
        });
}

// Función para registrar un nuevo usuario (opcional)
function registerWithEmail() {
    const email = document.getElementById('email-input').value;
    const password = document.getElementById('password-input').value;

    createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            const user = userCredential.user;
            console.log('Usuario registrado:', user.uid);
            // Puedes redirigir o mostrar un mensaje de éxito aquí
        })
        .catch((error) => {
            console.error('Error al registrar usuario:', error);
        });
}

// Verificar el estado de autenticación al cargar la página
onAuthStateChanged(auth, (user) => {
    if (user) {
        document.getElementById('estado-usuario').innerText = 'Usuario autenticado';
        document.getElementById('login-container').style.display = 'none';
        document.getElementById('protected-content').style.display = 'block';
    } else {
        document.getElementById('estado-usuario').innerText = 'No hay usuario autenticado';
        document.getElementById('login-container').style.display = 'block';
        document.getElementById('protected-content').style.display = 'none';
    }
});

// Conectar el botón de inicio de sesión con la función loginWithEmail
document.getElementById('login-button').addEventListener('click', loginWithEmail);

// Conectar el botón de registro con la función registerWithEmail (opcional)
document.getElementById('register-button').addEventListener('click', registerWithEmail);

function loginWithGoogle() {
    // Establecer el idioma del dispositivo
    auth.useDeviceLanguage();

    // Añadir un login_hint si quieres sugerir un correo electrónico
    provider.setCustomParameters({
        'login_hint': 'user@example.com' // Cambia este correo si lo necesitas
    });

    // Usar el popup para iniciar sesión
    signInWithPopup(auth, provider)
        .then((result) => {
            // Obtenemos el token de acceso de Google si es necesario
            const credential = GoogleAuthProvider.credentialFromResult(result);
            const token = credential ? credential.accessToken : null;

            // Información del usuario autenticado
            const user = result.user;
            console.log('Usuario autenticado:', user.uid);

            // Mostrar el estado de autenticación en la interfaz
            document.getElementById('estado-usuario').innerText = 'Usuario autenticado';

            // Ocultar el formulario de inicio de sesión y mostrar el contenido protegido
            document.getElementById('login-container1').style.display = 'none';
            document.getElementById('protected-content').style.display = 'block';
        })
        .catch((error) => {
            // Manejar errores de autenticación
            console.error('Error en la autenticación:', error);
            console.error('Código de error:', error.code);
            console.error('Mensaje de error:', error.message);
            console.error('Correo del usuario:', error.email);
            console.error('Credencial:', error.credential);

            document.getElementById('estado-usuario').innerText = 'Error en la autenticación';
        });
}


// Conectar el botón de inicio de sesión con la función loginWithGoogle
document.getElementById('google-login-button').addEventListener('click', loginWithGoogle);


// Verificar el estado de autenticación al cargar la página
onAuthStateChanged(auth, (user) => {
    if (user) {
        console.log('Usuario autenticado:', user.uid);
        document.getElementById('estado-usuario').innerText = 'Usuario autenticado';
        document.getElementById('login-container1').style.display = 'none';
        document.getElementById('protected-content').style.display = 'block';
    } else {
        console.log('No hay usuario autenticado');
        document.getElementById('estado-usuario').innerText = 'No hay usuario autenticado';
        document.getElementById('login-container1').style.display = 'block';
        document.getElementById('protected-content').style.display = 'none';
    }
});


// Conectar el botón de inicio de sesión con la función loginWithGoogle
document.getElementById('google-login-button').addEventListener('click', loginWithGoogle);

// Función para cerrar sesión
function logout() {
    signOut(auth).then(() => {
        console.log('Sesión cerrada');
        // Recargar la página para actualizar el estado
        window.location.reload();
    }).catch((error) => {
        console.error('Error al cerrar sesión:', error);
    });
}

// Asegúrate de que el botón de cerrar sesión esté conectado a esta función
document.getElementById('logout-button').addEventListener('click', logout);

// Mostrar el contenido protegido si el usuario está autenticado
function mostrarContenidoProtegido() {
    document.getElementById('login-container').style.display = 'none'; // Ocultar el formulario de inicio de sesión
    document.getElementById('protected-content').style.display = 'block'; // Mostrar contenido protegido
}





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
// Función para generar un identificador único basado en la posición disponible
function generarId(locales) {
    if (locales.length === 0) {
        return 0; // Si no hay locales, comienza desde 0
    }

    const ids = locales.map(local => local.id).sort((a, b) => a - b);

    // Encuentra el primer hueco en la secuencia de IDs
    for (let i = 0; i < ids.length; i++) {
        if (ids[i] !== i) {
            return i; // Retorna el primer ID faltante en la secuencia
        }
    }

    return ids.length; // Si no hay huecos, retorna el siguiente ID en la secuencia
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







// Función para establecer todos los locales en estado "no-listo"
async function establecerTodosNoListo() {
    const snapshot = await get(child(ref(db), 'locales'));
    const locales = snapshot.exists() ? snapshot.val() : [];

    locales.forEach(local => {
        local.estado = 'no-listo';
    });

    await set(ref(db, 'locales'), locales);
    
    // Recargar los locales en la interfaz
    cargarLocales();
    actualizarContadores();
}

// Evento para el botón que cambia todos los locales a "no-listo"
document.getElementById('btn-establecer-no-listo').addEventListener('click', establecerTodosNoListo);








// Función para verificar si es el primer día del mes y entre las 00:00 y las 00:15
function verificarInicioDeMes() {
    const ahora = new Date();
    const primerDiaDelMes = new Date(ahora.getFullYear(), ahora.getMonth(), 1);

    // Verifica si es el primer día del mes
    if (ahora.getDate() === 1) {
        // Verifica si la hora actual está entre las 00:00 y las 00:15
        const horas = ahora.getHours();
        const minutos = ahora.getMinutes();
        
        if (horas === 0 && minutos <= 15) {
            establecerTodosNoListo();
        }
    }
}

// Llama a la función al cargar la página
verificarInicioDeMes();












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

let mostrandoSoloDesinfectados = false;

    // Evento para alternar entre mostrar solo los desinfectados y todos los locales
    document.getElementById('desinfectados').addEventListener('click', () => {
        const todosLosLocales = document.querySelectorAll('.local');
        const contadorElement = document.getElementById('contador-locales-realizados');
        const contadorRestantesElement = document.getElementById('contador-locales-restantes');
        const porcentajeCompletadoElement = document.getElementById('porcentaje-completado');
        const barraProgreso = document.getElementById('barra-progreso');
        let contadorRealizados = 0;
        let totalLocales = todosLosLocales.length;

        if (mostrandoSoloDesinfectados) {
            // Restaurar todos los locales a su estado original
            todosLosLocales.forEach(local => {
                const displayOriginal = local.getAttribute('data-display-original');
                local.style.display = displayOriginal || '';
            });
            mostrandoSoloDesinfectados = false;
            contadorElement.textContent = ''; // Ocultar contador cuando no se filtran locales
            contadorRestantesElement.textContent = ''; // Ocultar contador de restantes
            porcentajeCompletadoElement.textContent = ''; // Ocultar porcentaje completado
            barraProgreso.style.width = '0'; // Reiniciar barra de progreso
        } else {
            // Mostrar solo los locales realizados
            todosLosLocales.forEach(local => {
                if (!local.classList.contains('realizado')) {
                    // Guardar el valor original de display antes de ocultar
                    local.setAttribute('data-display-original', local.style.display);
                    local.style.display = 'none';
                } else {
                    local.style.display = local.getAttribute('data-display-original') || '';
                    contadorRealizados++;
                }
            });
            mostrandoSoloDesinfectados = true;

            // Actualizar los contadores
            let localesRestantes = totalLocales - contadorRealizados;
            let porcentajeCompletado = Math.round((contadorRealizados / totalLocales) * 100);

            contadorElement.textContent = `Locales Desinfectados: ${contadorRealizados}`;
            contadorRestantesElement.textContent = `Locales Restantes por Desinfectar: ${localesRestantes}`;
            porcentajeCompletadoElement.textContent = `Porcentaje Completado: ${porcentajeCompletado}%`;

            // Actualizar la barra de progreso
            barraProgreso.style.width = `${porcentajeCompletado}%`;
        }
    });

let mostrandoSoloConProblema = false;

document.getElementById('problema').addEventListener('click', () => {
    const todosLosLocales = document.querySelectorAll('.local');

    if (mostrandoSoloConProblema) {
        // Restaurar todos los locales a su estado original
        todosLosLocales.forEach(local => {
            const displayOriginal = local.getAttribute('data-display-original');
            local.style.display = displayOriginal || '';
        });
        mostrandoSoloConProblema = false;
    } else {
        // Mostrar solo los locales con problemas
        todosLosLocales.forEach(local => {
            if (!local.classList.contains('problema')) {
                // Guardar el valor original de display antes de ocultar
                local.setAttribute('data-display-original', local.style.display);
                local.style.display = 'none';
            } else {
                local.style.display = local.getAttribute('data-display-original') || '';
            }
        });
        mostrandoSoloConProblema = true;
    }
});

















// Función para ver y editar los detalles de un local
function verDetalles(button) {
    const localDiv = button.closest('.local');
    const nombreLocal = localDiv.getAttribute('data-nombre');
    const direccion = localDiv.getAttribute('data-direccion');
    const numeroFinca = localDiv.getAttribute('data-numero-finca');
    const latitud = localDiv.getAttribute('data-latitud');
    const longitud = localDiv.getAttribute('data-longitud');
    const estado = localDiv.getAttribute('data-estado'); // Obtener el estado actual

    // Guardar el contenido original del div para restaurarlo después
    const contenidoOriginal = localDiv.innerHTML;

    // Desplegar detalles
    localDiv.innerHTML = `
        <p>Nombre: <span id="detalle-nombre">${nombreLocal}</span></p>
        <p>Dirección: <span id="detalle-direccion">${direccion}</span></p>
        <p>Número de Finca: <span id="detalle-numero-finca">${numeroFinca}</span></p>
        <p>Latitud: <span id="detalle-latitud">${latitud}</span></p>
        <p>Longitud: <span id="detalle-longitud">${longitud}</span></p>
        <button id="editar-local">Editar</button>
        <button id="cerrar-detalles">Cerrar Detalles</button>
    `;

    // Manejar el evento de clic en el botón "Editar"
    document.getElementById('editar-local').addEventListener('click', () => {
        // Cambiar a modo edición
        localDiv.innerHTML = `
            <label>Nombre: <input type="text" id="edit-nombre" value="${nombreLocal}"></label><br>
            <label>Dirección: <input type="text" id="edit-direccion" value="${direccion}"></label><br>
            <label>Número de Finca: <input type="text" id="edit-numero-finca" value="${numeroFinca}"></label><br>
            <label>Latitud: <input type="text" id="edit-latitud" value="${latitud}"></label><br>
            <label>Longitud: <input type="text" id="edit-longitud" value="${longitud}"></label><br>
            <button id="guardar-cambios">Terminar</button>
            <button id="cerrar-detalles">Cerrar Detalles</button>
        `;

        // Manejar el evento de clic en el botón "Terminar"
        document.getElementById('guardar-cambios').addEventListener('click', async () => {
            const nuevoNombre = document.getElementById('edit-nombre').value;
            const nuevaDireccion = document.getElementById('edit-direccion').value;
            const nuevoNumeroFinca = document.getElementById('edit-numero-finca').value;
            const nuevaLatitud = document.getElementById('edit-latitud').value;
            const nuevaLongitud = document.getElementById('edit-longitud').value;

            const localId = localDiv.getAttribute('data-id');

            // Actualizar datos en Firebase
            const snapshot = await get(child(ref(db), 'locales'));
            const locales = snapshot.exists() ? snapshot.val() : [];

            const localIndex = locales.findIndex(local => local.id === parseInt(localId));
            if (localIndex !== -1) {
                locales[localIndex].nombre = nuevoNombre;
                locales[localIndex].direccion = nuevaDireccion;
                locales[localIndex].numeroFinca = nuevoNumeroFinca;
                locales[localIndex].coordinates = [parseFloat(nuevaLongitud), parseFloat(nuevaLatitud)];
                
                await set(ref(db, 'locales'), locales);
            }

            // Recargar la página para reflejar los cambios
            location.reload();
        });
    });

    // Manejar el evento de clic en el botón "Cerrar Detalles"
    document.getElementById('cerrar-detalles').addEventListener('click', () => {
        // Restaurar el contenido original del div
        localDiv.innerHTML = contenidoOriginal;
    });
}





// Función para buscar y filtrar locales en tiempo real
document.getElementById('busqueda-input').addEventListener('input', function() {
    const searchTerm = this.value.toLowerCase();
    const locales = document.querySelectorAll('.local');
    
    // Filtrar locales en tiempo real
    locales.forEach(local => {
        const nombre = local.getAttribute('data-nombre').toLowerCase();
        const direccion = local.getAttribute('data-direccion').toLowerCase();
        const numeroFinca = local.getAttribute('data-numero-finca').toLowerCase();

        // Mostrar o esconder locales basado en la búsqueda
        if (nombre.includes(searchTerm) || direccion.includes(searchTerm) || numeroFinca.includes(searchTerm)) {
            local.style.display = ''; // Mostrar el local si coincide con la búsqueda
        } else {
            local.style.display = 'none'; // Ocultar el local si no coincide con la búsqueda
        }
    });
});





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


