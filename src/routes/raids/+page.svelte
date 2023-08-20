<script lang="ts">
	import Link from '$lib/components/Link.svelte';
	import { links } from '$lib/links';
	import type { PageData } from './$types';

	export let data: PageData;
</script>

<h1>Raids</h1>
<ul class="raids">
	{#each data.raids as raid}
		<li>
			<div>{raid.map}</div>
			<div class="bosses">
				<ol>
					{#each raid.bosses as boss, i}
						<li>
							{`${i + 1}. `}<Link href={links.boss(boss.entry)}>{boss.name}</Link>
						</li>
					{/each}
				</ol>
			</div>
		</li>
	{/each}
</ul>

<style>
	.raids {
		display: grid;
		grid-template-columns: repeat(3, max-content);
		column-gap: 1rem;
	}
	.bosses {
		margin-left: 1rem;
	}
</style>
