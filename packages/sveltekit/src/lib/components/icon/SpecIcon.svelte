<script lang="ts">
	import Icon from '$lib/components/Icon.svelte';
	import { talentSpecToString } from '@twinstar-bosskills/core/dist/wow';
	import { realmToExpansion } from '@twinstar-bosskills/core/dist/realm';
	import { getTalentSpecIconUrl } from '@twinstar-bosskills/api/dist/talent';

	export let realm: string;
	export let talentSpec: number;

	$: talentSpecIconUrl = getTalentSpecIconUrl(realm, talentSpec);
	$: talentSpecString = talentSpecToString(realmToExpansion(realm), talentSpec);
</script>

<Icon src={talentSpecIconUrl} label={talentSpecString} />
