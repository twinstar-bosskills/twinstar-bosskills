<script lang="ts">
	import Icon from '$lib/components/Icon.svelte';
	import { talentSpecToString } from '$lib/model';
	import { realmToExpansion } from '$lib/realm';
	import { getTalentSpecIconUrl } from '$lib/talent';

	export let realm: string;
	export let talentSpec: number;

	$: talentSpecIconUrl = getTalentSpecIconUrl(realm, talentSpec);
	$: talentSpecString = talentSpecToString(realmToExpansion(realm), talentSpec);
</script>

<Icon src={talentSpecIconUrl} label={talentSpecString} />
