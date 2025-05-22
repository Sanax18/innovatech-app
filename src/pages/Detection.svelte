<script>
    import '../styles/Detection.css';

  // Define el modo activo; por defecto, "camera"
  let mode = "camera";

  /**
   * @param {string} newMode
   */
  function selectMode(newMode) {
    mode = newMode;
  }
</script>

<div class="detection-container">
  <!-- Breve descripción de la pestaña -->
  <p class="detection__description">
    Seleccione una opción para realizar la detección de objetos:
  </p>

  <!-- Opciones en forma de cuadrado -->
  <div class="detection__option-grid">
    <button type="button" class="detection__option-card {mode === 'camera' ? 'active' : ''}" on:click={() => selectMode("camera")} aria-pressed={mode === 'camera'}>
      <div class="detection__option-icon">📷</div>
      <div class="detection__option-label">Visión por Cámara</div>
    </button>
    <button type="button" class="detection__option-card {mode === 'computer' ? 'active' : ''}" on:click={() => selectMode("computer")} aria-pressed={mode === 'computer'}>
      <div class="detection__option-icon">💻</div>
      <div class="detection__option-label">Visión por Computadora</div>
    </button>
  </div>

  <!-- Contenido según la modalidad seleccionada -->
  <div class="detection__content">
    {#if mode === "camera"}
      <p>Opción: Visión por Cámara – pendiente de implementación</p>
      <!-- Aquí se integrará el módulo o componente para la visión por cámara -->
    {:else if mode === "computer"}
      <p>Opción: Visión por Computadora – pendiente de implementación</p>
      <!-- Aquí se integrará el modelo YOLO Ultralytics para visión por computadora -->
    {/if}
  </div>
</div>