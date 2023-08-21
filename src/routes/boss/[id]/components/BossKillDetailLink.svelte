<script lang="ts">
	import Link from '$lib/components/Link.svelte';
	import { links } from '$lib/links';

	export let id: string;
</script>

{#if id !== ''}
	<Link href={links.bossKill(id)}>Detail</Link>
{/if}
