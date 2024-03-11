<script>
	import LinkExternal from '$lib/components/LinkExternal.svelte';
	import TextColorError from '$lib/components/TextColorError.svelte';
	import TextColorSuccess from '$lib/components/TextColorSuccess.svelte';
	import TextColorWarning from '$lib/components/TextColorWarning.svelte';
</script>

<svelte:head>
	<title>Changelog</title>
</svelte:head>
<h1>Changelog (YYYY-MM-DD)</h1>
<section>
	<h2>2024-03-11 - Percentiles</h2>
	<p>Percentiles (someone calls them parses or parsers) have been added to bosskill details.</p>
	<div class="explanation">
		<h3 class="hint">WTF is percentile anyway?</h3>
		<p class="content">
			A percentile is a measure indicating the value below which a given percentage of observations
			in a group of observations falls.
		</p>
		<p>
			For example, the 50th percentile is the value below which 50% of the observations may be
			found, often referred to as the median.
		</p>
		<p>
			<LinkExternal href="https://en.wikipedia.org/wiki/Percentile">
				Wikipedia percentile
			</LinkExternal>
		</p>
	</div>
	<p>
		Now you can see how <TextColorSuccess>good</TextColorSuccess> or
		<TextColorWarning>bad</TextColorWarning>
		you are compared to the same spec 😉
	</p>
</section>

<style>
	section {
		display: inline-flex;
		flex-direction: column;
	}
	.explanation {
		padding: 0 0.5rem;
		margin-left: 0.25rem;
		border: 2px solid royalblue;
	}
	.explanation .hint {
		margin: 0;
		margin-left: -0.5rem;
		display: inline-flex;
		justify-content: center;
		padding: 0.25rem 0.5rem;
		content: 'Hint';
		background: royalblue;
	}
	.explanation .content {
		margin-top: 1rem;
	}
</style>
