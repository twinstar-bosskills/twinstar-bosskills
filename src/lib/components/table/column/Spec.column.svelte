<script lang="ts">
	import SpecIcon from '$lib/components/icon/SpecIcon.svelte';

	export let realm: string;
	export let spec: number;
</script>

<SpecIcon {realm} talentSpec={spec} />
