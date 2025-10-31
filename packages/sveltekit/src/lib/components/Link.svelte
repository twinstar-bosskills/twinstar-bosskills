<script lang="ts">
	export let active: boolean = false;
</script>

<!-- Force all links do page reload -->
<!-- svelte-ignore a11y-missing-attribute -->
<!-- <a data-sveltekit-reload {...$$restProps}><slot /></a> -->
<a class:active data-sveltekit-reload {...$$restProps}><slot /></a>

<style>
	a {
		display: inline-flex;
		align-items: center;
	}
	a.active {
		text-decoration: underline !important;
	}
</style>
