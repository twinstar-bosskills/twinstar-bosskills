<script lang="ts">
	import { REALMS_LOWER_CASE, REALM_HELIOS, realmIsPublic, realmMergedTo } from '$lib/realm';
	import Link from './Link.svelte';

	export let realm: string = REALM_HELIOS;
	const realms = Object.entries(REALMS_LOWER_CASE).filter(
		([name]) => realmIsPublic(name) && typeof realmMergedTo(name) === 'undefined'
	);
</script>

<div class="realms">
	{#each realms as [name, label]}
		<div class="realm" class:active={realm.toLowerCase() === name}>
			<Link href="/{label}">
				<img src="/logos/32x32/{name}.png" width="32" height="32" alt="Realm {label} icon" />
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
