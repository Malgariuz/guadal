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

// Función para agregar un nuevo local a la lista
function agregarLocal() {
    const nombreLocal = document.getElementById('nombre-local').value;
    const direccion = document.getElementById('direccion').value;
    const numeroFinca = document.getElementById('numero-finca').value;
    const factura = document.getElementById('factura').value;
    const tasa = parseFloat(document.getElementById('tasa').value) || 0;

    if (nombreLocal.trim() === '' || direccion.trim() === '' || numeroFinca.trim() === '' || factura === '') {
        alert('Por favor, completa todos los campos obligatorios.');
        return;
    }

    const listaLocales = document.getElementById('lista-locales');
    const localDiv = document.createElement('div');
    localDiv.classList.add('local');
    localDiv.setAttribute('data-id', Date.now());  // Usamos la fecha como ID único
    localDiv.setAttribute('data-costo', 2500 + tasa);  // Costo base + tasa
    localDiv.setAttribute('data-factura', factura);

    localDiv.innerHTML = `
        <label>${nombreLocal} - ${direccion} - ${numeroFinca}</label>
        <select onchange="cambiarEstado(this)">
            <option value="no-listo">No Listo</option>
            <option value="realizado">Realizado</option>
            <option value="problema">Problema</option>
        </select>
        <button onclick="verDetalles(this)">Ver Detalles</button>
        <input type="checkbox" class="check-realizado" disabled>
    `;

    listaLocales.appendChild(localDiv);
    actualizarContadores();
    limpiarFormulario();
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

    actualizarContadores();
}

// Función para mostrar detalles de un local
function verDetalles(button) {
    const local = button.closest('.local');
    const costo = local.getAttribute('data-costo');
    const factura = local.getAttribute('data-factura');

    alert(`Costo: $${costo}\nFactura: ${factura}`);
}

// Función para redirigir al mapa
function irAlMapa() {
    if (localStorage.getItem('autenticado') === CLAVE_CORRECTA) {
        window.location.href = 'mapa.html';  // Redirige a la página del mapa
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
    document.getElementById('locales-desinfectados').textContent = `Locales desinfectados en el mes de...: ${localesDesinfectados}`;
}

// Inicializar la página
document.addEventListener('DOMContentLoaded', () => {
    verificarAutenticacion();
    actualizarContadores();
});
