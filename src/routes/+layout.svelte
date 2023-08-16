<script>
	import Link from '../components/Link.svelte';
</script>

<nav>
	<ul>
		<li>
			<Link href="/">Home</Link>
		</li>
		<li>
			<Link href="/boss-kills">Latest</Link>
			<Link href="/raids">Raids</Link>
			<!-- <a href="/bosses">Bosses</a> -->
		</li>
	</ul>
</nav>

<main>
	<slot />
</main>

<style>
	:global(:root) {
		--color-q: #ffd100 !important;
		--color-q0: #9d9d9d !important;
		--color-q1: #fff !important;
		--color-q2: #1eff00 !important;
		--color-q3: #0070dd !important;
		--color-q4: #a335ee !important;
		--color-q5: #ff8000 !important;
		--color-q6: #e5cc80 !important;
		--color-q7: #e5cc80 !important;
		--color-q8: #ffff98 !important;
		--color-q9: #71d5ff !important;
		--color-q10: #f00 !important;

		--color-r1: #ff8040 !important;
		--color-r2: #ff0 !important;
		--color-r3: #40bf40 !important;

		--color-r4: #808080 !important;
	}

	:global(table) {
		display: block;
		overflow-x: auto;
		white-space: nowrap;
		width: 100%;
	}

	:global(table tbody, table thead) {
		display: table;
		width: 100%;
	}

	:global(ul, ol) {
		margin: 0;
		padding: 0;
	}

	:global(li) {
		margin: 0;
		padding: 0;
		text-indent: 0;
		list-style-type: none;
	}

	:global(body) {
		padding: 0.5rem;
	}

	nav ul {
		display: flex;
	}

	nav ul li {
		margin-right: 0.5rem;
	}
</style>
