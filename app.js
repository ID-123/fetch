// ======================================
// VARIABLES GLOBALES
// ======================================

// Formulario
const taskForm = document.getElementById("taskForm");

// Input
const taskInput = document.getElementById("taskInput");

// Lista
const taskList = document.getElementById("taskList");

// Mensajes
const message = document.getElementById("message");

// Array global de tareas
let tasks = [];

// ======================================
// GUARDAR EN LOCAL STORAGE
// ======================================

function saveTasks() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

// ======================================
// CARGAR TAREAS DESDE LOCAL STORAGE
// ======================================

function loadTasks() {
  // Obtener datos
  const storedTasks = localStorage.getItem("tasks");

  // Verificar existencia
  if (storedTasks) {
    // Convertir JSON a array
    tasks = JSON.parse(storedTasks);

    // Renderizar tareas
    renderTasks();
  }
}

// ======================================
// MOSTRAR MENSAJES
// ======================================

function showMessage(text, type) {
  // Texto del mensaje
  message.textContent = text;

  // Color según el tipo
  if (type === "error") {
    message.style.color = "red";
  } else {
    message.style.color = "green";
  }
}

// ======================================
// RENDERIZAR TAREAS
// ======================================

function renderTasks() {
  // Limpiar lista antes de renderizar
  taskList.innerHTML = "";

  // Recorrer tareas
  tasks.forEach((task) => {
    // Crear elemento li
    const li = document.createElement("li");

    // Texto de la tarea
    li.textContent = task.text;

    // Crear botón eliminar
    const deleteButton = document.createElement("button");

    deleteButton.textContent = "Eliminar";

    // Evento eliminar
    deleteButton.addEventListener("click", function () {
      deleteTask(task.id);
    });

    // Agregar botón al li
    li.appendChild(deleteButton);

    // Agregar li al ul
    taskList.appendChild(li);
  });
}

// ======================================
// AGREGAR TAREA
// ======================================

function addTask(taskText) {
  // Crear objeto tarea
  const task = {
    id: Date.now(),

    text: taskText,
  };

  // Agregar al array
  tasks.push(task);

  // Guardar en Local Storage
  saveTasks();

  // Renderizar nuevamente
  renderTasks();
}

// ======================================
// ELIMINAR TAREA
// ======================================

function deleteTask(taskId) {
  // Filtrar tareas
  tasks = tasks.filter((task) => {
    return task.id !== taskId;
  });

  // Guardar cambios
  saveTasks();

  // Renderizar nuevamente
  renderTasks();
}

// ======================================
// EVENTO SUBMIT
// ======================================

taskForm.addEventListener("submit", function (event) {
  // Evitar recarga
  event.preventDefault();

  // Obtener texto
  const taskText = taskInput.value.trim();

  // Validación
  if (taskText === "") {
    showMessage("La tarea no puede estar vacía", "error");

    return;
  }

  // Agregar tarea
  addTask(taskText);

  // Mensaje éxito
  showMessage("Tarea agregada correctamente", "success");

  // Limpiar input
  taskInput.value = "";
});

// ======================================
// INICIAR APLICACIÓN
// ======================================

loadTasks();
    