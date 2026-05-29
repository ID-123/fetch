import "./style.css";

// ======================================
// CONFIGURACIÓN
// ======================================

// URL base de la API
const API_URL = "http://localhost:3000/tasks";

// ======================================
// VARIABLES GLOBALES
// ======================================

// Formulario
const taskForm = document.getElementById("taskForm");

const deleteSelectedBtn = document.getElementById("deleteSelectedBtn");

const selectAll = document.getElementById("selectAll");

const completeSelectedBtn = document.getElementById("completeSelectedBtn");

// Input
const taskInput = document.getElementById("taskInput");

// Lista
const taskList = document.getElementById("taskList");

// Mensajes
const message = document.getElementById("message");

const loading = document.getElementById("loading");

// Array global de tareas
let tasks = [];

// ======================================
// UTILIDADES
// ======================================

// Mostrar mensajes dinámicos
function showMessage(text, type) {
  message.textContent = text;

  // Color según tipo
  if (type === "error") {
    message.style.color = "red";
  } else {
    message.style.color = "green";
  }

  // Limpiar mensaje después de 3 segundos
  setTimeout(() => {
    message.textContent = "";
  }, 3000);
}

function showLoading(text) {
  loading.textContent = text;
}

// ======================================
// LOCAL STORAGE
// ======================================

// Guardar tareas
function saveTasks() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

// Cargar tareas
function loadTasks() {
  const storedTasks = localStorage.getItem("tasks");

  if (storedTasks) {
    tasks = JSON.parse(storedTasks);

    renderTasks();
  }
}

// ======================================
// ACTUALIZAR BOTÓN COMPLETAR
// ======================================

function updateCompleteButton() {
  // Obtener seleccionadas
  const selectedTasks = tasks.filter((task) => {
    return task.selected;
  });

  // Si no hay seleccionadas
  if (selectedTasks.length === 0) {
    completeSelectedBtn.textContent = "Completar seleccionadas";

    return;
  }

  // Verificar si todas están completas
  const allCompleted = selectedTasks.every((task) => {
    return task.completed;
  });

  // Cambiar texto dinámicamente
  if (allCompleted) {
    completeSelectedBtn.textContent = "Desmarcar completadas";
  } else {
    completeSelectedBtn.textContent = "Completar seleccionadas";
  }
}

// ======================================
// API
// ======================================

// Obtener tareas
async function fetchTasks() {
  showLoading("Cargando tareas...");

  try {
    const response = await fetch(API_URL);

    // Validar respuesta HTTP
    if (!response.ok) {
      throw new Error("Error al obtener tareas");
    }

    const data = await response.json();

    // Guardar tareas
    tasks = data;

    // Persistencia local
    saveTasks();

    // Renderizar
    renderTasks();

    showLoading("");

    console.log("Tareas obtenidas:", data);
  } catch (error) {
    console.error(error);
    showLoading("");

    // Si falla API usar Local Storage
    loadTasks();

    showMessage("Servidor no disponible. Cargando datos locales.", "error");
  }
}

// ======================================
// RENDERIZADO
// ======================================

function renderTasks() {
  // Limpiar lista
  taskList.innerHTML = "";

  // Estado vacío
  if (tasks.length === 0) {
    const emptyMessage = document.createElement("p");

    emptyMessage.textContent = "No hay tareas todavía.";

    taskList.appendChild(emptyMessage);

    return;
  }

  // Recorrer tareas
  tasks.forEach((task) => {
    // Elemento li
    const li = document.createElement("li");

    // Contenedor izquierdo
    const leftContainer = document.createElement("div");

    leftContainer.classList.add("left-container");

    // Contenedor derecho
    const rightContainer = document.createElement("div");

    rightContainer.classList.add("right-container");

    // ======================================
    // CHECKBOX
    // ======================================

    const checkbox = document.createElement("input");

    checkbox.type = "checkbox";

    // Estado actual
    checkbox.checked = task.selected;

    // Evento cambio
    checkbox.addEventListener("change", function () {
      task.selected = checkbox.checked;

      // Verificar si todas están seleccionadas
      const allSelected = tasks.every((task) => {
        return task.selected;
      });

      // Actualizar checkbox global
      selectAll.checked = allSelected;

      saveTasks();
    });

    // Agregar checkbox
    leftContainer.appendChild(checkbox);

    // Contenedor del texto
    const taskSpan = document.createElement("span");

    taskSpan.textContent = task.text;

    // Tarea completada
    if (task.completed) {
      taskSpan.classList.add("completed-task");
    }

    // Agregar texto
    leftContainer.appendChild(taskSpan);

    // ======================================
    // BOTÓN EDITAR
    // ======================================

    const editButton = document.createElement("button");

    editButton.classList.add("edit-btn");

    editButton.textContent = "Editar";

    editButton.addEventListener("click", function () {
      const newText = prompt("Editar tarea:", task.text);

      // Validar texto
      if (newText !== null && newText.trim() !== "") {
        // Verificar duplicado
        const taskExists = tasks.some((currentTask) => {
          return (
            currentTask.id !== task.id &&
            currentTask.text.toLowerCase().trim() ===
              newText.toLowerCase().trim()
          );
        });

        // Validar duplicado
        if (taskExists) {
          showMessage("Ya existe una tarea con ese nombre", "error");

          return;
        }

        updateTask(task.id, newText);
      }
    });

    // Agregar botón editar
    rightContainer.appendChild(editButton);

    // ======================================
    // BOTÓN COMPLETAR
    // ======================================

    const completeButton = document.createElement("button");

    completeButton.classList.add("complete-btn");

    // Texto dinámico
    if (task.completed) {
      completeButton.textContent = "Deshacer";
    } else {
      completeButton.textContent = "Completar";
    }

    completeButton.addEventListener("click", function () {
      toggleTaskCompleted(task.id);
    });

    // Agregar botón
    rightContainer.appendChild(completeButton);

    // ======================================
    // BOTÓN ELIMINAR
    // ======================================

    const deleteButton = document.createElement("button");

    deleteButton.classList.add("delete-btn");

    deleteButton.textContent = "Eliminar";

    deleteButton.addEventListener("click", function () {
      // Confirmación
      const confirmDelete = confirm("¿Seguro que deseas eliminar esta tarea?");

      if (confirmDelete) {
        deleteTask(task.id);
      }
    });

    // Agregar botón eliminar
    rightContainer.appendChild(deleteButton);

    // Agregar li al ul
    li.appendChild(leftContainer);
    li.appendChild(rightContainer);
    taskList.appendChild(li);
  });
}

// ======================================
// CRUD
// ======================================

// ======================================
// CREAR TAREA
// ======================================

async function addTask(taskText) {
  // Nueva tarea
  const task = {
    text: taskText,
    selected: false,
    completed: false,
  };

  try {
    const response = await fetch(API_URL, {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify(task),
    });

    // Validar respuesta
    if (!response.ok) {
      throw new Error("Error al crear tarea");
    }

    // Convertir respuesta
    const newTask = await response.json();

    // Actualizar array
    tasks.push(newTask);

    // Guardar localmente
    saveTasks();

    // Renderizar
    renderTasks();

    console.log("Tarea creada:", newTask);

    showMessage("Tarea agregada correctamente", "success");
  } catch (error) {
    console.error(error);

    showMessage("Error al agregar tarea", "error");
  }
}

// ======================================
// ELIMINAR TAREA
// ======================================

async function deleteTask(taskId) {
  try {
    const response = await fetch(`${API_URL}/${taskId}`, {
      method: "DELETE",
    });

    // Validar respuesta
    if (!response.ok) {
      throw new Error("Error al eliminar tarea");
    }

    // Filtrar tareas
    tasks = tasks.filter((task) => {
      return task.id !== taskId;
    });

    // Guardar
    saveTasks();

    // Renderizar
    renderTasks();

    // Reiniciar selector global
    selectAll.checked = false;

    console.log("Tarea eliminada:", taskId);

    showMessage("Tarea eliminada correctamente", "success");
  } catch (error) {
    console.error(error);

    showMessage("Error al eliminar tarea", "error");
  }
}

// ======================================
// COMPLETAR TAREAS SELECCIONADAS
// ======================================

async function completeSelectedTasks() {
  try {
    // Obtener seleccionadas
    const selectedTasks = tasks.filter((task) => {
      return task.selected;
    });

    // Validar selección
    if (selectedTasks.length === 0) {
      showMessage("No hay tareas seleccionadas", "error");

      return;
    }

    // Actualizar una por una
    for (const task of selectedTasks) {
      const updatedTask = {
        ...task,

        completed: true,
      };

      // PUT
      await fetch(`${API_URL}/${task.id}`, {
        method: "PUT",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify(updatedTask),
      });
    }

    // Actualizar array local
    tasks = tasks.map((task) => {
      if (task.selected) {
        return {
          ...task,

          completed: true,

          selected: false,
        };
      }

      return task;
    });

    // Guardar
    saveTasks();

    // Renderizar
    renderTasks();

    // Reset global
    selectAll.checked = false;

    showMessage("Tareas completadas", "success");
  } catch (error) {
    console.error(error);

    showMessage("Error al completar tareas", "error");
  }
}

// ======================================
// ELIMINAR TAREAS SELECCIONADAS
// ======================================

async function deleteSelectedTasks() {
  try {
    // Obtener tareas seleccionadas
    const selectedTasks = tasks.filter((task) => {
      return task.selected;
    });

    // Validar selección
    if (selectedTasks.length === 0) {
      showMessage("No hay tareas seleccionadas", "error");

      return;
    }

    // Confirmación
    const confirmDelete = confirm(`¿Eliminar ${selectedTasks.length} tareas?`);

    if (!confirmDelete) {
      return;
    }

    // Eliminar una por una desde API
    for (const task of selectedTasks) {
      await fetch(`${API_URL}/${task.id}`, {
        method: "DELETE",
      });
    }

    // Filtrar tareas restantes
    tasks = tasks.filter((task) => {
      return !task.selected;
    });

    // Guardar
    saveTasks();

    // Renderizar
    renderTasks();

    // Reiniciar selector global
    selectAll.checked = false;

    showMessage("Tareas eliminadas correctamente", "success");
  } catch (error) {
    console.error(error);

    showMessage("Error al eliminar tareas", "error");
  }
}

// ======================================
// ACTUALIZAR TAREA
// ======================================

async function updateTask(taskId, newText) {
  try {
    // Buscar tarea actual
    const currentTask = tasks.find((task) => {
      return task.id === taskId;
    });

    // Crear tarea actualizada
    const updatedTask = {
      ...currentTask,

      text: newText,
    };

    const response = await fetch(`${API_URL}/${taskId}`, {
      method: "PUT",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify(updatedTask),
    });

    // Validar respuesta
    if (!response.ok) {
      throw new Error("Error al actualizar tarea");
    }

    // Convertir respuesta
    const data = await response.json();

    // Actualizar array
    tasks = tasks.map((task) => {
      if (task.id === taskId) {
        return data;
      }

      return task;
    });

    // Guardar
    saveTasks();

    // Renderizar
    renderTasks();

    console.log("Tarea actualizada:", data);

    showMessage("Tarea actualizada correctamente", "success");
  } catch (error) {
    console.error(error);

    showMessage("Error al actualizar tarea", "error");
  }
}

// ======================================
// TOGGLE COMPLETAR TAREA
// ======================================

async function toggleTaskCompleted(taskId) {
  try {
    // Buscar tarea
    const currentTask = tasks.find((task) => {
      return task.id === taskId;
    });

    // Invertir estado
    const updatedTask = {
      ...currentTask,

      completed: !currentTask.completed,
    };

    // PUT
    const response = await fetch(`${API_URL}/${taskId}`, {
      method: "PUT",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify(updatedTask),
    });

    // Validar
    if (!response.ok) {
      throw new Error("Error al actualizar tarea");
    }

    // Convertir respuesta
    const data = await response.json();

    // Actualizar array
    tasks = tasks.map((task) => {
      if (task.id === taskId) {
        return data;
      }

      return task;
    });

    // Guardar
    saveTasks();

    // Renderizar
    renderTasks();

    showMessage("Estado actualizado", "success");
  } catch (error) {
    console.error(error);

    showMessage("Error al actualizar estado", "error");
  }
}

// ======================================
// EVENTOS
// ======================================

// Evento submit
taskForm.addEventListener("submit", async function (event) {
  // Evitar recarga
  event.preventDefault();

  // Obtener texto
  const taskText = taskInput.value.trim();

  // Validar input
  if (taskText === "") {
    showMessage("La tarea no puede estar vacía", "error");

    return;
  }

  // Verificar duplicados
  const taskExists = tasks.some((task) => {
    return task.text.toLowerCase().trim() === taskText.toLowerCase().trim();
  });

  // Validar duplicado
  if (taskExists) {
    showMessage("La tarea ya existe", "error");

    return;
  }

  // Agregar tarea
  await addTask(taskText);

  // Limpiar input
  taskInput.value = "";
});

// ======================================
// SELECCIONAR TODAS
// ======================================

selectAll.addEventListener("change", function () {
  // Cambiar estado de todas
  tasks = tasks.map((task) => {
    return {
      ...task,

      selected: selectAll.checked,
    };
  });

  // Guardar
  saveTasks();

  // Renderizar
  renderTasks();
});

// ======================================
// COMPLETAR SELECCIONADAS
// ======================================

completeSelectedBtn.addEventListener("click", completeSelectedTasks);

// ======================================
// ELIMINAR SELECCIONADAS
// ======================================

deleteSelectedBtn.addEventListener("click", deleteSelectedTasks);

// ======================================
// INICIALIZACIÓN
// ======================================

// Obtener tareas desde API
fetchTasks();
