<script lang="ts">
	import { distanceTzNow, formatTzLocalized } from '$lib/date';
	import type { BossKill } from '$lib/model';

	export let bosskill: BossKill;
</script>

<span title={formatTzLocalized(bosskill.time)}>{distanceTzNow(bosskill.time)}</span>
