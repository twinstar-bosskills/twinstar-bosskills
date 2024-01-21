<script lang="ts">
	import Link from '$lib/components/Link.svelte';
	import LinkExternal from '$lib/components/LinkExternal.svelte';
	import CharacterPerformanceChart from '$lib/components/echart/CharacterPerformanceChart.svelte';
	import { links } from '$lib/links';
	import { difficultyToString } from '$lib/model';
	import { realmToExpansion } from '$lib/realm';
	import type { PageData } from './$types';

	export let data: PageData;
	const realm = data.realm;
	const expansion = realmToExpansion(data.realm);
	const name = data.character.name;
	const performanceLines = Object.entries(data.performanceLines);
</script>

<svelte:head>
	<title>{name}'s performance over time</title>
</svelte:head>

<div class="title">
	<h1>
		{name}'s performance over time
	</h1>
	<div>
		<Link href={links.character(realm, name)}>Recent kills</Link>
	</div>
	<div>
		<LinkExternal href={links.twinstarArmory(realm, name)}>Armory</LinkExternal>
	</div>
</div>
{#if performanceLines.length === 0}
	No performance records found yet
{:else}
	{#each performanceLines as [bossId, byMode]}
		{#each Object.entries(byMode) as [mode, line]}
			{#if line.length > 1}
				{@const name = line[0]?.bossName ?? bossId}
				{@const diff = difficultyToString(expansion, mode)}
				<div>
					<h3>Performance on {name} {diff}</h3>
					<CharacterPerformanceChart data={line} />
				</div>
			{/if}
		{/each}
	{/each}
{/if}

<style>
	.title {
		margin: 1rem 0;
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		column-gap: 1rem;
		row-gap: 0.5rem;
	}
	.title h1 {
		margin: 0;
	}
</style>
