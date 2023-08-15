<script lang="ts">
	import { getPage, getPageSize } from '$lib/paginations';

	export let page = 0;
	export let pageSize = 100;

	export let totalItems = 0;

	let safePage = getPage(page);
	let safePageSize = getPageSize(pageSize);
	let options: { page: number }[] = [];
	$: {
		let totalPages = Math.ceil(totalItems / safePageSize);

		for (let i = 0; i < totalPages; i++) {
			options.push({ page: i });
		}
	}
</script>

<div class="pagination">
	<ol>
		{#each options as option}
			<li>
				<a href="/boss-kills?page={option.page}">{option.page + 1}</a>
			</li>
		{/each}
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
		margin-right: 0.25rem;
	}
</style>
