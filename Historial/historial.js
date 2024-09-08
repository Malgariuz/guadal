// Importar las funciones necesarias de los SDKs
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import { getDatabase, ref, set, get, child, update, onValue } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-database.js";

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
      const locales = snapshot.val();

      if (locales) {
          Object.values(locales).forEach(local => {
              if (local.estado === 'realizado' || local.estado === 'problema') {

                  const ocultarRef = ref(db, `ocultos/${local.id}`);

                  get(ocultarRef).then(ocultarSnapshot => {
                      if (ocultarSnapshot.exists() && ocultarSnapshot.val() === true) {
                          return; // Si el local está oculto, no lo mostramos
                      }

                      const localItem = document.createElement('div');
                      localItem.className = 'local-item';
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
                          <p style="margin: 5px 0;">Mes y Tasa: ${local.mesTasa || 'N/A'}</p>
                          <p style="margin: 5px 0;">Notas: ${local.notas || 'Sin notas'}</p>
                          <p style="margin: 5px 0; color: gray;">Fecha de la desinfeccion: ${fechaStr}</p>
                          <button class="edit-btn">Editar</button>
                          <button class="hide-btn">Ocultar</button>
                          <div class="edit-fields" style="display: none;">
                              <label>Monto: <input type="text" class="costo-input" value="${local.costo}"></label>
                              <label>Mes: 
                                  <select class="mes-select">
                                      <option value="enero" ${local.mesTasa?.includes('enero') ? 'selected' : ''}>Enero</option>
                                      <option value="febrero" ${local.mesTasa?.includes('febrero') ? 'selected' : ''}>Febrero</option>
                                      <option value="marzo" ${local.mesTasa?.includes('marzo') ? 'selected' : ''}>Marzo</option>
                                      <option value="abril" ${local.mesTasa?.includes('abril') ? 'selected' : ''}>Abril</option>
                                      <option value="mayo" ${local.mesTasa?.includes('mayo') ? 'selected' : ''}>Mayo</option>
                                      <option value="junio" ${local.mesTasa?.includes('junio') ? 'selected' : ''}>Junio</option>
                                      <option value="julio" ${local.mesTasa?.includes('julio') ? 'selected' : ''}>Julio</option>
                                      <option value="agosto" ${local.mesTasa?.includes('agosto') ? 'selected' : ''}>Agosto</option>
                                      <option value="septiembre" ${local.mesTasa?.includes('septiembre') ? 'selected' : ''}>Septiembre</option>
                                      <option value="octubre" ${local.mesTasa?.includes('octubre') ? 'selected' : ''}>Octubre</option>
                                      <option value="noviembre" ${local.mesTasa?.includes('noviembre') ? 'selected' : ''}>Noviembre</option>
                                      <option value="diciembre" ${local.mesTasa?.includes('diciembre') ? 'selected' : ''}>Diciembre</option>
                                  </select>
                              </label>
                              <label>Año: 
                                  <select class="anio-select">
                                      <option value="2024" ${local.mesTasa?.includes('2024') ? 'selected' : ''}>2024</option>
                                      <option value="2025" ${local.mesTasa?.includes('2025') ? 'selected' : ''}>2025</option>
                                      <option value="2026" ${local.mesTasa?.includes('2026') ? 'selected' : ''}>2026</option>
                                      <option value="2027" ${local.mesTasa?.includes('2027') ? 'selected' : ''}>2027</option>
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

                          location.reload();

                          // Obtener la fecha y hora actual
                          const fechaModificacion = new Date().toLocaleString();
                          
                          // Guardar en la nueva sección "actividad" con la estructura Año > Mes > Local
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
                              fechaModificacion: fechaModificacion // Guardar la fecha y hora de modificación
                          }).then(() => {
                              // Eliminar el local de la sección "Locales Recientes"
                              remove(ref(db, `locales/${local.id}`));
                              localItem.remove(); // Remover el elemento de la interfaz

                              // Mover el local al contenedor de "Locales Desinfectados"
                              desinfectadosContainer.appendChild(localItem);
                          });
                      });

                      // Event listener para el botón Ocultar
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

// Función para cargar locales por mes y año seleccionados y contar los realizados
function cargarLocalesPorMes(anio, mes) {
  const actividadContainer = document.getElementById('actividad-container');
  const tituloMes = document.getElementById('titulo-mes');
  const contadorElement = document.getElementById('contador-locales'); // Elemento para mostrar el contador

  actividadContainer.innerHTML = ''; // Limpiar el contenedor de actividad
  contadorElement.innerText = ''; // Limpiar el contador de locales realizados
  
  const mesRef = ref(db, `actividad/${anio}/${mes}`);
  let contadorRealizados = 0; // Inicializar contador para locales en estado "realizado"

  // Actualiza el título con el mes seleccionado
  tituloMes.innerHTML = `Actividad de ${mes} (${anio})`;

  onValue(mesRef, (snapshot) => {
    const locales = snapshot.val();
    
    if (locales) {
      Object.values(locales).forEach(local => {
        const localItem = document.createElement('div');
        localItem.className = 'local-item';
        localItem.setAttribute('data-id', local.id);

        // Contar solo locales en estado "realizado"
        if (local.estado === 'realizado') {
          contadorRealizados++; // Incrementar el contador si el local está en estado realizado
        }

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

      // Actualizar el contador de locales realizados en la interfaz
      contadorElement.innerText = `Total de locales realizados en ${mes}: ${contadorRealizados}`;
    } else {
      actividadContainer.innerHTML = '<p>No hay locales para este mes y año seleccionados.</p>';
      contadorElement.innerText = `Total de locales realizados en ${mes}: 0`; // Si no hay locales, contador es 0
    }
  });
}











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
function mostrarLocalesOcultos() {
  const ocultosContainer = document.getElementById('ocultos-container');

  onValue(localesRef, (snapshot) => {
      ocultosContainer.innerHTML = ''; // Limpiar el contenedor de ocultos
      const locales = snapshot.val();

      if (locales) {
          Object.values(locales).forEach(local => {
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
      }, 500); // El valor de 500 ms puede ajustarse si es necesario
      firstClick = false; // Establecer a false después del primer clic
    } else {
      document.getElementById('titulo-mes').scrollIntoView({
        behavior: 'smooth'
      });
    }
  });
});


