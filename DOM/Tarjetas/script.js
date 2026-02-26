// ==========================
// Config por categoría
// ==========================
const CATEGORY_CONFIG = {
    trabajo: { label: "Trabajo", color: "#2ecc71" },
    personal: { label: "Personal", color: "#e74c3c" },
    estudio: { label: "Estudio", color: "#3498db" },
    hobbies: { label: "Hobbies", color: "#f39c12" },
    otros: { label: "Otros", color: "#9b59b6" },
};

// ==========================
// Estado global (fuente de verdad)
// ==========================
let tarjetas = []; // { id, titulo, descripcion, categoria, fechaISO }

// ==========================
// DOM
// ==========================
const formulario = document.getElementById('tarjetaForm');
const cardsGrid = document.getElementById('cardsGrid');
const emptyState = document.getElementById('emptyState');
const contadorTarjetas = document.getElementById('contadorTarjetas');
const limpiarBtn = document.getElementById('limpiarBtn');

const searchInput = document.getElementById('searchInput');
const filterCategoria = document.getElementById('filterCategoria');
const resetFiltrosBtn = document.getElementById('resetFiltrosBtn');

// ==========================
// Helpers
// ==========================
function actualizarContador() {
    const n = tarjetas.length;
    contadorTarjetas.textContent = (n === 1) ? "1 tarjeta" : `${n} tarjetas`;
}

function limpiarFormulario() {
    formulario.reset();
}

function getFiltros() {
    return {
        texto: (searchInput.value || "").trim().toLowerCase(),
        categoria: filterCategoria.value || "todas",
    };
}

function aplicarFiltros(list) {
    const { texto, categoria } = getFiltros();

    return list.filter(t => {
        const matchCategoria = (categoria === "todas") ? true : t.categoria === categoria;
        const matchTexto = texto === ""
            ? true
            : (t.titulo.toLowerCase().includes(texto) || t.descripcion.toLowerCase().includes(texto));

        return matchCategoria && matchTexto;
    });
}

function setEmptyState(modo, totalTarjetas) {
    // modo: "noTarjetas" | "sinResultados"
    if (modo === "noTarjetas") {
        emptyState.querySelector("h3").textContent = "No hay tarjetas creadas";
        emptyState.querySelector("p").textContent = "¡Usa el formulario para crear tu primera tarjeta!";
    } else {
        emptyState.querySelector("h3").textContent = "No hay resultados";
        emptyState.querySelector("p").textContent = `No se encontraron tarjetas con esos filtros. (Total: ${totalTarjetas})`;
    }
    emptyState.style.display = "block";
}

// ==========================
// Render
// ==========================
function renderTarjetas() {
    // Limpia todo menos el emptyState (lo reinsertamos)
    cardsGrid.innerHTML = "";
    cardsGrid.appendChild(emptyState);

    const total = tarjetas.length;
    const visibles = aplicarFiltros(tarjetas);

    if (total === 0) {
        setEmptyState("noTarjetas", 0);
        return;
    }

    if (visibles.length === 0) {
        setEmptyState("sinResultados", total);
        return;
    }

    emptyState.style.display = "none";

    // Render visibles (más nuevas primero si quieres)
    visibles
        .slice()
        .sort((a, b) => b.fechaISO.localeCompare(a.fechaISO))
        .forEach(t => {
            const cfg = CATEGORY_CONFIG[t.categoria] || CATEGORY_CONFIG.otros;

            const cardElement = document.createElement('div');
            cardElement.className = 'card';
            cardElement.id = t.id;

            cardElement.innerHTML = `
                <div class="card-header" style="background: ${cfg.color};">
                    <h3 class="card-title">${escapeHTML(t.titulo)}</h3>
                </div>
                <div class="card-body">
                    <span class="card-category">${cfg.label}</span>
                    <p class="card-content">${escapeHTML(t.descripcion)}</p>
                </div>
                <div class="card-footer">
                    <span>Creada: ${new Date(t.fechaISO).toLocaleDateString()}</span>
                    <button class="delete-btn" data-action="delete" data-id="${t.id}">Eliminar</button>
                </div>
            `;

            cardsGrid.appendChild(cardElement);
        });
}

// Para evitar que metan HTML en título/descr (simple)
function escapeHTML(str) {
    return String(str)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

// ==========================
// Crear / Eliminar
// ==========================
function crearTarjeta(titulo, descripcion, categoria) {
    const id = 'card-' + Date.now();

    tarjetas.push({
        id,
        titulo,
        descripcion,
        categoria,
        fechaISO: new Date().toISOString(),
    });

    actualizarContador();
    renderTarjetas();
}

function eliminarTarjeta(cardId) {
    tarjetas = tarjetas.filter(t => t.id !== cardId);
    actualizarContador();
    renderTarjetas();
}

// ==========================
// Eventos
// ==========================
formulario.addEventListener('submit', function (event) {
    event.preventDefault();

    const titulo = document.getElementById('titulo').value.trim();
    const descripcion = document.getElementById('descripcion').value.trim();
    const categoria = document.getElementById('categoria').value;

    if (!titulo || !descripcion || !categoria) return;

    crearTarjeta(titulo, descripcion, categoria);
    limpiarFormulario();
});

limpiarBtn.addEventListener('click', limpiarFormulario);

// Delegación para eliminar (sin onclick inline)
cardsGrid.addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-action='delete']");
    if (!btn) return;
    eliminarTarjeta(btn.dataset.id);
});

// Filtros
searchInput.addEventListener("input", renderTarjetas);
filterCategoria.addEventListener("change", renderTarjetas);

resetFiltrosBtn.addEventListener("click", () => {
    searchInput.value = "";
    filterCategoria.value = "todas";
    renderTarjetas();
});

// ==========================
// Ejemplos al cargar
// ==========================
window.addEventListener('DOMContentLoaded', function () {
    const ejemplos = [
        {
            titulo: 'Aprender JavaScript',
            descripcion: 'Completar el curso avanzado de manipulación del DOM y eventos.',
            categoria: 'estudio',
        },
        {
            titulo: 'Reunión de equipo',
            descripcion: 'Presentación del nuevo proyecto de desarrollo web.',
            categoria: 'trabajo',
        },
        {
            titulo: 'Gimnasio',
            descripcion: 'Rutina de entrenamiento: cardio y pesas.',
            categoria: 'personal',
        }
    ];

    ejemplos.forEach(e => crearTarjeta(e.titulo, e.descripcion, e.categoria));
});
