<script lang="ts">
	import type { BossKill } from '$lib/model';
	export let bosskill: Pick<BossKill, 'guild' | 'realm'>;
</script>

{bosskill.guild == '' ? `Mixed group <${bosskill.realm}>` : bosskill.guild}
