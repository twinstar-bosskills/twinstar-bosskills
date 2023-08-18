<script lang="ts">
	import { page } from '$app/stores';
	import Link from '$lib/components/Link.svelte';
	import SelectCharacter from '$lib/components/SelectCharacter.svelte';
	import type { LayoutData } from './$types';
	export let data: LayoutData;
</script>

<div class="top">
	<nav>
		<ul>
			<li>
				<Link href="/">Home</Link>
			</li>
			<li>
				<Link href="/boss-kills">Latest</Link>
				<!-- <a href="/bosses">Bosses</a> -->
			</li>
			<li>
				<Link href="/raids">Raids</Link>
			</li>
		</ul>
	</nav>
	<div class="select-character">
		<SelectCharacter
			redirectUrl={$page.url.pathname + $page.url.search + $page.url.hash}
			character={data.character}
		/>
	</div>
</div>

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
	:global(*) {
		box-sizing: border-box;
	}

	:global(table) {
		display: block;
		overflow-x: auto;
		table-layout: fixed;
		white-space: nowrap;
		width: 100%;
		border-collapse: collapse;
	}
	:global(table th) {
		background: gold;
	}
	:global(table tbody tr:nth-child(even)) {
		background: rgb(0 0 0 / 8%);
	}
	:global(table tr td, table tr th) {
		border: 1px solid rgba(0, 0, 0, 0.3);
		padding: 0.25rem;
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

	.top {
		display: grid;
		gap: 0.5rem;
		grid-template-columns: 1fr max-content;
	}
	nav ul {
		display: flex;
	}

	nav ul li {
		margin-right: 0.5rem;
	}
	@media (max-width: 480px) {
		.top {
			grid-template-columns: 1fr;
		}
	}
</style>
