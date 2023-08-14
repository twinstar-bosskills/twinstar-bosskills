<script lang="ts">
	import { quality } from '$lib/css-vars';
	import { formatLocalized, formatSecondsInterval } from '$lib/date';
	import type { Item } from '$lib/model';
	import { formatNumber } from '$lib/number';

	import type { PageData } from './$types';

	export let data: PageData;

	let showTooltipById: Record<Item['id'], boolean> = {};
	function showTooltip(id: number) {
		showTooltipById[id] = true;
	}
	function hideTooltip(id: number) {
		showTooltipById[id] = false;
	}

	function vps(value: number | string, seconds: number): string {
		const v = Number(value);
		if (isNaN(v) === false && isFinite(v)) {
			return formatNumber(seconds > 0 ? Math.round((1000 * v) / seconds) : 0);
		}
		return '0';
	}
</script>

<h1>Boss Kill {data.bosskill.id}</h1>
<div class="grid">
	<div>
		<dl>
			<dt>Boss</dt>
			<dd>
				<a href="https://mop-twinhead.twinstar.cz/?npc={data.bosskill.entry}">
					{data.bosskill.entry}
				</a>
			</dd>

			<dt>Raid</dt>
			<dd>{data.bosskill.map}</dd>

			<dt>Guild</dt>
			<dd>
				<a
					href="https://mop-twinhead.twinstar.cz/?guild={encodeURIComponent(
						data.bosskill.guild
					)}&realm={data.bosskill.realm}"
				>
					{data.bosskill.guild}
				</a>
			</dd>

			<dt>Realm</dt>
			<dd>{data.bosskill.realm}</dd>

			<dt>Killed at</dt>

			<dd>{formatLocalized(data.bosskill.time)}</dd>

			<dt>Wipes</dt>
			<dd>{data.bosskill.wipes}</dd>

			<dt>Deaths</dt>
			<dd>{data.bosskill.deaths}</dd>

			<dt>Fight Length</dt>
			<dd>{formatSecondsInterval(data.bosskill.length)}</dd>

			<dt>Ressurects</dt>
			<dd>{data.bosskill.ressUsed}</dd>
		</dl>
	</div>

	<div>
		<h2>Boss Loot</h2>
		<div role="table">
			{#each data.items as item}
				<div
					tabindex="0"
					role="row"
					class="item"
					style="border: 2px solid var({quality(item.quality)})"
					on:mouseover={() => showTooltip(item.id)}
					on:focus={() => showTooltip(item.id)}
					on:mouseout={() => hideTooltip(item.id)}
					on:blur={() => hideTooltip(item.id)}
				>
					<img src={item.iconUrl} alt="Icon of {item.name}" width="36" height="36" />
					{item.name}
				</div>

				{@const tooltip = data.tooltips[item.id]}
				{#if tooltip && showTooltipById[item.id]}
					<div class="tooltip" style="border: 2px solid var({quality(item.quality)})">
						<!-- TODO(security): iframe this -->
						<!-- https://stackoverflow.com/questions/9975810/make-iframe-automatically-adjust-height-according-to-the-contents-without-using -->
						{@html tooltip.tooltip}
					</div>
				{/if}
			{/each}
		</div>
	</div>
</div>

<h2>Fight timeline</h2>
<div>TODO</div>

<h2>Stats</h2>
<div>
	<table>
		<thead>
			<tr>
				<th>Name</th>
				<th>Class</th>
				<th>DPS</th>
				<th>Dmg Done</th>
				<th>Dmg Taken</th>
				<th>Dmg Absorb</th>
				<th>HPS</th>
				<th>Healing Done</th>
				<th>Absorb Done</th>
				<th>Overheal</th>
				<th>Heal Taken</th>
				<th>I</th>
				<th>D</th>
				<th>Avg iLvl</th>
			</tr>
		</thead>
		<tbody>
			{#each data.bosskill.boss_kills_players as player}
				<tr class="player">
					<td>{player.name}</td>
					<td>
						<img
							class="icon"
							src={player.classIconUrl}
							title={player.classString}
							alt="Icon for class {player.classString}"
						/>
						<img
							class="icon"
							src={player.talentSpecIconUrl}
							title={`Talent spec ${player.talent_spec}`}
							alt="Icon for talent spec {player.talent_spec}"
						/>
						<img
							class="icon"
							src={player.raceIconUrl}
							title={player.raceString}
							alt="Icon for race {player.raceString}"
						/>
					</td>
					<td>{vps(player.dmgDone, data.bosskill.length)}</td>
					<td>{formatNumber(player.dmgDone)}</td>
					<td>{formatNumber(player.dmgTaken)}</td>
					<td>{formatNumber(player.dmgAbsorbed)}</td>
					<td>{vps(player.healingDone, data.bosskill.length)}</td>
					<td>{formatNumber(player.healingDone)}</td>
					<td>{formatNumber(player.absorbDone)}</td>
					<td>{formatNumber(player.overhealingDone)}</td>
					<td>{formatNumber(player.healingTaken)}</td>
					<td>{player.interrupts}</td>
					<td>{player.dispels}</td>
					<td>{player.avg_item_lvl}</td>
				</tr>
			{/each}
		</tbody>
	</table>
</div>

<style>
	.grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		column-gap: 1rem;
	}
	.item {
		display: flex;
		align-items: center;
	}
	.item img {
		width: 36px;
		height: 36px;
	}
	.tooltip {
		position: absolute;
		background: white;
	}

	.player td img {
		width: 24px;
		height: 24px;
	}
</style>
