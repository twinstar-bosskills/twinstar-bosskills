<script lang="ts">
	import Icon from '$lib/components/Icon.svelte';
	import Link from '$lib/components/Link.svelte';
	import { talentSpecToString } from '@twinstar-bosskills/core/dist/wow';
	import { expansionIsVanilla, realmToExpansion } from '@twinstar-bosskills/core/dist/realm';
	import type { BosskillCharacter } from '@twinstar-bosskills/api/dist/schema';
	import { getTalentSpecIconUrl } from '@twinstar-bosskills/api/dist/talent';

	export let realm: string;
	export let expansion: number;
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
{:else if expansionIsVanilla(expansion) === false}
	<Icon src={talentSpecIconUrl} label={talentSpecString} />
{/if}
<Icon src={character.raceIconUrl} label={character.raceString} />
