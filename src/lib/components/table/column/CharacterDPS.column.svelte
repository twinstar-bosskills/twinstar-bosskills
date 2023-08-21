<script lang="ts">
	import { characterDps } from '$lib/metrics';
	import type { Character } from '$lib/model';
	import { formatNumber } from '$lib/number';
	export let character: Character;
	export let fightLength: number | undefined = undefined;
</script>

{formatNumber(characterDps(character, fightLength))}
