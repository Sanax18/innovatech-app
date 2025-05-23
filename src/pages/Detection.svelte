<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import '../styles/Detection.css'; // Descomenta si tienes estilos en un archivo separado
  // Importa aquí cualquier otra dependencia que necesites (TF.js, etc.)
  // import * as tf from '@tensorflow/tfjs'; // Ejemplo si usas TensorFlow.js

  // --- Estado del Componente ---
  let mode: 'camera' | 'computer' = "camera";
  let mediaType: 'camera' | 'video' | 'image' | null = null; // Para diferenciar el tipo de medio en modo 'computer' o si es la cámara

  /** @type {HTMLVideoElement | null} */
  let videoElement: HTMLVideoElement | null = null;
  /** @type {HTMLImageElement | null} */
  let imageElement: HTMLImageElement | null = null;
  /** @type {HTMLCanvasElement | null} */
  let canvasElement: HTMLCanvasElement | null = null;

  /** @type {string | null} */
  let mediaFileSrc: string | null = null; // Para URL.createObjectURL() de video o imagen
  let isDragging = false;
  /** @type {{ ready: boolean } | null} */
  let model: { ready: boolean; } | null = null; // Tu modelo de Roboflow
  /** @type {MediaStream | null} */
  let streamCamera: MediaStream | null = null;

  let rafId: number | null = null; // Para controlar requestAnimationFrame

  // --- Carga del Modelo (Ejecutar una vez) ---
  async function loadRoboflowModel() {
    console.log('Intentando cargar el modelo de Roboflow...');
    // Aquí va tu lógica para cargar el modelo (TF.js, ONNX.js)
    // Simulación:
    await new Promise(resolve => setTimeout(resolve, 500));
    model = { ready: true };
    console.log('Modelo (simulado) cargado.');
  }

  onMount(async () => {
    await loadRoboflowModel();
    if (mode === 'camera') {
      selectMode('camera'); // Llama a selectMode para una inicialización consistente
    }
  });

  // --- Lógica para Modo Cámara ---
  async function startCameraMode() {
    mediaType = 'camera';
    if (mediaFileSrc) {
      URL.revokeObjectURL(mediaFileSrc);
      mediaFileSrc = null;
    }
    if (videoElement) videoElement.src = ""; // Limpiar src
    if (imageElement) imageElement.src = ""; // Limpiar src

    try {
      if (streamCamera && streamCamera.active) {
        // Si ya hay un stream activo, no es necesario volver a pedirlo
        // a menos que queramos forzar una nueva selección de dispositivo.
        // Por ahora, asumimos que si existe y está activo, lo reutilizamos.
      } else {
        streamCamera?.getTracks().forEach(track => track.stop()); // Detener anterior si existía pero no activo
        streamCamera = await navigator.mediaDevices.getUserMedia({
          video: { width: 640, height: 480 }, // O las dimensiones que prefieras
          audio: false
        });
      }

      if (videoElement) {
        videoElement.srcObject = streamCamera;
        videoElement.play().catch(err => console.error("Error al reproducir stream de cámara:", err));
        // processFrameLoop se iniciará con el evento on:play
      }
    } catch (err) {
      console.error("Error al acceder a la cámara:", err);
      alert("No se pudo acceder a la cámara. Revisa los permisos.");
      mediaType = null; // Revertir si falla
    }
  }

  // --- Lógica para Modo Archivo ('computer') ---
  function startFileMode() {
    // No se hace nada aquí al seleccionar el modo, se espera la carga del archivo.
    // La limpieza del modo cámara se hace en selectMode.
    // mediaType se establecerá al cargar el archivo.
  }

  // --- Manejadores de Drag and Drop y Selección de Archivo ---
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

  async function handleFileSelected(event: DragEvent | Event) {
    event.preventDefault();
    isDragging = false;
    if (mode !== 'computer') return;

    let files: FileList | null = null;
    if (event instanceof DragEvent && event.dataTransfer) {
      files = event.dataTransfer.files;
    } else if (event.target && (event.target as HTMLInputElement).files) {
      files = (event.target as HTMLInputElement).files;
    }

    if (files && files.length > 0) {
      const file = files[0];

      // Limpiar recurso y tipo de medio anterior
      if (mediaFileSrc) URL.revokeObjectURL(mediaFileSrc);
      mediaFileSrc = null;
      mediaType = null;
      if (videoElement) videoElement.src = "";
      if (imageElement) imageElement.src = "";


      if (file.type.startsWith('video/')) {
        mediaType = 'video';
        mediaFileSrc = URL.createObjectURL(file);
        console.log('Video cargado:', file.name);
        // El <video> se actualizará debido al bind:src y su evento on:play llamará a processFrameLoop
      } else if (file.type.startsWith('image/')) {
        mediaType = 'image';
        mediaFileSrc = URL.createObjectURL(file);
        console.log('Imagen cargada:', file.name);
        // El <img> se actualizará por el bind:src y su evento on:load llamará a onImageLoad
      } else {
        alert('Por favor, selecciona o arrastra un archivo de video o imagen válido.');
      }
    }
  }

  // --- Procesamiento e Inferencia ---
  async function performInferenceAndDraw(sourceElement: HTMLVideoElement | HTMLImageElement) {
    if (!model || !model.ready || !sourceElement || !canvasElement) {
        console.warn("Modelo, fuente o canvas no listos para inferencia.");
        return;
    }

    let sourceWidth: number, sourceHeight: number;

    if (sourceElement instanceof HTMLVideoElement) {
        sourceWidth = sourceElement.videoWidth;
        sourceHeight = sourceElement.videoHeight;
    } else if (sourceElement instanceof HTMLImageElement) {
        sourceWidth = sourceElement.naturalWidth;
        sourceHeight = sourceElement.naturalHeight;
    } else {
        console.error("Fuente de medio desconocida para inferencia.");
        return;
    }

    if (!sourceWidth || !sourceHeight) {
        console.warn("Dimensiones de la fuente no disponibles.");
        return; // No se puede dibujar si no hay dimensiones
    }

    if (canvasElement.width !== sourceWidth || canvasElement.height !== sourceHeight) {
        canvasElement.width = sourceWidth;
        canvasElement.height = sourceHeight;
    }

    const ctx = canvasElement.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvasElement.width, canvasElement.height);
    ctx.drawImage(sourceElement, 0, 0, canvasElement.width, canvasElement.height);

    console.log(`Realizando inferencia en ${mediaType}... (simulado)`);
    // >>> Aquí va tu lógica de INFERENCIA REAL con el modelo de Roboflow <<<
    // Ejemplo: const predictions = await model.detect(sourceElement); // TF.js puede tomar elementos HTML
    // Aquí dibujas las predicciones (`predictions`) en el `ctx`.
    // drawPredictions(ctx, predictions);

    // Simulación de detección
    if (Math.random() < 0.3) { // Dibuja algo para simular detección
        ctx.strokeStyle = 'rgba(255, 165, 0, 0.8)'; ctx.lineWidth = 3;
        const x = Math.random() * (canvasElement.width - 100);
        const y = Math.random() * (canvasElement.height - 80);
        const w = 60 + Math.random() * 40; const h = 50 + Math.random() * 30;
        ctx.strokeRect(x, y, w, h);
        ctx.fillText(`Detectado`, x, y > 10 ? y - 5 : y + 10);
    }
  }

  // Bucle para video y cámara
  function processFrameLoop() {
    if (rafId) cancelAnimationFrame(rafId); // Cancela el frame anterior si existe

    if (
        (mediaType === 'camera' && videoElement && videoElement.srcObject && (videoElement.srcObject as MediaStream).active) ||
        (mediaType === 'video' && videoElement && !videoElement.paused && !videoElement.ended && videoElement.src)
    ) {
        if (videoElement.readyState >= 2) { // HAVE_CURRENT_DATA o más
            performInferenceAndDraw(videoElement);
        }
        rafId = requestAnimationFrame(processFrameLoop);
    } else {
        rafId = null; // Detiene el bucle
    }
  }

  // Para imagen (una sola vez cuando carga)
  async function handleImageLoad() {
    if (mediaType === 'image' && imageElement && mediaFileSrc) { // Asegura que sea el modo y elemento correctos
      console.log("Imagen cargada en <img>, realizando inferencia...");
      await performInferenceAndDraw(imageElement);
    }
  }

  // --- Cambio de Modo ---
  function selectMode(newMode: 'camera' | 'computer') {
    mode = newMode;

    // Detener y limpiar cualquier medio activo
    if (rafId) {
        cancelAnimationFrame(rafId);
        rafId = null;
    }
    if (videoElement) {
        videoElement.pause();
        videoElement.src = "";
        videoElement.srcObject = null;
    }
    if (imageElement) {
        imageElement.src = "";
    }
    if (mediaFileSrc) {
        URL.revokeObjectURL(mediaFileSrc);
        mediaFileSrc = null;
    }
    if (streamCamera) {
        streamCamera.getTracks().forEach(track => track.stop());
        streamCamera = null;
    }
    mediaType = null; // Resetear tipo de medio
    if (canvasElement) {
        const ctx = canvasElement.getContext('2d');
        ctx?.clearRect(0, 0, canvasElement.width, canvasElement.height);
    }

    if (newMode === 'camera') {
      startCameraMode();
    } else if (newMode === 'computer') {
      startFileMode(); // Prepara para la carga, no inicia nada activo aún
    }
  }

  // --- Ciclo de Vida ---
  onDestroy(() => {
    if (rafId) cancelAnimationFrame(rafId);
    if (mediaFileSrc) URL.revokeObjectURL(mediaFileSrc);
    if (streamCamera) streamCamera.getTracks().forEach(track => track.stop());
  });

</script>


<div class="detection-container">
  <p class="detection__description">
    Seleccione una opción para realizar la detección:
  </p>

  <div class="detection__option-grid">
    <button type="button" class="detection__option-card {mode === 'camera' ? 'active' : ''}" on:click={() => selectMode('camera')} aria-pressed={mode === 'camera'}>
      <div class="detection__option-icon">📷</div>
      <div class="detection__option-label">Visión por Cámara</div>
    </button>
    <button type="button" class="detection__option-card {mode === 'computer' ? 'active' : ''}" on:click={() => selectMode('computer')} aria-pressed={mode === 'computer'}>
      <div class="detection__option-icon">📁</div>
      <div class="detection__option-label">Cargar Archivo</div>
    </button>
  </div>

  <div class="detection__content-area">
    {#if mode === "camera"}
      <div class="media-display-wrapper">
        <video
          bind:this={videoElement}
          class="media-element" class:active={mediaType === 'camera'}
          autoplay muted playsinline
          on:play={processFrameLoop}
          on:loadedmetadata={() => { if (canvasElement && videoElement) { canvasElement.width = videoElement.videoWidth; canvasElement.height = videoElement.videoHeight; }}}
        ></video>
        <img bind:this={imageElement} class="media-element" alt="" />
        <canvas bind:this={canvasElement}></canvas>
      </div>
      <p class="placeholder-text">Cámara activa. Apunta a los objetos a detectar.</p>

    {:else if mode === "computer"}
      {#if !mediaFileSrc}
        <div
          class="dropzone"
          class:dragging={isDragging}
          role="region" aria-label="Área para arrastrar y soltar video o imagen"
          on:dragenter={handleDragEnter} on:dragover={handleDragOver}
          on:dragleave={handleDragLeave} on:drop={handleFileSelected}
        >
          <span style="font-size: 3rem; margin-bottom: 0.5rem;">📤</span>
          Arrastra un video o imagen aquí
          <div class="file-input-container">
            o
            <label class="file-input-label" for="fileUploadInput">Selecciona un archivo</label>
            <input id="fileUploadInput" type="file" accept="video/*,image/*" on:change={handleFileSelected} />
          </div>
        </div>
        <p class="placeholder-text">Esperando un archivo de video o imagen...</p>
      {:else}
        <div class="media-display-wrapper">
          <video
            bind:this={videoElement}
            src={mediaType === 'video' ? mediaFileSrc : ''}
            class="media-element" class:active={mediaType === 'video'}
            controls autoplay muted playsinline
            on:play={processFrameLoop}
            on:pause={() => console.log('Video pausado')}
            on:ended={() => console.log('Video finalizado')}
            on:loadedmetadata={() => { if (canvasElement && videoElement && mediaType === 'video') { canvasElement.width = videoElement.videoWidth; canvasElement.height = videoElement.videoHeight; }}}
          ></video>
          <img
            bind:this={imageElement}
            src={mediaType === 'image' ? mediaFileSrc : ''}
            alt="Imagen cargada"
            class="media-element" class:active={mediaType === 'image'}
            on:load={handleImageLoad}
          />
          <canvas bind:this={canvasElement}></canvas>
        </div>
        <p class="placeholder-text">
          {#if mediaType === 'video'}Video cargado. Presiona play para detección.{:else if mediaType === 'image'}Imagen cargada. Procesando...{/if}
        </p>
      {/if}
    {/if}
  </div>
</div>