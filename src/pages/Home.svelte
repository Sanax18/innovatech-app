<script lang="ts">
    import '../styles/Home.css';
    import Dashboard from './Dashboard.svelte';
    import Detection from './Detection.svelte';
    import Forecast from './Forecast.svelte';
    import History from './History.svelte';
    import Register from './Register.svelte';
    import User from './User.svelte';

    let activeView = 'dashboard';
    let sidebarExpanded = false;
    let darkMode = false;

    function changeView(view: string) {
        activeView = view;
    }

    // function toggleDarkMode() {
    //     darkMode = !darkMode;
    //     if (darkMode) {
    //         document.body.classList.add("dark-mode");
    //     } else {
    //         document.body.classList.remove("dark-mode");
    //     }
    // }

    function logout() {
        // Aquí implementa la lógica de logout, por ejemplo, limpiar tokens, redirigir a login, etc.
        console.log("Logout");
    }
</script>

<div class="container-sidebar">
  <aside class="sidebar-home {sidebarExpanded ? 'expanded' : 'collapsed'}"
    on:mouseenter={() => sidebarExpanded = true}
    on:mouseleave={() => sidebarExpanded = false}>
    <button on:click={() => changeView('dashboard')} class:active={activeView==='dashboard'}>
      <span class="icon">📊</span>
      {#if sidebarExpanded}
        <span class="label">Dashboard</span>
      {/if}
    </button>
    <button on:click={() => changeView('detection')} class:active={activeView==='detection'}>
      <span class="icon">🔍</span>
      {#if sidebarExpanded}
        <span class="label">Detección</span>
      {/if}
    </button>
    <button on:click={() => changeView('forecast')} class:active={activeView==='forecast'}>
      <span class="icon">☀️</span>
      {#if sidebarExpanded}
        <span class="label">Clima</span>
      {/if}
    </button>
    <button on:click={() => changeView('history')} class:active={activeView==='history'}>
      <span class="icon">📜</span>
      {#if sidebarExpanded}
        <span class="label">Historial</span>
      {/if}
    </button>
    <button on:click={() => changeView('register')} class:active={activeView==='register'}>
      <span class="icon">📝</span>
      {#if sidebarExpanded}
        <span class="label">Registro</span>
      {/if}
    </button>
    <button on:click={() => changeView('user')} class:active={activeView==='user'}>
      <span class="icon">👤</span>
      {#if sidebarExpanded}
        <span class="label">Usuario</span>
      {/if}
    </button>

    <!-- Sección inferior de la sidebar -->
    <!-- <div class="sidebar-footer">
      <button on:click={toggleDarkMode} class="dark-mode-toggle">
        <span class="icon">{darkMode ? "☀️" : "🌙"}</span>
        {#if sidebarExpanded}
          <span class="label">{darkMode ? "Claro" : "Oscuro"}</span>
        {/if}
      </button>
      <button on:click={logout} class="logout-btn">
        <span class="icon">🔓</span>
        {#if sidebarExpanded}
          <span class="label">Logout</span>
        {/if}
      </button>
    </div> -->
  </aside>

  <section class="content-sidebar">
    {#if activeView === 'dashboard'}
        <Dashboard />
    {:else if activeView === 'detection'}
        <Detection />
    {:else if activeView === 'forecast'}
        <Forecast />
    {:else if activeView === 'history'}
        <History />
    {:else if activeView === 'register'}
        <Register />
    {:else if activeView === 'user'}
        <User />
        <p>Contenido del usuario.</p>
    {/if}
  </section>
</div>