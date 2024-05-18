<script>
	import LinkExternal from '$lib/components/LinkExternal.svelte';
	import TextColorSuccess from '$lib/components/TextColorSuccess.svelte';
	import TextColorWarning from '$lib/components/TextColorWarning.svelte';
</script>

<svelte:head>
	<title>Changelog</title>
</svelte:head>
<h1>Changelog (YYYY-MM-DD)</h1>
<div class="changelog">
	<section>
		<h2>2024-05-18 - Character details with overall rankings</h2>
		<p>
			Overall DPS and HPS rankings are now available in character detail. Talent spec and link to
			the bosskill detail is also there.
		</p>
		<div class="explanation">
			<p class="content">
				You will get 🔥 if you rank is under 200, ⚠️ if under 1000 and 🥦 otherwise.
			</p>
		</div>
	</section>
	<section>
		<h2>2024-03-17 - More detailed landing page</h2>
		<p>Previous raid lock charts added to landing page</p>
	</section>
	<section>
		<h2>2024-03-11 - Percentiles</h2>
		<p>Percentiles (someone calls them parses or parsers) have been added to bosskill details.</p>
		<div class="explanation">
			<h3 class="hint">WTF is percentile anyway?</h3>
			<p class="content">
				A percentile is a measure indicating the value below which a given percentage of
				observations in a group of observations falls.
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
	<section>
		<h2>2024-01-01 - DPS and HPS</h2>
		<p>DPS and HPS numbers might be slightly different from the ones you can see on Twinhead.</p>
		<div class="explanation">
			<p class="content">
				We are dividing the value by <code class="strike">usefullTime</code>
				<code>bosskill.length</code> when calculating the average.
			</p>
		</div>
	</section>
</div>

<style>
	.changelog {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		margin-bottom: 1rem;
	}
	section {
		display: inline-flex;
		flex-direction: column;
		border-left: 2px solid rgba(var(--color-primary), 1);
		padding: 1rem 0.5rem;
	}
	section h2 {
		margin: 0;
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
	.strike {
		text-decoration: line-through;
	}
</style>
