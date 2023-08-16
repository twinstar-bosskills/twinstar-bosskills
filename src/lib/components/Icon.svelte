<script lang="ts">
	export let src: string;
	export let label: string;
	export let alt: string = `${label} icon`;
</script>

<img {...$$restProps} {src} aria-label={label} title={label} {alt} />

<style>
	img {
		width: 24px;
		height: 24px;
	}
</style>
