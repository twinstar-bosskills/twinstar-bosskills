<script lang="ts">
	import Icon from '$lib/components/Icon.svelte';
	import type { Character } from '$lib/model';

	export let character: Character;
</script>

<Icon src={character.classIconUrl} label={character.classString} />
<Icon src={character.talentSpecIconUrl} label={character.talentSpecString} />
<Icon src={character.raceIconUrl} label={character.raceString} />
