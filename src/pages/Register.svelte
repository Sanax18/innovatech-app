<script>
    import '../styles/Register.css';
    import axios from 'axios';
    import { push } from 'svelte-spa-router';

    let name = '', surname = '', email = '', password = '';
    
    const submit = async () => {
        const response = await axios.post('register', {
            name,
            surname,
            email,
            password
        });

        await push('/login');
    }
</script>

<main class="form-signin">
    <form on:submit|preventDefault={submit}>
        <h1 class="h3 mb-3 fw-normal">Registro de Usuarios</h1>

        <div class="form-floating">
            <label for="">Nombre(s)</label>
            <input bind:value={name} class="form-control" placeholder="Name">
        </div>

        <div class="form-floating">
            <label for="">Apellido(s)</label>
            <input bind:value={surname} class="form-control" placeholder="Surname">
        </div>

        <div class="form-floating">
            <label for="">Correo</label>
            <input bind:value={email} type="email" class="form-control" placeholder="name@example.com">
        </div>

        <div class="form-floating">
            <label for="">Clave</label>
            <input bind:value={password} type="password" class="form-control" placeholder="Password">
        </div>

        <button class="w-100 btn btn-lg btn-primary" type="submit">Registrar</button>
    </form>
</main>