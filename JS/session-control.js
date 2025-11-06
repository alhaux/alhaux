// ============================
// 🔐 CONTROL DE SESIÓN INTELIGENTE (adaptado)
// ============================
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";

// Configuración de tu proyecto Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBoYEWeYYmhiFadOFlA2SmMFuZab8tMtVU",
  authDomain: "design-reyes.firebaseapp.com",
  projectId: "design-reyes",
  storageBucket: "design-reyes.appspot.com",
  messagingSenderId: "454744557781",
  appId: "1:454744557781:web:ed4eaf82abdcc79e2afa5c",
  measurementId: "G-KCEX0JCC76"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Función para redirigir según el rol
async function redirigirSegunRol(user) {
  try {
    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      const data = userSnap.data();
      if (data.role === "admin") {
        window.location.href = "/admin.html";
      } else {
        window.location.href = "/dashboard.html";
      }
    } else {
      await signOut(auth);
      window.location.href = "/login.html";
    }
  } catch (error) {
    console.error("Error al verificar el rol:", error);
  }
}

// Detectar estado de sesión
onAuthStateChanged(auth, async (user) => {
  if (user) {
    await redirigirSegunRol(user);
  } else {
    // Si la página es login.html, no redirigir en bucle
    if (!window.location.pathname.includes("login.html")) {
      window.location.href = "/login.html";
    }
  }
});

// Cerrar sesión (si tienes botón logout)
const btnLogout = document.getElementById("btnLogout");
if (btnLogout) {
  btnLogout.addEventListener("click", async () => {
    await signOut(auth);
    localStorage.clear();
    window.location.href = "/login.html";
  });
}
