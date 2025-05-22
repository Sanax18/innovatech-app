<script>
  // Asegúrate de definir o importar tus utilidades
  import { scale } from '../actions/utils.js';
  import { poll } from '../actions/data.js';
  import { onDestroy } from 'svelte';

  // Importa el dashboard de Power BI
  let powerbiLink = "https://app.powerbi.com/reportEmbed?reportId=fbd18a43-df60-4b59-890c-85e2f46a7596&autoAuth=true&ctid=740be6bd-fd36-470e-94d9-0f0c777fadb9";

  // Inicializa los datos según tu lógica (aquí se asume que poll() retorna un array de números)
  let data = poll();
  
  // Define dimensiones para el gráfico; podrías usar variables reactivas o constantes
  let w = 800, h = 400;
  
  // Calcula los valores mínimos y máximos, agregando márgenes
  $: min = Math.min(...data) - 5;
  $: max = Math.max(...data) + 5;
  
  // Escalas para mapear los datos a coordenadas
  $: x = scale([0, data.length], [0, w]);
  $: y = scale([min, max], [h, 0]);
  
  // Calcula ticks para el eje Y
  $: ticks = (() => {
    const result = [];
    let n = 10 * Math.ceil(min / 10);
    while (n < max) {
      result.push(n);
      n += 10;
    }
    return result;
  })();
  
  // Actualiza los datos cada 200 ms (puedes ajustar el intervalo o la función poll)
  const interval = setInterval(() => {
    data = poll();
  }, 200);

  // Limpieza del intervalo cuando se destruya el componente
  onDestroy(() => {
    clearInterval(interval);
  });
</script>

<!-- Estadísticas extraídas desde la API -->

<!-- <div class="outer">
  <svg width={w} height={h}> -->
    <!-- Línea de base en el eje X -->
    <!-- <line x1="0" y1={h} x2={w} y2={h} stroke="#aaa" /> -->
    
    <!-- Dibujar ticks en el eje Y -->
    <!-- {#each ticks as tick}
      <g class="tick" transform="translate(0, {y(tick)})">
        <line x1="0" y1="0" x2={w} y2="0" stroke="#aaa" stroke-dasharray="2 2" />
        <text x="-5" y="0" text-anchor="end" dominant-baseline="middle" fill="#555">{tick}</text>
      </g>
    {/each} -->
    
    <!-- Dibujo de la línea con los datos -->
    <!-- <polyline
      fill="none"
      stroke="#ff3e00"
      stroke-width="2"
      stroke-linejoin="round"
      stroke-linecap="round"
      points={data.map((d, i) => `${x(i)},${y(d)}`).join(' ')}
    /> -->
    
    <!-- Texto de título del gráfico -->
    <!-- <text x="10" y="30" font-size="24" fill="#333">$SVLT</text>
  </svg>
</div> -->

<div class="dashboard-container">
  <iframe title="Power BI Dashboard"
    src={powerbiLink}
    width="100%" 
    height="800px" 
    frameborder="0" 
    allowFullScreen="true">
  </iframe>
</div>