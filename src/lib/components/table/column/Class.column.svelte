<script lang="ts">
	import Icon from '$lib/components/Icon.svelte';
	import type { Character } from '$lib/model';

	export let character: Character;
</script>

<Icon src={character.classIconUrl} label={character.classString} />
<Icon src={character.talentSpecIconUrl} label={String(character.talent_spec)} />
<Icon src={character.raceIconUrl} label={String(character.raceString)} />
