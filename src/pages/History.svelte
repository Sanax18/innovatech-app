<script>
  import { onMount } from "svelte";
  import { fade } from "svelte/transition";
  import "../styles/History.css";
  import { getCachedAccidentes } from "../interceptions/accidents.js";

  /**
   * @typedef {Object} Accident
   * @property {number} id
   * @property {string} fecha
   * @property {string} sexo_victima
   * @property {number|string} edad_victima
   * @property {number} condicion_victima_id
   * @property {number} gravedad_victima_id
   * @property {number} tipo_accidente_id
   * @property {number} ubicacion_id
   */

  /** @type {Array<Accident>} */
  let accidentHistory = [];
  /** @type {string | undefined} */
  let error;
  let loading = false;
  let pageSize = 11,
      currentPage = 0;
  let sortAlphabetically = false;

  // Filtros fusionados (el usuario puede escribir o seleccionar a través de las opciones del datalist)
  let filterFecha = "";
  let filterSexo = "";
  let filterEdad = "";
  let filterCondicion = "";
  let filterGravedad = "";
  let filterTipo = "";
  let filterUbicacion = "";

  // Función actualizada: se comparan los valores de forma exacta (en minúsculas)
  $: filteredAccidents = accidentHistory.filter(accident =>
    (!filterFecha ||
      new Date(accident.fecha).toISOString().slice(0, 10) === filterFecha) &&
    (!filterSexo ||
      accident.sexo_victima.toLowerCase() === filterSexo.toLowerCase()) &&
    (!filterEdad ||
      accident.edad_victima.toString() === filterEdad.toString()) &&
    (!filterCondicion ||
      (String(condiciones[accident.condicion_victima_id] || accident.condicion_victima_id)
        .toLowerCase() === filterCondicion.toLowerCase())) &&
    (!filterGravedad ||
      (String(gravedad[accident.gravedad_victima_id] || accident.gravedad_victima_id)
        .toLowerCase() === filterGravedad.toLowerCase())) &&
    (!filterTipo ||
      (String(tiposAccidente[accident.tipo_accidente_id] || accident.tipo_accidente_id)
        .toLowerCase() === filterTipo.toLowerCase())) &&
    (!filterUbicacion ||
      (String(ubicaciones[accident.ubicacion_id] || accident.ubicacion_id)
        .toLowerCase() === filterUbicacion.toLowerCase()))
  );

  // Ordenación y paginación
  $: sortedAccidents = sortAlphabetically
    ? [...filteredAccidents].sort((a, b) =>
        a.sexo_victima.localeCompare(b.sexo_victima)
      )
    : filteredAccidents;

  $: totalPages = Math.ceil(sortedAccidents.length / pageSize);
  $: paginatedAccidents = sortedAccidents.slice(
    currentPage * pageSize,
    (currentPage + 1) * pageSize
  );

  async function loadData() {
    loading = true;
    try {
      accidentHistory = await getCachedAccidentes();
      console.log("Datos cacheados:", accidentHistory);
    } catch (err) {
      error = "Error al cargar el historial cacheado";
      console.error(err);
    } finally {
      loading = false;
    }
  }

  onMount(() => {
    loadData();
  });

  // Mapeos para mostrar datos
  /** @type {Record<number, string>} */
  const condiciones = {
    1: "Peatón",
    2: "Acompañante",
    3: "Conductor",
    4: "Motociclista",
    5: "Pasajero",
    6: "Ciclista",
    7: "Menor de edad",
    8: "Sin reporte",
    9: "Sin definir"
  };

  /** @type {Record<number, string>} */
  const gravedad = {
    1: "Herido",
    2: "Muerto",
    3: "Sin definir"
  };

  /** @type {Record<number, string>} */
  const tiposAccidente = {
    1: "Atropello",
    2: "Choque",
    3: "Caída ocupante",
    4: "Volcamiento",
    5: "Otro",
    6: "Incendio",
    10: "Sin definir"
  };

  /** @type {Record<number, string>} */
  const ubicaciones = {
    // Si tienes un mapeo personalizado para ubicaciones, inclúyelo aquí
  };

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

  /**
   * @param {string} dateString
   */
  function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "long",
      year: "numeric"
    });
  }
</script>

<div class="history-container">
  <h1>Historial de Accidentes</h1>
  <p>
    A continuación se muestran los datos de accidentes registrados, donde se detalla el sexo de la víctima, su edad, su condición al momento del accidente, la gravedad, el tipo y la ubicación.
  </p>

  {#if loading}
    <div class="loading-container">
      <div class="spinner"></div>
      <p>Cargando...</p>
    </div>
  {:else if error}
    <p>{error}</p>
  {:else}
    <table class="history-table" in:fade={{ duration: 800, delay: 400 }}>
      <thead>
        <tr>
          <th style="width:19%">Fecha</th>
          <th style="width:9%">Sexo</th>
          <th style="width:9%">Edad</th>
          <th style="width:15%">Condición</th>
          <th style="width:15%">Gravedad</th>
          <th style="width:15%">Tipo</th>
          <th style="width:10%">Ubicación</th>
        </tr>
        <tr class="filter-row">
          <th>
            <input type="date" bind:value={filterFecha} />
          </th>
          <th>
            <input type="text" list="sexoOptions" bind:value={filterSexo} placeholder="Buscar" style="width:90%" />
            <datalist id="sexoOptions">
              <option value="M"> </option>
              <option value="F"> </option>
            </datalist>
          </th>
          <th>
            <input type="number" bind:value={filterEdad} placeholder="Filtrar" step="0" style="width:90%" />
          </th>
          <th>
            <input type="text" list="condicionOptions" bind:value={filterCondicion} placeholder="Buscar" style="width:90%" />
            <datalist id="condicionOptions">
              {#each Object.values(condiciones) as opcion}
                <option value={opcion}> </option>
              {/each}
            </datalist>
          </th>
          <th>
            <input type="text" list="gravedadOptions" bind:value={filterGravedad} placeholder="Buscar" style="width:90%" />
            <datalist id="gravedadOptions">
              {#each Object.values(gravedad) as opcion}
                <option value={opcion}> </option>
              {/each}
            </datalist>
          </th>
          <th>
            <input type="text" list="tipoOptions" bind:value={filterTipo} placeholder="Buscar" style="width:90%" />
            <datalist id="tipoOptions">
              {#each Object.values(tiposAccidente) as opcion}
                <option value={opcion}> </option>
              {/each}
            </datalist>
          </th>
          <th>
            <input type="text" list="ubicacionOptions" bind:value={filterUbicacion} placeholder="Buscar" style="width:90%" />
            <datalist id="ubicacionOptions">
              {#each Object.values(ubicaciones) as opcion}
                <option value={opcion}> </option>
              {/each}
            </datalist>
          </th>
        </tr>
      </thead>
      <tbody>
        {#each paginatedAccidents as accident (accident.id)}
          <tr in:fade={{ duration: 400 }}>
            <td>{formatDate(accident.fecha)}</td>
            <td>{accident.sexo_victima}</td>
            <td>{accident.edad_victima}</td>
            <td>{condiciones[accident.condicion_victima_id] || accident.condicion_victima_id}</td>
            <td>{gravedad[accident.gravedad_victima_id] || accident.gravedad_victima_id}</td>
            <td>{tiposAccidente[accident.tipo_accidente_id] || accident.tipo_accidente_id}</td>
            <td>{ubicaciones[accident.ubicacion_id] || accident.ubicacion_id}</td>
          </tr>
        {/each}
      </tbody>
    </table>
    <div class="pagination-controls">
      <button on:click={prevPage} disabled={currentPage === 0}>← Anterior</button>
      <span>{currentPage + 1} / {totalPages === 0 ? 1 : totalPages}</span>
      <button on:click={nextPage} disabled={currentPage === totalPages - 1}>Siguiente →</button>
    </div>
  {/if}
</div>
