import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-database.js";
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

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Verificar el estado de autenticación al cargar la página
onAuthStateChanged(auth, (user) => {
    if (user) {
        // Usuario autenticado, permitir acceso al contenido protegido
        document.getElementById('estado-usuario').innerText = 'Usuario autenticado';
        document.getElementById('login-container').style.display = 'none';
        document.getElementById('protected-content').style.display = 'block';
    } else {
        // Usuario no autenticado, redirigir a la página de inicio de sesión
        window.location.href = 'login.html'; // Cambia 'login.html' al nombre de tu página de inicio de sesión
    }
});

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
