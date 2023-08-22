<script lang="ts">
	import external from '$lib/assets/icons/external-link.svg?raw';
	import Link from './Link.svelte';
</script>

<Link {...$$restProps} rel="external" ref="noopener" target="_blank">
	<slot />
	<div class="icon">{@html external}</div>
</Link>

<style>
	.icon {
		display: inline-block;
		width: 1rem;
		height: 1rem;
		margin-left: 0.125rem;
	}
</style>
