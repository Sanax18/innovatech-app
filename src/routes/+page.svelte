<script>
	import Login from "../pages/Login.svelte";
	import Register from "../pages/Register.svelte";
	import Home from "../pages/Home.svelte";
	import Router, { link } from "svelte-spa-router";

	const routes = {
		"/": Login,
		"/login": Login,
		"/register": Register,
		"/home": Home,
	};
</script>

<Router { routes } />