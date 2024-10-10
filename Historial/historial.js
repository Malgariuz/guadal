// Importar las funciones necesarias de los SDKs
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import { getDatabase, ref, set, get, child, update, onValue } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-database.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";
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



const app = initializeApp(firebaseConfig);
/** @type {import("https://malgariuz-default-rtdb.firebaseio.com/").Database} */
const db = getDatabase(app);

// Referencia a la base de datos
const localesRef = ref(db, 'locales');



// Función para cargar y mostrar locales en la sección "Recientes"
function cargarLocales() {
  const recienteContainer = document.getElementById('reciente-container');
  const desinfectadosContainer = document.getElementById('desinfectados');

  onValue(localesRef, (snapshot) => {
    recienteContainer.innerHTML = ''; // Limpiar el contenedor de recientes
    desinfectadosContainer.innerHTML = ''; // Limpiar el contenedor de desinfectados

    let locales = snapshot.val();

    if (locales) {
      // Convertir el objeto locales a un array para facilitar el orden
      locales = Object.values(locales);

      // Función para convertir la fecha en un timestamp comparable
      const convertirFecha = (fechaStr) => {
        if (!fechaStr) return 0;
        const [fecha, hora] = fechaStr.split(', ');
        const [dia, mes, anio] = fecha.split('/').map(Number);
        let [tiempo, periodo] = hora.split(' ');
        let [horas, minutos, segundos] = tiempo.split(':').map(Number);
        if (periodo === 'p.m.' && horas !== 12) horas += 12;
        if (periodo === 'a.m.' && horas === 12) horas = 0;
        return new Date(anio, mes - 1, dia, horas, minutos, segundos).getTime();
      };

      // Ordenar los locales por la fecha de modificación (descendente)
      locales.sort((a, b) => {
        const fechaA = convertirFecha(a.fechaModificacion);
        const fechaB = convertirFecha(b.fechaModificacion);
        return fechaB - fechaA;
      });

      locales.forEach(local => {
        if (local.estado === 'realizado' || local.estado === 'problema') {
          const ocultarRef = ref(db, `ocultos/${local.id}`);

          get(ocultarRef).then(ocultarSnapshot => {
            if (ocultarSnapshot.exists() && ocultarSnapshot.val() === true) {
              return; // Si el local está oculto, no lo mostramos
            }

            const localItem = document.createElement('div');
            localItem.className = 'local-item';
            localItem.setAttribute('data-id', local.id);

            // Estilos para facturas tipo A
            if (local.factura === 'A') {
              localItem.style.backgroundColor = 'rgba(0, 128, 0, 0.5)';
              localItem.style.color = 'blue';
            }

            // Mostrar la fecha de modificación
            const fechaStr = local.fechaModificacion || 'No modificado';

            // Obtener el mes actual
            const mesActual = new Date().toLocaleString('es-ES', { month: 'long' }).toLowerCase();

            localItem.innerHTML = `
              <h4 style="margin: 0 0 5px 0;">${local.nombre}</h4>
              <p style="margin: 5px 0;">Dirección: ${local.direccion}</p>
              <p style="margin: 5px 0;">Costo: ${local.costo}</p>
              <p style="margin: 5px 0;">Tipo de Factura: ${local.factura}</p>
              <p style="margin: 5px 0;">Número de Finca: ${local.numeroFinca}</p>
              <p style="margin: 5px 0;">Estado Actual: ${local.estado}</p>
              <p style="margin: 5px 0;">Mes y Tasa: ${local.mesTasa || 'N/A'}</p>
              <p style="margin: 5px 0;">Notas: ${local.notas || 'Sin notas'}</p>
              <p style="margin: 5px 0; color: gray;">Fecha de la desinfección: ${fechaStr}</p>
              <button class="edit-btn">Editar</button>
              <button class="hide-btn">Ocultar</button>
              <div class="edit-fields" style="display: none;">
                  <label>Monto: <input type="text" class="costo-input" value="${local.costo}"></label>
                  <label>Mes: 
                      <select class="mes-select">
                          <option value="enero" ${mesActual === 'enero' ? 'selected' : ''}>Enero</option>
                          <option value="febrero" ${mesActual === 'febrero' ? 'selected' : ''}>Febrero</option>
                          <option value="marzo" ${mesActual === 'marzo' ? 'selected' : ''}>Marzo</option>
                          <option value="abril" ${mesActual === 'abril' ? 'selected' : ''}>Abril</option>
                          <option value="mayo" ${mesActual === 'mayo' ? 'selected' : ''}>Mayo</option>
                          <option value="junio" ${mesActual === 'junio' ? 'selected' : ''}>Junio</option>
                          <option value="julio" ${mesActual === 'julio' ? 'selected' : ''}>Julio</option>
                          <option value="agosto" ${mesActual === 'agosto' ? 'selected' : ''}>Agosto</option>
                          <option value="septiembre" ${mesActual === 'septiembre' ? 'selected' : ''}>Septiembre</option>
                          <option value="octubre" ${mesActual === 'octubre' ? 'selected' : ''}>Octubre</option>
                          <option value="noviembre" ${mesActual === 'noviembre' ? 'selected' : ''}>Noviembre</option>
                          <option value="diciembre" ${mesActual === 'diciembre' ? 'selected' : ''}>Diciembre</option>
                      </select>
                  </label>
                  <label>Año: 
                      <select class="anio-select">
                          <option value="2024" ${local.mesTasa?.includes('2024') ? 'selected' : ''}>2024</option>
                          <option value="2025" ${local.mesTasa?.includes('2025') ? 'selected' : ''}>2025</option>
                          <option value="2026" ${local.mesTasa?.includes('2026') ? 'selected' : ''}>2026</option>
                          <option value="2027" ${local.mesTasa?.includes('2027') ? 'selected' : ''}>2027</option>
                          <option value="2028" ${local.mesTasa?.includes('2028') ? 'selected' : ''}>2028</option>
                          <option value="2029" ${local.mesTasa?.includes('2029') ? 'selected' : ''}>2029</option>
                          <option value="2030" ${local.mesTasa?.includes('2030') ? 'selected' : ''}>2030</option>
                      </select>
                  </label>
                  <label>Tasas: <input type="text" class="tasas-input" value="${local.tasas || ''}"></label>
                  <label>Notas: <textarea class="notas-input">${local.notas || ''}</textarea></label>
                  <button class="save-btn">Guardar</button>
              </div>
            `;

            // Agregar event listener para el botón Editar
            localItem.querySelector('.edit-btn').addEventListener('click', () => {
              const editFields = localItem.querySelector('.edit-fields');
              editFields.style.display = editFields.style.display === 'none' ? 'block' : 'none';
            });

            // Agregar event listener para el botón Guardar
            localItem.querySelector('.save-btn').addEventListener('click', () => {
              const newCosto = localItem.querySelector('.costo-input').value;
              const newMes = localItem.querySelector('.mes-select').value;
              const newAnio = localItem.querySelector('.anio-select').value;
              const newTasas = localItem.querySelector('.tasas-input').value;
              const newNotas = localItem.querySelector('.notas-input').value;

              const fechaModificacion = new Date().toLocaleString();

              const actividadRef = ref(db, `actividad/${newAnio}/${newMes}/${local.id}`);
              set(actividadRef, {
                nombre: local.nombre,
                direccion: local.direccion,
                costo: newCosto,
                factura: local.factura,
                numeroFinca: local.numeroFinca,
                estado: local.estado,
                tasas: newTasas,
                notas: newNotas,
                fechaModificacion: fechaModificacion
              }).then(() => {
                window.location.reload(); // Recargar la página
                // Eliminar el local de la referencia original
                remove(ref(db, `locales/${local.id}`)).then(() => {
                  // Recargar la página después de guardar los cambios
                 
                });
              });
            });

            localItem.querySelector('.hide-btn').addEventListener('click', () => {
              set(ocultarRef, true).then(() => {
                localItem.style.display = 'none';
              });
            });

            recienteContainer.appendChild(localItem);
          });
        }
      });
    }
  });
}




// Llamar a la función para cargar los locales al iniciar la página
cargarLocales();








// Event listener para botones de meses
document.querySelectorAll('.mes-btn').forEach(btn => {
  btn.addEventListener('click', () => {
      const mes = btn.getAttribute('data-mes');
      const anio = document.getElementById('select-anio').value;
      cargarLocalesPorMes(anio, mes);
  });
});

// Función para cargar locales por mes y año seleccionados y contar todos los locales
function cargarLocalesPorMes(anio, mes) {
  const actividadContainer = document.getElementById('actividad-container');
  const tituloMes = document.getElementById('titulo-mes');
  const contadorElement = document.getElementById('contador-locales'); // Elemento para mostrar el contador de locales
  const montoBrutoElement = document.getElementById('monto-bruto'); // Elemento para mostrar el monto bruto total
  const montoNetoElement = document.getElementById('monto-neto'); // Elemento para mostrar el monto neto

  actividadContainer.innerHTML = ''; // Limpiar el contenedor de actividad
  contadorElement.innerText = ''; // Limpiar el contador de locales
  montoBrutoElement.innerText = ''; // Limpiar el contador de monto bruto
  montoNetoElement.innerText = ''; // Limpiar el contador de monto neto
  
  const mesRef = ref(db, `actividad/${anio}/${mes}`);
  let contadorLocales = 0; // Inicializar contador para todos los locales
  let montoBrutoTotal = 0; // Inicializar el monto bruto total

  // Actualiza el título con el mes seleccionado
  tituloMes.innerHTML = `Actividad de ${mes} (${anio})`;

  onValue(mesRef, (snapshot) => {
    let locales = snapshot.val();
    
    if (locales) {
      // Convertir el objeto a un array para facilitar el orden
      locales = Object.values(locales);

      // Función para convertir la fecha en formato "DD/MM/YYYY, HH:mm:ss a.m./p.m." a un timestamp comparable
      const convertirFecha = (fechaStr) => {
        if (!fechaStr) return 0; // Si no hay fecha, retorna 0 como valor por defecto (para ordenarlos al final)

        // Dividir la fecha y la hora
        const [fecha, hora] = fechaStr.split(', ');
        const [dia, mes, anio] = fecha.split('/').map(Number); // Obtener día, mes y año
        let [tiempo, periodo] = hora.split(' '); // Dividir el tiempo y el periodo (a.m./p.m.)
        let [horas, minutos, segundos] = tiempo.split(':').map(Number); // Obtener horas, minutos, segundos

        // Convertir a formato de 24 horas
        if (periodo === 'p.m.' && horas !== 12) horas += 12; // Convertir las horas p.m., excepto para 12 p.m.
        if (periodo === 'a.m.' && horas === 12) horas = 0; // Convertir 12 a.m. a 00 horas

        // Crear un timestamp (milisegundos desde la medianoche del 1 de enero de 1970) usando los valores extraídos
        return new Date(anio, mes - 1, dia, horas, minutos, segundos).getTime();
      };

      // Ordenar los locales por la fecha de modificación (descendente)
      locales.sort((a, b) => {
        const fechaA = convertirFecha(a.fechaModificacion);
        const fechaB = convertirFecha(b.fechaModificacion);
        return fechaB - fechaA; // Orden descendente (de más reciente a más antiguo)
      });

      locales.forEach(local => {
        const localItem = document.createElement('div');
        localItem.className = 'local-item';
        localItem.setAttribute('data-id', local.id);

        // Incrementar el contador por cada local
        contadorLocales++;

        // Sumar el costo del local al monto bruto total
        montoBrutoTotal += parseFloat(local.costo);

        // Mostrar la fecha de modificación si existe
        const fechaStr = local.fechaModificacion || 'No modificado';

        localItem.innerHTML = `
          <h4>${local.nombre}</h4>
          <p>Dirección: ${local.direccion}</p>
          <p>Costo: ${local.costo}</p>
          <p>Tipo de Factura: ${local.factura}</p>
          <p>Número de Finca: ${local.numeroFinca}</p>
          <p>Estado Actual: ${local.estado}</p>
          <p>Tasa monto: ${local.tasas}</p>
          <p style="color: gray;">Fecha de modificación: ${fechaStr}</p>
        `;

        actividadContainer.appendChild(localItem);
      });

      // Calcular el monto neto como el 40% del monto bruto total
      const montoNetoTotal = montoBrutoTotal * 0.40;

      // Formatear los montos con separador de miles y símbolo de moneda, mostrando decimales solo si es necesario
      const formatoMoneda = (monto) => {
        return `$${monto.toLocaleString('es-ES', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
      };

      // Actualizar el contador de locales en la interfaz
      contadorElement.innerText = `Total de locales en ${mes}: ${contadorLocales}`;
      // Actualizar el monto bruto total en la interfaz
      montoBrutoElement.innerText = `Monto bruto total: ${formatoMoneda(montoBrutoTotal)}`;
      // Actualizar el monto neto total en la interfaz
      montoNetoElement.innerText = `Monto neto total: ${formatoMoneda(montoNetoTotal)}`;

    } else {
      actividadContainer.innerHTML = '<p>No hay locales para este mes y año seleccionados.</p>';
      contadorElement.innerText = `Total de locales en ${mes}: 0`; // Si no hay locales, contador es 0
      montoBrutoElement.innerText = 'Monto bruto total: $0';
      montoNetoElement.innerText = 'Monto neto total: $0';
    }
  });
}















//-------------------------------------

const scrollBtn = document.getElementById('scroll-btn');
let lastScrollTop = 0;

// Función para detectar scroll
window.addEventListener('scroll', () => {
    const scrollPosition = window.scrollY;
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    const actividadContainer = document.getElementById('actividad-container');
    const ocultosContainer = document.getElementById('ocultos-container');
    const actividadContainerTop = actividadContainer.offsetTop;
    const actividadContainerBottom = actividadContainerTop + actividadContainer.offsetHeight;

    // Verificar si el scroll está dentro del contenedor de actividad
    const isInActividadContainer = scrollPosition >= actividadContainerTop && scrollPosition <= actividadContainerBottom;
    
    // Verificar si el contenedor ocultos está desplegado
    const isOcultosVisible = ocultosContainer.classList.contains('visible');

    // Mostrar el botón solo si estamos dentro del contenedor de actividad y el contenedor de ocultos no está desplegado
    if (isInActividadContainer && !isOcultosVisible && scrollPosition > 200 && scrollPosition < maxScroll - 200) {
        scrollBtn.classList.remove('hidden');
        scrollBtn.classList.add('visible');
    } else {
        scrollBtn.classList.remove('visible');
        scrollBtn.classList.add('hidden');
    }

    // Cambiar el icono dependiendo de la dirección de scroll
    if (scrollPosition > lastScrollTop) {
        // Scrolleando hacia abajo
        scrollBtn.innerHTML = '&#8681;'; // Flecha hacia abajo
    } else {
        // Scrolleando hacia arriba
        scrollBtn.innerHTML = '&#8679;'; // Flecha hacia arriba
    }

    lastScrollTop = scrollPosition <= 0 ? 0 : scrollPosition; // Evitar valores negativos en el scroll
});

// Función del botón al hacer clic
scrollBtn.addEventListener('click', () => {
    const scrollPosition = window.scrollY;
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    const actividadContainer = document.getElementById('actividad-container');
    const ocultosContainer = document.getElementById('ocultos-container');
    const actividadContainerClosed = actividadContainer.classList.contains('closed'); // Verificar si actividad está cerrado
    const ocultosContainerVisible = ocultosContainer.classList.contains('visible');  // Verificar si ocultos está desplegado
    const ocultosContainerTop = ocultosContainer.getBoundingClientRect().top;
    const ocultosContainerBottom = ocultosContainer.getBoundingClientRect().bottom;

    // Si el contenedor de ocultos está visible y estamos interactuando con él
    if (ocultosContainerVisible && scrollPosition >= ocultosContainerTop && scrollPosition <= ocultosContainerBottom) {
        const ocultosMaxScroll = ocultosContainer.scrollHeight - ocultosContainer.clientHeight;

        if (ocultosContainer.scrollTop < ocultosMaxScroll / 2) {
            // Si está en la primera mitad del contenedor de ocultos, scroll al final
            ocultosContainer.scrollTo({
                top: ocultosMaxScroll,
                behavior: 'smooth'
            });
        } else {
            // Si está en la segunda mitad del contenedor de ocultos, scroll al principio
            ocultosContainer.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        }
    } else {
        // Si el contenedor de actividad está abierto y no estamos en ocultos-container
        if (!actividadContainerClosed) {
            if (scrollPosition < maxScroll / 2) {
                // Si está en la primera mitad, scroll al final de la página
                window.scrollTo({
                    top: document.documentElement.scrollHeight,
                    behavior: 'smooth'
                });
            } else {
                // Si está en la segunda mitad, scroll al título del mes
                document.getElementById('titulo-mes').scrollIntoView({
                    behavior: 'smooth'
                });
            }
        } else {
            // Si el contenedor actividad está cerrado o si no estamos interactuando con ningún contenedor
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        }
    }
});






//--------------------------------------OCULTOS----------------













// ----------------------------------------------------------------------------------------------
// Función para cargar los años, meses y días disponibles desde la base de datos
let listaVisible = false; // Variable para rastrear si la lista está visible o no

// Variables globales para los contadores
let totalMontoBruto = 0;
let totalMontoNeto = 0;
let montoBrutoMes = 0;
let montoNetoMes = 0;

// Función que se ejecuta al hacer clic en "Ver montos por día"
document.getElementById('ver-montos-btn').addEventListener('click', () => {
  const montosContainer = document.getElementById('montos-container');
  const opcionesFechaContainer = document.getElementById('opciones-fecha-container');
  const contadoresContainer = document.getElementById('contadores-container'); // Contenedor para mostrar los contadores

  // Alternar visibilidad de la lista
  if (!listaVisible) {
    cargarMontosAgrupadosPorFecha();
    montosContainer.style.display = 'block'; // Mostrar el contenedor de montos
    opcionesFechaContainer.style.display = 'block'; // Mostrar el filtro
    contadoresContainer.style.display = 'block'; // Mostrar los contadores
    listaVisible = true;
  } else {
    montosContainer.innerHTML = ''; // Limpiar la lista
    montosContainer.style.display = 'none'; // Ocultar el contenedor de montos
    opcionesFechaContainer.style.display = 'none'; // Ocultar el filtro
    contadoresContainer.style.display = 'none'; // Ocultar los contadores
    listaVisible = false;
  }
});

// Función para cargar los montos agrupados por fecha
function cargarMontosAgrupadosPorFecha() {
  const montosContainer = document.getElementById('montos-container');
  const contadoresContainer = document.getElementById('contadores-container');
  montosContainer.innerHTML = ''; // Limpiar el contenedor de montos anteriores
  totalMontoBruto = 0; // Reiniciar el contador global
  totalMontoNeto = 0;

  const actividadRef = ref(db, 'actividad'); // Referencia a la actividad en la base de datos
  const montosPorFecha = {}; // Objeto para agrupar los montos por fecha
  const montosPorMes = {}; // Objeto para agrupar montos por mes completo

  onValue(actividadRef, (snapshot) => {
    const actividad = snapshot.val(); // Obtener todos los locales

    if (actividad) {
      // Recorrer todos los años y meses en la actividad
      Object.keys(actividad).forEach(anio => {
        Object.keys(actividad[anio]).forEach(mes => {
          const locales = actividad[anio][mes];

          // Inicializar las variables para el mes actual
          if (!montosPorMes[`${anio}-${mes}`]) {
            montosPorMes[`${anio}-${mes}`] = { bruto: 0, neto: 0 };
          }

          // Recorrer todos los locales del mes
          Object.values(locales).forEach(local => {
            const fechaModificacion = local.fechaModificacion;

            if (fechaModificacion) {
              // Extraer solo el día completo (DD/MM/YYYY) de la fecha
              const fechaKey = fechaModificacion.split(', ')[0];

              // Si la fecha no existe en el objeto, inicializarla
              if (!montosPorFecha[fechaKey]) {
                montosPorFecha[fechaKey] = 0;
              }

              // Sumar el costo del local al monto bruto total de esa fecha
              montosPorFecha[fechaKey] += parseFloat(local.costo);

              // Sumar al total global bruto y neto
              totalMontoBruto += parseFloat(local.costo);
              totalMontoNeto += parseFloat(local.costo) * 0.40; // Calcular el monto neto como el 40%

              // Sumar al total bruto y neto del mes correspondiente
              montosPorMes[`${anio}-${mes}`].bruto += parseFloat(local.costo);
              montosPorMes[`${anio}-${mes}`].neto += parseFloat(local.costo) * 0.40;
            }
          });
        });
      });

      // Convertir el objeto de fechas a un array y ordenarlo por fecha descendente
      const fechasOrdenadas = Object.keys(montosPorFecha).sort((a, b) => {
        const fechaA = new Date(a.split('/').reverse().join('/')).getTime();
        const fechaB = new Date(b.split('/').reverse().join('/')).getTime();
        return fechaB - fechaA; // Orden descendente (más reciente primero)
      });

      // Crear las opciones del filtro de fechas
      const filtroDia = document.getElementById('nuevo-select-dia');
      filtroDia.innerHTML = ''; // Limpiar las opciones anteriores
      fechasOrdenadas.forEach(fecha => {
        const option = document.createElement('option');
        option.value = fecha;
        option.innerText = fecha;
        filtroDia.appendChild(option);
      });

      // Mostrar los montos agrupados por fecha en el contenedor
      fechasOrdenadas.forEach(fecha => {
        const montoBrutoTotal = montosPorFecha[fecha];
        const montoNetoTotal = montoBrutoTotal * 0.40; // Calcular el monto neto como el 40%

        // Crear un contenedor para mostrar la fecha y los montos
        const fechaContainer = document.createElement('div');
        fechaContainer.className = 'fecha-item';

        fechaContainer.innerHTML = `
          <h4>Montos para el día ${fecha}:</h4>
          <p>Monto bruto total: ${formatoMoneda(montoBrutoTotal)}</p>
          <p>Monto neto total: ${formatoMoneda(montoNetoTotal)}</p>
        `;

        // Añadir el contenedor al montosContainer
        montosContainer.appendChild(fechaContainer);
      });

      // Mostrar los montos totales globales en los contadores
      const totalBrutoContainer = document.getElementById('total-bruto');
      const totalNetoContainer = document.getElementById('total-neto');
      totalBrutoContainer.innerHTML = `Monto bruto total: ${formatoMoneda(totalMontoBruto)}`;
      totalNetoContainer.innerHTML = `Monto neto total: ${formatoMoneda(totalMontoNeto)}`;
    } else {
      montosContainer.innerHTML = '<p>No hay datos disponibles en la base de datos.</p>';
    }
  });
}

// Función para formatear los montos con separador de miles y símbolo de moneda
function formatoMoneda(monto) {
  return `$${monto.toLocaleString('es-ES', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

// Filtro: Mostrar montos solo para la fecha seleccionada
document.getElementById('obtener-montos-btn').addEventListener('click', () => {
  const filtroDia = document.getElementById('nuevo-select-dia').value;
  filtrarPorFecha(filtroDia);
});

// Función para filtrar y mostrar los montos de la fecha seleccionada y el mes correspondiente
function filtrarPorFecha(fechaSeleccionada) {
  const montosContainer = document.getElementById('montos-container');
  montosContainer.innerHTML = ''; // Limpiar el contenedor de montos anteriores
  montoBrutoMes = 0; // Reiniciar el contador para el mes y año seleccionados
  montoNetoMes = 0;

  const actividadRef = ref(db, 'actividad');
  const montosPorFecha = {};

  onValue(actividadRef, (snapshot) => {
    const actividad = snapshot.val();

    if (actividad) {
      const [diaSeleccionado, mesSeleccionado, anioSeleccionado] = fechaSeleccionada.split('/');

      Object.keys(actividad).forEach(anio => {
        Object.keys(actividad[anio]).forEach(mes => {
          const locales = actividad[anio][mes];

          Object.values(locales).forEach(local => {
            const fechaModificacion = local.fechaModificacion;

            if (fechaModificacion) {
              const fechaKey = fechaModificacion.split(', ')[0];

              // Filtrar montos por fecha seleccionada
              if (fechaKey === fechaSeleccionada) {
                if (!montosPorFecha[fechaKey]) {
                  montosPorFecha[fechaKey] = 0;
                }
                montosPorFecha[fechaKey] += parseFloat(local.costo);
              }

              // Sumar montos del mes correspondiente
              const [diaLocal, mesLocal, anioLocal] = fechaKey.split('/');
              if (mesLocal === mesSeleccionado && anioLocal === anioSeleccionado) {
                montoBrutoMes += parseFloat(local.costo);
                montoNetoMes += parseFloat(local.costo) * 0.40;
              }
            }
          });
        });
      });

      // Mostrar el monto de la fecha seleccionada
      if (montosPorFecha[fechaSeleccionada]) {
        const montoBrutoTotal = montosPorFecha[fechaSeleccionada];
        const montoNetoTotal = montoBrutoTotal * 0.40;

        const fechaContainer = document.createElement('div');
        fechaContainer.className = 'fecha-item';

        fechaContainer.innerHTML = `
          <h4>Montos para el día ${fechaSeleccionada}:</h4>
          <p>Monto bruto total: ${formatoMoneda(montoBrutoTotal)}</p>
          <p>Monto neto total: ${formatoMoneda(montoNetoTotal)}</p>
        `;

        montosContainer.appendChild(fechaContainer);
      } else {
        montosContainer.innerHTML = `<p>No hay montos para la fecha seleccionada (${fechaSeleccionada}).</p>`;
      }

      // Mostrar los montos filtrados del mes y año seleccionados
      const mesBrutoContainer = document.getElementById('mes-bruto');
      const mesNetoContainer = document.getElementById('mes-neto');
      mesBrutoContainer.innerHTML = `Monto bruto del mes: ${formatoMoneda(montoBrutoMes)}`;
      mesNetoContainer.innerHTML = `Monto neto del mes: ${formatoMoneda(montoNetoMes)}`;
    }
  });
}







//---------------------------------------------------------------------------------------------
//---------------------------------------------------------------------------------------------

// Función para ocultar locales recientes que ya están en "Actividad" el mismo día
function ocultarLocalesRecientesDuplicados() {
  const fechaActual = new Date().toLocaleDateString(); // Obtener la fecha actual

  // Iterar a través de los locales en "Recientes"
  onValue(localesRef, (snapshot) => {
    const localesRecientes = snapshot.val();

    if (localesRecientes) {
      Object.keys(localesRecientes).forEach((localId) => {
        // Referencia a la sección "Actividad" para este local
        const actividadRef = ref(db, `actividad/${localId}`);

        onValue(actividadRef, (actividadSnapshot) => {
          const actividadLocales = actividadSnapshot.val();

          if (actividadLocales) {
            Object.values(actividadLocales).forEach((actividadLocal) => {
              // Comprobar si la fecha de modificación coincide con la fecha actual
              if (actividadLocal.fechaModificacion && actividadLocal.fechaModificacion.split(',')[0] === fechaActual) {
                // Ocultar el local de la sección "Recientes"
                const localElemento = document.querySelector(`.local-item[data-id="${localId}"]`);
                if (localElemento) {
                  localElemento.style.display = 'none';
                }
              }
            });
          }
        });
      });
    }
  });
}





function limpiarOcultos() {
  const ocultosRef = ref(db, 'ocultos/');
  remove(ocultosRef).then(() => {
      cargarLocales(); // Recargar los locales
  });
}



document.querySelectorAll('.mes-btn').forEach(btn => {
  btn.addEventListener('click', () => {
      const mes = btn.getAttribute('data-mes');
      const anio = document.getElementById('select-anio').value;
      limpiarOcultos(); // Limpiar locales ocultos para el nuevo mes
      cargarLocalesPorMes(anio, mes);
  });
});




// Función para mostrar y ocultar los locales ocultos
function toggleLocalesOcultos() {
  const ocultosContainer = document.getElementById('ocultos-container');
  const toggleOcultosBtn = document.getElementById('toggle-ocultos-btn');
  let mostrandoOcultos = false;

  toggleOcultosBtn.addEventListener('click', () => {
      mostrandoOcultos = !mostrandoOcultos;
      
      if (mostrandoOcultos) {
          ocultosContainer.style.display = 'block'; // Mostrar el contenedor
          mostrarLocalesOcultos(); // Llamar a la función para mostrar los locales ocultos
          toggleOcultosBtn.textContent = 'Ocultar locales ocultos';
      } else {
          ocultosContainer.style.display = 'none'; // Ocultar el contenedor
          ocultosContainer.innerHTML = ''; // Limpiar el contenido del contenedor
          toggleOcultosBtn.textContent = 'Mostrar locales ocultos';
      }
  });
}





// Función para cargar y mostrar los locales ocultos
// Función para cargar y mostrar los locales ocultos, ordenados por fecha de modificación
function mostrarLocalesOcultos() {
  const ocultosContainer = document.getElementById('ocultos-container');

  onValue(localesRef, (snapshot) => {
      ocultosContainer.innerHTML = ''; // Limpiar el contenedor de ocultos
      let locales = snapshot.val();

      if (locales) {
          // Convertir el objeto locales a un array
          locales = Object.values(locales);

          // Función para convertir la fecha en formato "DD/MM/YYYY, HH:mm:ss a.m./p.m." a timestamp
          const convertirFecha = (fechaStr) => {
              if (!fechaStr) return 0; // Si no hay fecha, retorna 0
              
              const [fecha, hora] = fechaStr.split(', ');
              const [dia, mes, anio] = fecha.split('/').map(Number);
              let [tiempo, periodo] = hora.split(' ');
              let [horas, minutos, segundos] = tiempo.split(':').map(Number);

              // Convertir a formato de 24 horas
              if (periodo === 'p.m.' && horas !== 12) horas += 12;
              if (periodo === 'a.m.' && horas === 12) horas = 0;

              return new Date(anio, mes - 1, dia, horas, minutos, segundos).getTime();
          };

          // Ordenar los locales por la fecha de modificación (de más reciente a más antiguo)
          locales.sort((a, b) => {
              const fechaA = convertirFecha(a.fechaModificacion);
              const fechaB = convertirFecha(b.fechaModificacion);
              return fechaB - fechaA; // Orden descendente
          });

          // Filtrar y mostrar los locales ocultos
          locales.forEach(local => {
              if (local.estado === 'realizado' || local.estado === 'problema') {
                  const ocultarRef = ref(db, `ocultos/${local.id}`);

                  get(ocultarRef).then(ocultarSnapshot => {
                      if (ocultarSnapshot.exists() && ocultarSnapshot.val() === true) {
                          const localItem = document.createElement('div');
                          localItem.className = 'local-item oculto';
                          localItem.setAttribute('data-id', local.id);

                          // Mostrar la fecha de modificación si existe
                          const fechaStr = local.fechaModificacion || 'No modificado';

                          localItem.innerHTML = `
                              <h4 style="margin: 0 0 5px 0;">${local.nombre}</h4>
                              <p style="margin: 5px 0;">Dirección: ${local.direccion}</p>
                              <p style="margin: 5px 0;">Costo: ${local.costo}</p>
                              <p style="margin: 5px 0;">Tipo de Factura: ${local.factura}</p>
                              <p style="margin: 5px 0;">Número de Finca: ${local.numeroFinca}</p>
                              <p style="margin: 5px 0;">Estado Actual: ${local.estado}</p>
                              <p style="margin: 5px 0; color: gray;">Fecha de modificación: ${fechaStr}</p>
                              <button class="mostrar-btn">Mostrar</button>
                          `;

                          // Event listener para el botón Mostrar
                          localItem.querySelector('.mostrar-btn').addEventListener('click', () => {
                              set(ocultarRef, false).then(() => {
                                  localItem.remove(); // Remover el elemento de la interfaz
                              });
                          });

                          ocultosContainer.appendChild(localItem);
                      }
                  });
              }
          });
      }
  });
}


// Llamar a la función para configurar el botón de mostrar/ocultar locales ocultos
toggleLocalesOcultos();





//---------------------------------------------------------------------------------------------------------------
function verificarInicioDeMesYMostrarLocales() {
  const ahora = new Date();
  
  // Verificar si es el primer día del mes
  if (ahora.getDate() === 1) {
      // Verificar si la hora actual está entre las 00:00 y las 00:15
      const horas = ahora.getHours();
      const minutos = ahora.getMinutes();
      
      if (horas === 0 && minutos <= 15) {
          mostrarTodosLosLocales();  // Mostrar todos los locales ocultos
      }
  }
}

// Llama a la función al cargar la página
verificarInicioDeMesYMostrarLocales();


function mostrarTodosLosLocales() {
  onValue(localesRef, (snapshot) => {
      let locales = snapshot.val();

      if (locales) {
          locales = Object.values(locales);

          locales.forEach(local => {
              if (local.estado === 'realizado' || local.estado === 'problema') {
                  const ocultarRef = ref(db, `ocultos/${local.id}`);
                  
                  // Cambiar el estado de "oculto" a "visible"
                  get(ocultarRef).then(ocultarSnapshot => {
                      if (ocultarSnapshot.exists() && ocultarSnapshot.val() === true) {
                          set(ocultarRef, false);  // Quitar el ocultamiento del local
                      }
                  });
              }
          });
      }
  });
}


//---------------------------------------------------------------------------------------------------------------
//---------------------------------------------------------------------------------------------------------------


function crearBotonMostrarLocales() {
  const botonContainer = document.getElementById('boton-container'); // Asegúrate de tener un contenedor para el botón
  const boton = document.createElement('button');
  
  boton.textContent = 'Mostrar todos los locales ocultos';
  
  // Asigna el ID o clase al botón para aplicar los estilos CSS
  boton.id = 'boton-mostrar-locales';  // Usamos el ID 'boton-mostrar-locales'

  // Función que se ejecuta al hacer clic
  boton.addEventListener('click', () => {
      mostrarTodosLosLocales();
  });

  // Agregar el botón al contenedor
  botonContainer.appendChild(boton);
}


// Llama a la función para crear el botón cuando cargue la página
crearBotonMostrarLocales();


















document.querySelectorAll('.mes-btn').forEach(button => {
  let firstClick = true;

  button.addEventListener('click', () => {
    // Lógica para actualizar el contenido de #mes-actual si es necesario
    // Por ejemplo: document.getElementById('mes-actual').textContent = button.textContent;

    if (firstClick) {
      setTimeout(() => {
        document.getElementById('titulo-mes').scrollIntoView({
          behavior: 'smooth'
        });
      }, 600); // El valor de 500 ms puede ajustarse si es necesario
      firstClick = false; // Establecer a false después del primer clic
    } else {
      document.getElementById('titulo-mes').scrollIntoView({
        behavior: 'smooth'
      });
    }
  });
});


