<script lang="ts">
	import { REALMS_LOWECASE, REALM_HELIOS } from '$lib/realm';
	import Link from './Link.svelte';

	export let realm: string = REALM_HELIOS;
	const realms = Object.entries(REALMS_LOWECASE);
</script>

<div class="realms">
	{#each realms as [key]}
		<div class="realm" class:active={realm.toLowerCase() === key}>
			<Link href="/{key}">
				<img src="/logos/{key}.png" width="32" height="32" alt="Realm {key} icon" />
			</Link>
		</div>
	{/each}
</div>

<style>
	.realms {
		display: flex;
		flex-wrap: nowrap;
	}
	.realm {
		display: inline-flex;
		align-items: center;
	}
	.realm.active {
		border: 2px solid rgba(var(--color-primary), 1);
	}
</style>
