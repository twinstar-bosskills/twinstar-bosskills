<script lang="ts">
	import { characterHps } from '$lib/metrics';
	import type { Character } from '$lib/model';
	import { formatNumber } from '$lib/number';
	export let character: Character;
	export let fightLength: number | undefined = undefined;
</script>

{formatNumber(characterHps(character, fightLength))}
