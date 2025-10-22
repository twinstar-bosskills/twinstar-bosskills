<script lang="ts">
	import Icon from '$lib/components/Icon.svelte';
	import Link from '$lib/components/Link.svelte';
	import { talentSpecToString } from '$lib/model';
	import { realmToExpansion } from '$lib/realm';
	import type { BosskillCharacter } from '$lib/server/api/schema';
	import { getTalentSpecIconUrl } from '$lib/talent';

	export let realm: string;
	export let character: BosskillCharacter;
	export let talentSpecHref: string | undefined = undefined;

	$: talentSpecIconUrl = getTalentSpecIconUrl(realm, character.talent_spec);
	$: talentSpecString = talentSpecToString(realmToExpansion(realm), character.talent_spec);
</script>

<Icon src={character.classIconUrl} label={character.classString} />
{#if talentSpecHref}
	<Link href={talentSpecHref}>
		<Icon src={talentSpecIconUrl} label={talentSpecString} />
	</Link>
{:else}
	<Icon src={talentSpecIconUrl} label={talentSpecString} />
{/if}
<Icon src={character.raceIconUrl} label={character.raceString} />
