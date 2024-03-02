<script lang="ts" context="module">
	type OptionBaseValue = string | number;
	export type Option<TValue extends OptionBaseValue = OptionBaseValue> = {
		label: string;
		value: TValue;
		selected?: boolean;
		disabled?: boolean;
	};
	export type Options<TValue extends OptionBaseValue = OptionBaseValue> = Option<TValue>[];
	export type Data = {
		raids: Raid[];
		specs?: number[];
		ilvl?: boolean;
	};
	export type Values = {
		bosses: number[];
		raids: string[];
		difficulties: number[];
		specs?: number[];
		ilvlMin?: number;
		ilvlMax?: number;
	};
</script>

<script lang="ts">
	import { links } from '$lib/links';

	import {
		difficultiesByExpansion,
		difficultyToString,
		isRaidDifficulty,
		talentSpecToString
	} from '$lib/model';
	import { REALM_HELIOS, realmToExpansion } from '$lib/realm';
	import type { Raid } from '$lib/server/api/schema';
	import Link from '../Link.svelte';
	import SpecIcon from '../icon/SpecIcon.svelte';

	export let action: string | undefined = undefined;
	export let realm: string = REALM_HELIOS;
	export let data: Data;
	export let values: Values;

	$: formAction = action ?? links.bossKills(realm);

	const expansion = realmToExpansion(realm);
	const diffByExp = Object.values(difficultiesByExpansion(expansion) ?? {});

	const bossByRaid: Record<string, Data['raids'][0]['bosses']> = {};
	const raids: Options = [];
	const bosses: Options = [];

	for (const raid of data.raids) {
		raids.push({
			label: raid.map,
			value: raid.map,
			selected: values.raids.includes(raid.map)
		});
		for (const boss of raid.bosses) {
			bossByRaid[raid.map] ??= [];
			bossByRaid[raid.map]!.push(boss);
			bosses.push({
				label: boss.name,
				value: boss.entry,
				selected: values.bosses.includes(boss.entry)
			});
		}
	}

	const difficulties: Options<number> = diffByExp
		.filter((diff) => isRaidDifficulty(expansion, diff))
		.map((diff) => ({
			label: difficultyToString(expansion, diff),
			value: diff,
			selected: values.difficulties.includes(diff)
		}));

	const specs: Options<number> =
		data.specs?.map((spec) => ({
			label: talentSpecToString(expansion, spec),
			value: spec,
			selected: values.specs?.includes(spec)
		})) ?? [];
</script>

<form data-sveltekit-reload method="GET" action={formAction}>
	<div class="group">
		<div class="item-container">
			<div class="headline">Boss</div>
			<div class="item">
				{#each bosses as boss}
					<label for="boss_{boss.value}" class="item-group" class:disabled={boss.disabled}>
						<input
							type="checkbox"
							id="boss_{boss.value}"
							name="boss"
							value={boss.value}
							checked={boss.selected}
							disabled={boss.disabled}
						/>
						<div>{boss.label}</div>
					</label>
				{/each}
			</div>
		</div>

		<div class="item-container">
			<div class="headline">Raid</div>
			<div class="item">
				{#each raids as raid}
					<label for="raid_{raid.value}" class="item-group" class:disabled={raid.disabled}>
						<input
							type="checkbox"
							id="raid_{raid.value}"
							name="raid"
							value={raid.value}
							checked={raid.selected}
							disabled={raid.disabled}
						/>
						<div>{raid.label}</div>
					</label>
				{/each}
			</div>
		</div>

		<div class="item-container">
			<div class="headline">Difficulty</div>
			<div class="item difficulty">
				{#each difficulties as diff}
					<label for="diff_{diff.value}" class="item-group">
						<input
							type="checkbox"
							id="diff_{diff.value}"
							name="difficulty"
							value={diff.value}
							checked={diff.selected}
							disabled={diff.disabled}
						/>
						<div>{diff.label}</div>
					</label>
				{/each}
			</div>
		</div>

		{#if specs.length}
			<div class="item-container">
				<div class="headline">Spec</div>
				<div class="item spec">
					{#each specs as spec}
						<label for="spec_{spec.value}" class="item-group">
							<input
								type="checkbox"
								id="spec_{spec.value}"
								name="spec"
								value={spec.value}
								checked={spec.selected}
								disabled={spec.disabled}
							/>
							<div>
								<SpecIcon {realm} talentSpec={spec.value} />
							</div>
						</label>
					{/each}
				</div>
			</div>
		{/if}
		{#if data.ilvl}
			<div class="item-container">
				<div class="headline">Ilvl</div>
				<div class="item">
					<label for="ilvl_min" class="item-group">
						<input
							type="number"
							min="0"
							max="600"
							id="ilvl_min"
							name="ilvl_min"
							value={values.ilvlMin ?? ''}
						/>
						Min
					</label>
					<label for="ilvl_max" class="item-group">
						<input
							type="number"
							min="0"
							max="600"
							id="ilvl_max"
							name="ilvl_max"
							value={values.ilvlMax ?? ''}
						/>
						Max
					</label>
				</div>
			</div>
		{/if}
	</div>
	<div style="background: rgba(var(--color-primary), 0.5); height: 2px; width: 100%;" />
	<div class="group">
		<button type="submit">Submit</button>
		<Link href={formAction}>Reset</Link>
	</div>
</form>

<style>
	form {
		display: flex;
		flex-direction: column;
		row-gap: 0.25rem;
	}
	.group {
		display: flex;
		flex-wrap: wrap;
		gap: 1rem;
	}
	.item {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
		max-height: 200px;
		overflow-y: auto;
		/* border: 2px solid rgba(var(--color-primary), 0.5); */
	}
	.item.difficulty,
	.item.spec {
		display: grid;
		grid-template-columns: max-content max-content;
	}
	.item-group {
		border: 1px solid rgba(var(--color-primary), 0.5);
		display: flex;
		align-items: center;
	}
	.item-container {
		display: flex;
		flex-direction: column;
		row-gap: 0.25rem;
	}
	label {
		display: flex;
		align-items: center;
		padding: 0.5rem 0.25rem;
	}
	.headline {
		font-weight: bold;

		padding-left: 0.25rem;
		border-left: 1px solid rgba(var(--color-primary), 0.75);
		border-bottom: 1px solid rgba(var(--color-primary), 0.75);
	}
	button {
		background: transparent;
		border: 1px solid rgba(var(--color-primary), 1);
		color: rgba(var(--color-primary), 1);
		padding: 0.25rem 0.5rem;
	}
</style>
