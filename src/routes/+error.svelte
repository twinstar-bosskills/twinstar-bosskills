<script lang="ts">
	import { page } from '$app/stores';
	const error = $page.error as {
		message: string;
		details?: string;
		link?: string;
		linkText?: string;
	};
</script>

<h1>{error.message}</h1>

{#if error.details}
	<p>
		{error.details}
	</p>
{/if}

{#if error.link && error.linkText}
	<a href={error.link}>{error.linkText}</a>
{/if}
