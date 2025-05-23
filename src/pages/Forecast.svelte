<script>
  import { onMount, onDestroy } from "svelte"; // Añadimos onDestroy
  import axios from "axios";
  import "../styles/Forecast.css";

  // Variables para la lectura actual
  let temperature = "--";
  let humidity = "--";
  let lastUpdateTime = "--";

  // Array para almacenar lecturas históricas
  /** @type {{ time: string, temperature: string, humidity: string, originalTimestamp: string }[]} */
  let readings = [];

  // Variables para la paginación
  let pageSize = 8;
  let currentPage = 0;
  $: totalPages = Math.ceil(readings.length / pageSize);
  $: paginatedReadings = readings.slice(
    currentPage * pageSize,
    (currentPage + 1) * pageSize
  );

  // Estado de carga y errores
  let loading = true;
  let errorMessage = "";

  // --- NUEVO: Variables para la actualización automática ---
  let autoRefreshEnabled = false; // Por defecto desactivado
  const refreshIntervalSeconds = 30; // Actualizar cada 30 segundos (puedes ajustar esto)
  /**
   * @type {NodeJS.Timeout | null}
   */
  let autoRefreshTimerId = null;

  // Función para obtener y procesar los datos desde la BD
  async function fetchDataFromDB(isAutoRefresh = false) {
    if (!isAutoRefresh) {
      // Solo mostrar indicador de carga principal para carga manual/inicial
      loading = true;
    }
    errorMessage = ""; // Limpiar errores en cada intento
    try {
      const response = await axios.get("http://127.0.0.1:8000/lectura_sensor"); // Reemplaza con tu endpoint

      if (response.data && Array.isArray(response.data)) {
        const rawReadings = response.data;
        // Opcional: Ordenar si el backend no lo hace (más reciente primero)
        // rawReadings.sort((a, b) => new Date(b.fecha_hora) - new Date(a.fecha_hora));

        if (rawReadings.length > 0) {
          const latestReading = rawReadings[0];
          temperature = parseFloat(latestReading.temperatura).toFixed(1);
          humidity = parseFloat(latestReading.humedad).toFixed(1);
          lastUpdateTime = new Date(
            latestReading.fecha_hora
          ).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

          readings = rawReadings.map((item) => ({
            time: new Date(item.fecha_hora).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            }),
            temperature: parseFloat(item.temperatura).toFixed(1),
            humidity: parseFloat(item.humedad).toFixed(1),
            originalTimestamp: item.fecha_hora,
          }));
        } else {
          if (!isAutoRefresh) {
            // Solo mostrar error principal si no es auto-refresh
            temperature = "--";
            humidity = "--";
            lastUpdateTime = "N/A";
            readings = [];
            errorMessage = "No hay datos de clima disponibles.";
          }
        }
      } else {
        throw new Error("La respuesta de la API no tiene el formato esperado.");
      }
    } catch (error) {
      console.error("Error al obtener los datos del clima:", error);
      if (!isAutoRefresh) {
        errorMessage = "No se pudieron cargar los datos. Intenta de nuevo.";
        temperature = "--";
        humidity = "--";
        lastUpdateTime = "Error";
        readings = [];
      } else {
        // Para auto-refresh, podríamos querer un indicador más sutil o loguear el error
        const autoRefreshErrorMsg =
          typeof error === "object" && error && "message" in error
            ? error.message
            : String(error);
        console.warn("Fallo la actualización automática:", autoRefreshErrorMsg);
      }
    } finally {
      if (!isAutoRefresh) {
        loading = false;
      }
    }
  }

  // --- NUEVO: Lógica para el temporizador de actualización automática ---
  function toggleAutoRefresh() {
    // autoRefreshEnabled ya fue actualizado por bind:checked={autoRefreshEnabled}
    // por lo que aquí ya tiene el nuevo valor (true si se activó, false si se desactivó)
    console.log(
      "Estado de autoRefreshEnabled después del click (bind:checked):",
      autoRefreshEnabled
    );

    if (autoRefreshEnabled) {
      console.log("Iniciando temporizador..."); // Para depurar
      fetchDataFromDB(true); // Llamada inicial al activar
      autoRefreshTimerId = setInterval(() => {
        console.log("Ejecutando actualización automática..."); // Para depurar
        fetchDataFromDB(true);
      }, refreshIntervalSeconds * 1000);
    } else {
      console.log("Deteniendo temporizador..."); // Para depurar
      if (autoRefreshTimerId) {
        clearInterval(autoRefreshTimerId);
        autoRefreshTimerId = null; // Buena práctica: resetear el ID
      }
    }
  }

  onMount(() => {
    fetchDataFromDB(); // Carga inicial de datos
  });

  // --- NUEVO: Limpiar el temporizador al desmontar el componente ---
  onDestroy(() => {
    if (autoRefreshTimerId) {
      clearInterval(autoRefreshTimerId);
    }
  });

  function nextPage() {
    if (currentPage < totalPages - 1) {
      currentPage += 1;
    }
  }
  function prevPage() {
    if (currentPage > 0) {
      currentPage -= 1;
    }
  }
</script>

<div class="forecast-container">
  <h1 class="small-title">Estadísticas del Clima</h1>

  {#if loading && !autoRefreshEnabled}
    <div class="loading-indicator">Cargando datos... 🛰️</div>
  {:else if errorMessage && !autoRefreshEnabled}
    <div class="error-message">{errorMessage} 😟</div>
  {/if}

  <div class="stats-cards">
    <div class="card-forecast">
      <div class="card-icon">🌡️</div>
      <h2>{temperature}°C</h2>
      <p>Temperatura</p>
    </div>
    <div class="card-forecast">
      <div class="card-icon">💧</div>
      <h2>{humidity}%</h2>
      <p>Humedad</p>
    </div>
    <div class="card-forecast card-time">
      <div class="card-icon">⏱️</div>
      <h2>{lastUpdateTime}</h2>
      <p>Última Act.</p>
    </div>
  </div>

  <div class="controls-container">
    <button
      class="refresh-btn-forecast"
      on:click={() => fetchDataFromDB(false)}
      disabled={loading && !autoRefreshEnabled}
    >
      {loading && !autoRefreshEnabled
        ? "Actualizando..."
        : "Actualizar Manualmente"}
    </button>

    <div class="auto-refresh-control">
      <label class="switch">
        <input
          type="checkbox"
          bind:checked={autoRefreshEnabled}
          on:change={toggleAutoRefresh}
        />
        <span class="slider round"></span>
      </label>
      <span>Actualización Automática ({refreshIntervalSeconds}s)</span>
    </div>
  </div>

  {#if readings.length > 0}
    <table class="forecast-table">
      <thead>
        <tr>
          <th>Hora</th>
          <th>Temperatura (°C)</th>
          <th>Humedad (%)</th>
        </tr>
      </thead>
      <tbody>
        {#each paginatedReadings as reading (reading.originalTimestamp)}
          <tr>
            <td>{reading.time}</td>
            <td>{reading.temperature}</td>
            <td>{reading.humidity}</td>
          </tr>
        {/each}
      </tbody>
    </table>

    <div class="pagination-controls">
      <button on:click={prevPage} disabled={currentPage === 0}
        >← Anterior</button
      >
      <span>Pág. {currentPage + 1} / {totalPages === 0 ? 1 : totalPages}</span>
      <button
        on:click={nextPage}
        disabled={currentPage >= totalPages - 1 || totalPages === 0}
        >Siguiente →</button
      >
    </div>
  {:else if !loading}
    <p class="no-history">No hay historial de lecturas disponible.</p>
  {/if}
</div>