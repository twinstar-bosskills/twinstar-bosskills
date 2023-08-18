<script lang="ts">
	import { getPage, getPageSize } from '$lib/paginations';
	import Link from './Link.svelte';

	export let page = 0;
	export let pageSize = 100;

	export let totalItems = 0;

	export let pageWindowSize = 5;

	let safePage = getPage(page);
	let safePageSize = getPageSize(pageSize);
	let options: { page: number }[] = [];

	$: totalPages = Math.ceil(totalItems / safePageSize);
	$: lastPage = Math.max(totalPages - 1, 0);
	$: prevPage = Math.max(safePage - 1, 0);
	$: nextPage = Math.min(safePage + 1, lastPage);

	$: {
		let prevWindow = safePage - pageWindowSize;
		let nextWindow = safePage + pageWindowSize;
		if (prevWindow < 0) {
			nextWindow += Math.abs(prevWindow);
			prevWindow = 0;
		}

		console.log({ prevWindow, nextWindow });
		for (let i = 0; i < totalPages; i++) {
			// safePage - pageWindowSize > i ||
			const prevPages = i >= prevWindow;
			const nextPages = i <= nextWindow;

			if (nextPages && prevPages) {
				options.push({ page: i });
			}
		}
	}
</script>

<div class="pagination">
	<ol>
		<li>
			<Link href="/boss-kills?page=0">{'|<'} First</Link>
		</li>
		<li style="margin-right: 0.5rem">
			<Link href="/boss-kills?page={prevPage}">{'<<'} Prev</Link>
		</li>
		{#each options as option}
			<li>
				<Link href="/boss-kills?page={option.page}">{option.page + 1}</Link>
			</li>
		{/each}
		<li style="margin-left: 0.5rem">
			<Link href="/boss-kills?page={nextPage}">Next {'>>'}</Link>
		</li>
		<li>
			<Link href="/boss-kills?page={lastPage}">Last {'>|'}</Link>
		</li>
	</ol>
</div>

<style>
	.pagination {
		max-width: 95vw;
		overflow: auto;
	}
	.pagination ol {
		display: flex;
	}
	.pagination ol li {
		padding: 0.125rem 0;
		margin-right: 0.25rem;
	}
	.pagination ol li:last-child {
		margin-right: 0;
	}
</style>
