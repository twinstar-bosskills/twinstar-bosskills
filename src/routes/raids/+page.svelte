<script lang="ts">
	import Link from '../../components/Link.svelte';
	import type { PageData } from './$types';

	export let data: PageData;
</script>

<h1>Raids</h1>
<ul class="raids">
	{#each data.raids as raid}
		<li>
			<div>{raid.map}</div>
			<div class="bosses">
				<ul>
					{#each raid.bosses as boss}
						<li>
							<Link href="/boss/{boss.entry}">{boss.name}</Link>
						</li>
					{/each}
				</ul>
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
