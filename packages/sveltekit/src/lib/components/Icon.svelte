<script lang="ts">
	export let src: string;
	export let label: string;
	export let alt: string = `${label} icon`;
</script>

<img {src} aria-label={label} title={label} {alt} />

<style>
	img {
		width: 1.5rem;
		height: 1.5rem;
	}
</style>
