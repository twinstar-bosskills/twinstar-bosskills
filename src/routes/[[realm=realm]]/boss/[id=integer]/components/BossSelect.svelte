<script lang="ts">
	import Link from '$lib/components/Link.svelte';
	import { links } from '$lib/links';
	import type { Boss } from '$lib/model/boss.model';

	export let realm: string;
	export let boss: Boss;
	export let bosses: Boss[];
	export let linkTo: 'detail' | 'history' = 'detail';
	export let spec: number | undefined = undefined;
	export let difficulty: number | undefined = undefined;
	export let raidlock: number | undefined = undefined;
</script>

<div class="bosses">
	{#each bosses as b}
		<Link
			href={linkTo === 'history'
				? links.bossHistory(realm, b.remoteId, { spec, difficulty, raidlock })
				: links.boss(realm, b.remoteId, { spec, difficulty, raidlock })}
			active={b.id === boss.id}
			style="text-decoration: none; padding: 0.5rem 0;"
		>
			<span class="boss-name">
				{b.name}
			</span>
		</Link>
	{/each}
</div>

<style>
	.bosses {
		display: flex;
		gap: 0.5rem;
		overflow: auto;
	}
	.boss-name {
		white-space: nowrap;
	}
</style>
