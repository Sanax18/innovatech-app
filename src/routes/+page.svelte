<script>
	import Login from "../pages/Login.svelte";
	import Register from "../pages/Register.svelte";
	import Home from "../pages/Home.svelte";
	import Router, { link } from "svelte-spa-router";
  import { onMount } from 'svelte';
  import '../styles/App.css'; // Importa el archivo CSS global que creaste/modificaste

	const routes = {
		"/": Login,
		"/login": Login,
		"/register": Register,
		"/home": Home,
	};

  let isDarkMode = false;
  let showButton = false; // Para evitar FOUC del botón

  function toggleDarkMode() {
    isDarkMode = !isDarkMode;
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }

  onMount(() => {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (savedTheme === 'dark') {
      isDarkMode = true;
      document.documentElement.classList.add('dark');
    } else if (savedTheme === 'light') {
      isDarkMode = false;
      document.documentElement.classList.remove('dark');
    } else if (prefersDark) { // Si no hay tema guardado, usa la preferencia del sistema
      isDarkMode = true;
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark'); // Guarda la preferencia del sistema detectada
    } else {
      // Por defecto, o si el sistema prefiere claro y no hay nada guardado
      isDarkMode = false;
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
    showButton = true; // Muestra el botón después de determinar el tema inicial
  });
</script>

{#if showButton}
  <div class="theme-toggle-container" class:visible={showButton}>
    <button class="theme-toggle-button" on:click={toggleDarkMode} title="Cambiar tema">
      {isDarkMode ? '☀️ Modo Claro' : '🌙 Modo Oscuro'}
    </button>
  </div>
{/if}

<slot />

<Router { routes } />