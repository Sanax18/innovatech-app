<script>
  import { onMount } from 'svelte';
  import '../../styles/Forecast.css';

  // Variables para la lectura actual
  let temperature = "--";
  let humidity = "--";

  // Array para almacenar lecturas históricas
  /** @type {{ time: string, temperature: string, humidity: string }[]} */
  let readings = [];

  // Variables para la paginación
  let pageSize = 8;
  let currentPage = 0;
  $: totalPages = Math.ceil(readings.length / pageSize);
  $: paginatedReadings = readings.slice(currentPage * pageSize, (currentPage + 1) * pageSize);

  // Función para simular la obtención de datos (temperatura y humedad)
  function refreshData() {
    const now = new Date();
    // Se simulan valores aleatorios
    temperature = (20 + Math.random() * 10).toFixed(1);
    humidity = (40 + Math.random() * 30).toFixed(1);

    // Se agrega la nueva lectura al inicio del array histórico
    readings = [
      { time: now.toLocaleTimeString(), temperature, humidity },
      ...readings
    ];
  }

  // Al montar el componente, se genera una lectura inicial
  onMount(() => {
    refreshData();
  });

  // Funciones para cambiar de página
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
  <!-- Sección de estadísticas actuales con modalidad similar a Detection -->
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
  </div>

  <!-- Botón para actualizar manualmente -->
  <button class="refresh-btn-forecast" on:click={refreshData}>Actualizar</button>

  <!-- Tabla histórica paginada -->
  <table class="forecast-table">
    <thead>
      <tr>
        <th>Hora</th>
        <th>Temperatura (°C)</th>
        <th>Humedad (%)</th>
      </tr>
    </thead>
    <tbody>
      {#each paginatedReadings as reading}
        <tr>
          <td>{reading.time}</td>
          <td>{reading.temperature}</td>
          <td>{reading.humidity}</td>
        </tr>
      {/each}
    </tbody>
  </table>

  <!-- Controles de paginación -->
  <div class="pagination-controls">
    <button on:click={prevPage} disabled={currentPage === 0}>← Anterior</button>
    <span>{currentPage + 1} / {totalPages === 0 ? 1 : totalPages}</span>
    <button on:click={nextPage} disabled={currentPage === totalPages - 1}>Siguiente →</button>
  </div>
</div>