<script lang="ts">
	import SpecIcon from '$lib/components/icon/SpecIcon.svelte';
	import type { BosskillCharacter } from '$lib/server/api/schema';

	export let realm: string;
	export let character: BosskillCharacter;

	$: talentSpec = character.talent_spec;
</script>

<SpecIcon {realm} {talentSpec} />
