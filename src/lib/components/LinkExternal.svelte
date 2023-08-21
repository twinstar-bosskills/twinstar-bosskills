<script lang="ts">
	import Link from './Link.svelte';
</script>

<Link {...$$restProps} rel="external" ref="noopener" target="_blank"><slot /></Link>
