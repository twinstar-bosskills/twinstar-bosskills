<script lang="ts">
	import Icon from '$lib/components/Icon.svelte';
	import type { Character } from '$lib/model';

	export let character: Character;
</script>

<!-- TODO: API does not return class -->
<!-- <Icon src={character.classIconUrl} label={character.classString} /> -->
<Icon src={character.talentSpecIconUrl} label={character.talentSpecString} />
