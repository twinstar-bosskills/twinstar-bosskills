<script lang="ts">
	import { characterDps } from '$lib/metrics';
	import type { Character } from '$lib/model';
	import { formatNumber } from '$lib/number';
	export let character: Character;
</script>

{formatNumber(characterDps(character))}
