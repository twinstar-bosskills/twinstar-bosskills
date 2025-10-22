<script lang="ts">
	import { distanceTzNow, formatTzLocalized } from '$lib/date';
	import type { BossKill } from '$lib/server/api/schema';

	export let bosskill: BossKill;
	$: time = bosskill.time;
</script>

<span title={formatTzLocalized(time)}>{distanceTzNow(time)}</span>
