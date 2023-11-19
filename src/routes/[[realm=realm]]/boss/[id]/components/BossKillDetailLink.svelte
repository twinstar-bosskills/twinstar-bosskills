<script lang="ts">
	import Link from '$lib/components/Link.svelte';
	import { links } from '$lib/links';
	import { REALM_HELIOS } from '$lib/realm';

	export let realm: string = REALM_HELIOS;
	export let id: string;
</script>

{#if id !== ''}
	<Link href={links.bossKill(realm, id)}>Detail</Link>
{/if}
