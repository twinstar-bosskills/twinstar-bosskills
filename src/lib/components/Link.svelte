<!-- Force all links do page reload -->
<!-- svelte-ignore a11y-missing-attribute -->
<!-- <a data-sveltekit-reload {...$$restProps}><slot /></a> -->
<a data-sveltekit-reload {...$$restProps}><slot /></a>

<style>
	a {
		display: inline-flex;
		align-items: center;
	}
</style>
