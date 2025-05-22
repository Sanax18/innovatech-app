<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import '../styles/Detection.css'; // Asegúrate de tener este archivo CSS
  // Importa aquí cualquier otra dependencia que necesites (TF.js, etc.)
  // import * as tf from '@tensorflow/tfjs'; // Ejemplo si usas TensorFlow.js

  // --- Estado del Componente ---
  let mode = "camera"; // 'camera' o 'computer' (lo llamaré 'videoFile' internamente para consistencia)
  /** @type {HTMLVideoElement|null} */
  let videoElement: HTMLVideoElement | null = null;
  /** @type {HTMLCanvasElement|null} */
  let canvasElement: HTMLCanvasElement | null = null;
  /** @type {string|null} */
  let videoFileSrc: string | null = null;
  let isDragging = false;
  /** @type {{ ready: boolean } | null} */
  let model: { ready: boolean; } | null = null; // Tu modelo de Roboflow
  /** @type {MediaStream|null} */
  let streamCamera: MediaStream | null = null;

  // --- Carga del Modelo (Ejecutar una vez) ---
  async function loadRoboflowModel() {
    console.log('Intentando cargar el modelo de Roboflow...');
    // Aquí va tu lógica para cargar el modelo (TF.js, ONNX.js)
    // Ejemplo conceptual:
    // model = await tf.loadGraphModel('URL_DE_TU_MODELO/model.json');
    // console.log('Modelo cargado y listo.');
    // Simulación:
    await new Promise(resolve => setTimeout(resolve, 500)); // Simula carga
    model = { ready: true }; // Simula un modelo cargado
    console.log('Modelo (simulado) cargado.');
  }

  onMount(async () => {
    await loadRoboflowModel();
    if (mode === 'camera') {
      startCameraMode();
    }
  });

  // --- Lógica para Modo Cámara ---
  async function startCameraMode() {
    if (videoFileSrc) {
      URL.revokeObjectURL(videoFileSrc);
      videoFileSrc = null;
      if (videoElement) videoElement.src = ""; // Limpiar src para que no intente cargar video anterior
    }

    try {
      if (streamCamera) {
          streamCamera.getTracks().forEach(track => track.stop());
      }
      streamCamera = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480 },
        audio: false
      });
      if (videoElement) {
        videoElement.srcObject = streamCamera;
        // No es necesario videoElement.play() aquí si tienes autoplay en el tag <video>
        // requestAnimationFrame(processFrame) se llamará desde el evento on:play del video
      }
    } catch (err) {
      console.error("Error al acceder a la cámara:", err);
      alert("No se pudo acceder a la cámara. Revisa los permisos.");
    }
  }

  // --- Lógica para Modo Video (Archivo, tu 'computer' mode) ---
  function startVideoFileMode() {
    if (streamCamera) {
      streamCamera.getTracks().forEach(track => track.stop());
      streamCamera = null;
      if (videoElement) videoElement.srcObject = null;
    }
  }

  // --- Manejadores de Drag and Drop ---
  function handleDragEnter(event: DragEvent) {
    event.preventDefault();
    if (mode === 'computer') isDragging = true;
  }

  function handleDragOver(event: DragEvent) {
    event.preventDefault();
    if (mode === 'computer') isDragging = true;
  }

  function handleDragLeave(event: DragEvent) {
    event.preventDefault();
    if (mode === 'computer') isDragging = false;
  }

  function handleFileSelected(event: DragEvent | Event) {
    event.preventDefault();
    isDragging = false;
    if (mode !== 'computer') return;

    let files: FileList | null = null;
    if (event instanceof DragEvent && event.dataTransfer) {
      files = event.dataTransfer.files;
    } else if (
      event.target &&
      (event.target as HTMLInputElement).files
    ) {
      files = (event.target as HTMLInputElement).files;
    }
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type.startsWith('video/')) {
        if (videoFileSrc) URL.revokeObjectURL(videoFileSrc);
        videoFileSrc = URL.createObjectURL(file);
        if (videoElement) {
          videoElement.src = videoFileSrc;
          // El video se reproducirá automáticamente si tiene 'autoplay'
          // y el evento on:play iniciará processFrame
        }
        console.log('Video cargado:', file.name);
      } else {
        alert('Por favor, selecciona o arrastra un archivo de video válido.');
      }
    }
  }

  // --- Procesamiento de Frames e Inferencia ---
  function processFrame() {
    if (!model || !model.ready || !videoElement || !canvasElement) {
      if (videoElement && !videoElement.paused && !videoElement.ended) {
        requestAnimationFrame(processFrame);
      }
      return;
    }

    if (mode === 'computer' && (videoElement.paused || videoElement.ended || !videoFileSrc)) {
      // Detiene el bucle si es video y está pausado/terminado o no hay src
      return;
    }
    if (
      mode === 'camera' &&
      (
        !videoElement.srcObject ||
        !(videoElement.srcObject instanceof MediaStream) ||
        !videoElement.srcObject.active
      )
    ) {
      // Detiene el bucle si es cámara y no hay stream
      return;
    }

    // Asegurarse que el canvas tenga el tamaño correcto del video
    if (canvasElement.width !== videoElement.videoWidth || canvasElement.height !== videoElement.videoHeight) {
      canvasElement.width = videoElement.videoWidth;
      canvasElement.height = videoElement.videoHeight;
    }

    const ctx = canvasElement.getContext('2d');
    if (!ctx) {
      // No se pudo obtener el contexto, salir de la función
      return;
    }
    ctx.clearRect(0, 0, canvasElement.width, canvasElement.height); // Limpiar canvas
    ctx.drawImage(videoElement, 0, 0, canvasElement.width, canvasElement.height);

    // >>> Aquí va tu lógica de INFERENCIA con el modelo de Roboflow <<<
    // Ejemplo:
    // const predictions = await performRoboflowInference(videoElement); // Esta función la crearías tú
    // drawPredictions(ctx, predictions); // Esta función la crearías tú para dibujar

    // Simulación de detección para visualización
    if (Math.random() < 0.1) { // Dibuja una caja aleatoria de vez en cuando
        ctx.strokeStyle = 'rgba(0, 255, 0, 0.8)';
        ctx.lineWidth = 3;
        const x = Math.random() * (canvasElement.width - 100);
        const y = Math.random() * (canvasElement.height - 80);
        const w = 60 + Math.random() * 40;
        const h = 50 + Math.random() * 30;
        ctx.strokeRect(x, y, w, h);
        ctx.fillStyle = 'rgba(0, 255, 0, 0.8)';
        ctx.fillText(`Objeto ${Math.floor(Math.random()*10)}`, x, y > 10 ? y - 5 : y + 10);
    }


    requestAnimationFrame(processFrame);
  }

  // --- Cambio de Modo ---
  /**
   * @param {string} newMode
   */
  function selectMode(newMode: string) {
    mode = newMode;
    // Detener video/cámara actual antes de cambiar
    if (videoElement) {
        videoElement.pause();
        if (videoFileSrc && newMode !== 'computer') { // Si se cambia de modo video a cámara
            URL.revokeObjectURL(videoFileSrc);
            videoFileSrc = null;
            videoElement.src = "";
        }
        if (streamCamera && newMode !== 'camera') { // Si se cambia de modo cámara a video
            streamCamera.getTracks().forEach(track => track.stop());
            streamCamera = null;
            videoElement.srcObject = null;
        }
    }


    if (newMode === 'camera') {
      startCameraMode();
    } else if (newMode === 'computer') {
      startVideoFileMode();
    }
  }

  // --- Ciclo de Vida ---
  onDestroy(() => {
    if (videoFileSrc) URL.revokeObjectURL(videoFileSrc);
    if (streamCamera) streamCamera.getTracks().forEach(track => track.stop());
  });

</script>

<style>

</style>

<div class="detection-container">
  <p class="detection__description">
    Seleccione una opción para realizar la detección de objetos:
  </p>

  <div class="detection__option-grid">
    <button type="button" class="detection__option-card {mode === 'camera' ? 'active' : ''}" on:click={() => selectMode("camera")} aria-pressed={mode === 'camera'}>
      <div class="detection__option-icon">📷</div>
      <div class="detection__option-label">Visión por Cámara</div>
    </button>
    <button type="button" class="detection__option-card {mode === 'computer' ? 'active' : ''}" on:click={() => selectMode("computer")} aria-pressed={mode === 'computer'}>
      <div class="detection__option-icon">💻</div>
      <div class="detection__option-label">Cargar Video</div> </button>
  </div>

  <div class="detection__content-area">
    {#if mode === "camera"}
      <div class="video-display-wrapper">
        <video
          bind:this={videoElement}
          autoplay
          muted
          playsinline
          on:play={processFrame}
          on:loadedmetadata={() => {
            if (canvasElement && videoElement) { // Asegurar que existan antes de acceder a videoWidth/Height
                canvasElement.width = videoElement.videoWidth;
                canvasElement.height = videoElement.videoHeight;
            }
          }}
        ></video>
        <canvas bind:this={canvasElement}></canvas>
      </div>
      <p class="placeholder-text" style="margin-top:1rem;">Cámara activa. Apunta a los objetos a detectar.</p>

    {:else if mode === "computer"}
      {#if !videoFileSrc}
        <div
          class="dropzone"
          class:dragging={isDragging}
          role="region"
          aria-label="Área para arrastrar y soltar video"
          on:dragenter={handleDragEnter}
          on:dragover={handleDragOver}
          on:dragleave={handleDragLeave}
          on:drop={handleFileSelected}
        >
          <span style="font-size: 3rem; margin-bottom: 0.5rem;">📤</span>
          Arrastra un video aquí
          <div class="file-input-container">
            o
            <label class="file-input-label" for="videoUpload">Selecciona un archivo</label>
            <input id="videoUpload" type="file" accept="video/*" on:change={handleFileSelected} />
          </div>
        </div>
        <p class="placeholder-text">Esperando un archivo de video...</p>
      {:else}
        <div class="video-display-wrapper">
          <video
            bind:this={videoElement}
            src={videoFileSrc}
            controls
            autoplay
            muted
            playsinline
            on:play={processFrame}
            on:pause={() => console.log('Video pausado')}
            on:ended={() => console.log('Video finalizado')}
            on:loadedmetadata={() => {
                if (canvasElement && videoElement) { // Asegurar que existan
                    canvasElement.width = videoElement.videoWidth;
                    canvasElement.height = videoElement.videoHeight;
                }
            }}
          ></video>
          <canvas bind:this={canvasElement}></canvas>
        </div>
        <p class="placeholder-text" style="margin-top:1rem;">Video cargado. Presiona play para iniciar la detección.</p>
      {/if}
    {/if}
  </div>
</div>