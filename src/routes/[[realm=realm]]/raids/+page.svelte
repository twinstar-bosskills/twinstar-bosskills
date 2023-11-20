<script lang="ts">
	import Link from '$lib/components/Link.svelte';
	import TextColorSuccess from '$lib/components/TextColorSuccess.svelte';
	import { links } from '$lib/links';
	import { difficultyToString } from '$lib/model';
	import { getRaidIconUrl } from '$lib/raid';
	import { realmToExpansion } from '$lib/realm';
	import type { PageData } from './$types';

	export let data: PageData;
	const expansion = realmToExpansion(data.realm);
</script>

<svelte:head>
	<title>Raids</title>
</svelte:head>
<h1>Raids</h1>
<ul class="raids">
	{#each data.raids as raid}
		{@const byDifficulty = Object.entries(data.bosskillsByRaidByDifficulty[raid.map] ?? {})}
		<li class="raid">
			<div class="bg" style="--background-image: url({getRaidIconUrl(raid.map)})">
				<div class="kills-count" title="Number of killed bosses during current raid lock">
					<TextColorSuccess>
						{data.bosskillsByRaid[raid.map] ?? 0}
					</TextColorSuccess>
					kills this raid lock
					<div style="border-top: 1px solid rgba(var(--color-primary), 1); padding-top: 0.25rem;">
						<ul>
							{#each byDifficulty as [diff, total]}
								<li>
									{difficultyToString(expansion, diff)}
									<TextColorSuccess>{total}</TextColorSuccess> times
								</li>
							{/each}
						</ul>
					</div>
				</div>
			</div>
			<div class="content">
				<h2>{raid.map}</h2>
				<div class="bosses">
					<ol>
						{#each raid.bosses as boss}
							{@const byDifficulty = Object.entries(
								data.bosskillsByBossByDifficulty[boss.entry] ?? {}
							)}
							<li style="list-style-type: decimal; margin-top: 0.25rem;">
								<Link href={links.boss(data.realm, boss.entry)} style="font-size: 1.25rem"
									>{boss.name}</Link
								>
								<span title="Number of kills during current raid lock">
									<TextColorSuccess>
										{data.bosskillsByBoss[boss.entry] ?? 0}
									</TextColorSuccess>
									kills
								</span>
								<div class="diff-distrib-list">
									{#each byDifficulty as [diff, total]}
										<div class="diff-distrib-item">
											{difficultyToString(expansion, diff)}:
											<TextColorSuccess>{total}</TextColorSuccess>
										</div>
									{/each}
								</div>
							</li>
						{/each}
					</ol>
				</div>
			</div>
		</li>
	{/each}
</ul>

<style>
	.raids {
		display: flex;
		flex-wrap: wrap;
		gap: 1rem;
	}
	.raid {
		margin-top: 0.5rem;
		border: 2px solid var(--color-secondary);
	}
	.raid h2 {
		margin: 0;
	}
	.bg {
		position: relative;
		min-width: 360px;
		width: 100%;
		height: 180px;
		background-size: cover;
		background-image: var(--background-image);
		background-repeat: no-repeat;
	}
	.bg .kills-count {
		position: absolute;
		bottom: 0.5rem;
		right: 1rem;
		padding: 0.5rem 1rem;
		background-color: rgba(var(--color-bg), 0.5);
	}
	.content {
		padding: 1rem;
	}
	.bosses {
		margin-left: 1rem;
		margin-top: 0.5rem;
	}
	.diff-distrib-list {
		margin-top: 0.25rem;
	}
	.diff-distrib-item {
		display: inline-block;
		margin-left: calc(1rem / 8);
		margin-right: calc(1rem / 8);
		padding: calc(1rem / 4);
		border: 1px solid rgba(var(--color-primary), 0.5);
	}
	@media (max-width: 380px) {
		.bg {
			width: auto;
			height: 120px;
		}
		.raid {
			flex-grow: 1;
		}
	}
</style>
