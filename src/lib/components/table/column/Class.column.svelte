<script lang="ts">
	import Icon from '$lib/components/Icon.svelte';
	import { talentSpecToString } from '$lib/model';
	import { realmToExpansion } from '$lib/realm';
	import type { BosskillCharacter } from '$lib/server/api/schema';
	import { getTalentSpecIconUrl } from '$lib/talent';

	export let realm: string;
	export let character: BosskillCharacter;

	$: talentSpecIconUrl = getTalentSpecIconUrl(realm, character.talent_spec);
	$: talentSpecString = talentSpecToString(realmToExpansion(realm), character.talent_spec);
</script>

<Icon src={character.classIconUrl} label={character.classString} />
<Icon src={talentSpecIconUrl} label={talentSpecString} />
<Icon src={character.raceIconUrl} label={character.raceString} />
