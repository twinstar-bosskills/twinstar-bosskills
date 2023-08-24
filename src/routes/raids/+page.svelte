<script lang="ts">
	import Link from '$lib/components/Link.svelte';
	import { links } from '$lib/links';
	import type { PageData } from './$types';

	export let data: PageData;
</script>

<svelte:head>
	<title>Raids</title>
</svelte:head>
<h1>Raids</h1>
<ul class="raids">
	{#each data.raids as raid}
		<li class="raid">
			<h2>{raid.map}</h2>
			<div class="bosses">
				<ol>
					{#each raid.bosses as boss, i}
						<li style="list-style-type: decimal;">
							<Link href={links.boss(boss.entry)}>{boss.name}</Link>
						</li>
					{/each}
				</ol>
			</div>
		</li>
	{/each}
</ul>

<style>
	.raids {
		display: flex;
		flex-wrap: wrap;
	}
	.raid {
		margin-left: 1rem;
		margin-top: 0.5rem;
	}
	.raid h2 {
		margin: 0;
	}
	.bosses {
		margin-left: 1rem;
		margin-top: 0.5rem;
	}
</style>
