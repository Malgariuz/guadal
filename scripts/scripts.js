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
    if (window.location.pathname !== '/index.html') {
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
function generarId() {
    const locales = JSON.parse(localStorage.getItem('locales')) || [];
    return locales.length > 0 ? Math.max(...locales.map(local => local.id)) + 1 : 1;
}

// Función para guardar los locales en localStorage
function guardarLocales() {
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
    localStorage.setItem('locales', JSON.stringify(localesArray));
}

// Función para cargar los locales desde localStorage
function cargarLocales() {
    const locales = JSON.parse(localStorage.getItem('locales')) || [];
    const listaLocales = document.getElementById('lista-locales');
    listaLocales.innerHTML = ''; // Limpiar la lista antes de cargar

    // Ordenar para mover los realizados al final
    locales.sort((a, b) => a.estado === 'realizado' ? 1 : -1); 

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

        if (local.estado === 'realizado') {
            localDiv.classList.add('realizado');
        } else if (local.estado === 'problema') {
            localDiv.classList.add('problema');
        }

        listaLocales.appendChild(localDiv);
    });
    actualizarContadores();
}

// Función para agregar un nuevo local a la lista
function agregarLocal() {
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

    const listaLocales = document.getElementById('lista-locales');
    const localDiv = document.createElement('div');
    localDiv.classList.add('local');
    localDiv.setAttribute('data-id', generarId());
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
        <button class="btn-eliminar" onclick="eliminarLocal(${localDiv.getAttribute('data-id')})">Eliminar</button>
    `;

    listaLocales.appendChild(localDiv);
    guardarLocales();
    actualizarContadores();
    limpiarFormulario();
}

// Función para eliminar un local
function eliminarLocal(id) {
    let locales = JSON.parse(localStorage.getItem('locales')) || [];
    locales = locales.filter(local => local.id !== id);
    localStorage.setItem('locales', JSON.stringify(locales));
    cargarLocales();
}

// Función para limpiar el formulario
function limpiarFormulario() {
    document.getElementById('nombre-local').value = '';
    document.getElementById('direccion').value = '';
    document.getElementById('numero-finca').value = '';
    document.getElementById('factura').value = '';
    document.getElementById('tasa').value = '';
}

// Función para cambiar el estado de un local
function cambiarEstado(select) {
    const local = select.closest('.local');
    local.classList.remove('realizado', 'problema');
    const checkRealizado = local.querySelector('.check-realizado');

    if (select.value === 'realizado') {
        local.classList.add('realizado');
        local.parentElement.appendChild(local);  // Mueve al fondo
        checkRealizado.checked = true;
    } else if (select.value === 'problema') {
        local.classList.add('problema');
        checkRealizado.checked = false;
    } else {
        checkRealizado.checked = false;
    }

    guardarLocales();
    actualizarContadores();
}

// Función para mostrar detalles de un local
function verDetalles(button) {
    const local = button.closest('.local');
    const costo = local.getAttribute('data-costo');
    const factura = local.getAttribute('data-factura');

    alert(`Costo: $${costo}\nFactura: ${factura}`);
}

// Función para redirigir al mapa en una nueva ventana
function irAlMapa() {
    if (localStorage.getItem('autenticado') === CLAVE_CORRECTA) {
        window.open('map/map.html', '_blank');  // Abre el mapa en una nueva ventana
    } else {
        redirigirSiNoAutenticado();
    }
}

// Función para actualizar los contadores
function actualizarContadores() {
    const locales = document.querySelectorAll('.local');
    const totalLocales = locales.length;

    let totalDinero = 0;
    let localesDesinfectados = 0;

    locales.forEach(local => {
        totalDinero += parseFloat(local.getAttribute('data-costo'));
        if (local.classList.contains('realizado')) {
            localesDesinfectados++;
        }
    });

    document.getElementById('total-locales').textContent = `Total de locales: ${totalLocales}`;
    document.getElementById('total-dinero').textContent = `Total dinero: $${totalDinero}`;
    document.getElementById('locales-desinfectados').textContent = `Locales desinfectados: ${localesDesinfectados}`;
}

// Función para mostrar u ocultar opciones de factura
function mostrarOpcionesFactura(select) {
    const facturaAInput = document.getElementById('monto-factura-a');
    const tasaOpciones = document.getElementById('tasa-opcion');

    if (select.value === 'A') {
        facturaAInput.style.display = 'block';
        facturaAInput.disabled = false;
        tasaOpciones.style.display = 'block';
        tasaOpciones.querySelector('#tasa').disabled = false;
    } else {
        facturaAInput.style.display = 'none';
        facturaAInput.disabled = true;
        tasaOpciones.style.display = 'none';
        tasaOpciones.querySelector('#tasa').disabled = true;
    }
}

// Inicializar la página
document.addEventListener('DOMContentLoaded', () => {
    verificarAutenticacion();
    cargarLocales();
    actualizarContadores();
});
