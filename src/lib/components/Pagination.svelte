<script lang="ts">
	import { getPage, getPageSize } from '$lib/paginations';
	import Link from './Link.svelte';

	export let path: string;
	export let page: number = 0;
	export let pageSize: number = 100;

	export let totalItems: number = 0;

	export let pageWindowSize: number = 5;

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
			<Link data-sveltekit-reload href="{path}?page=0">{'|<'} First</Link>
		</li>
		<li style="margin-right: 0.5rem">
			<Link data-sveltekit-reload href="{path}?page={prevPage}">{'<<'} Prev</Link>
		</li>
		{#each options as option}
			<li>
				<Link data-sveltekit-reload href="{path}?page={option.page}">{option.page + 1}</Link>
			</li>
		{/each}
		<li style="margin-left: 0.5rem">
			<Link data-sveltekit-reload href="{path}?page={nextPage}">Next {'>>'}</Link>
		</li>
		<li>
			<Link data-sveltekit-reload href="{path}?page={lastPage}">Last {'>|'}</Link>
		</li>
	</ol>
</div>

<style>
	.pagination {
		display: flex;
		justify-content: center;
		flex-grow: 1;
	}

	.pagination ol {
		display: flex;
	}

	.pagination ol li :global(> *) {
		padding: 0.5rem 0.75rem;
	}

	.pagination ol li:first-child :global(> *) {
		padding-left: 0;
	}

	.pagination ol li:last-child :global(> *) {
		padding-right: 0;
	}

	@media (max-width: 900px) {
		.pagination {
			justify-content: flex-start;
		}
	}
</style>
