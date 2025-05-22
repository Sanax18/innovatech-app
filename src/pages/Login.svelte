<script>
  import "../styles/Login.css";
  import axios from "axios";
  import { push } from "svelte-spa-router";

  let email = "",
    password = "";
  let errorCredentials = "";

  $: submit = async () => {
    // Resetea el mensaje de error
    errorCredentials = "";

    // Valida que se hayan llenado ambos campos; si no, muestra alerta y corta la ejecución
    if (!email || !password) {
      errorCredentials = "Por favor, llene todos los campos.";
      return;
    }

    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/auth/login",
        { username: email, password },
        { withCredentials: true }
      );
      if (response.status === 200) {
        axios.defaults.headers.common["Authorization"] =
          `Bearer ${response.data.token}`;
        await push("/home");
        localStorage.setItem("token", response.data.token);
      }
    } catch (error) {
      // Use type guard to safely access error.response
      if (
        typeof error === "object" &&
        error !== null &&
        "response" in error &&
        typeof error.response === "object" &&
        error.response !== null &&
        "status" in error.response &&
        error.response.status === 400
      ) {
        errorCredentials = "Usuario o contraseña incorrectos.";
      } else {
        errorCredentials = "Error al iniciar sesión. Inténtelo de nuevo.";
      }
    }
  };
</script>

<main class="form-signin">
  <form on:submit|preventDefault={submit}>
    <h1 class="h3 mb-3 dw-normal">Innovatech</h1>

    <div class="form-floating">
      <input
        bind:value={email}
        type="email"
        class="form-control"
        placeholder="name@example.com"
      />
      <label for="">Correo electrónico</label>
    </div>

    <div class="form-floating">
      <input
        bind:value={password}
        type="password"
        class="form-control"
        placeholder="Password"
      />
      <label for="">Clave</label>
    </div>

    <button class="w-100 btn btn-lg btn-primary" type="submit">Sign in</button>
    {#if errorCredentials}
      <div class="alert-message">
        <small>{errorCredentials}</small>
      </div>
    {/if}
  </form>
</main>
