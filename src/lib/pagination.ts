export const DEFAULT_PAGE = 0;
export const getPage = (v: string | number | null = DEFAULT_PAGE) => {
	let page = Number(v);
	return isFinite(page) && page >= 0 ? page : DEFAULT_PAGE;
};
export const getPageFromURL = (url: URL, d: number = DEFAULT_PAGE) => {
	return getPage(url.searchParams.get('page') ?? d);
};

export const DEFAULT_PAGE_SIZE = 50;
export const getPageSize = (v: string | number | null = DEFAULT_PAGE_SIZE) => {
	let pageSize = Number(v);
	return isFinite(pageSize) && pageSize > 0 ? pageSize : DEFAULT_PAGE_SIZE;
};
export const getPageSizeFromURL = (url: URL, d: number = DEFAULT_PAGE_SIZE) => {
	return getPageSize(url.searchParams.get('pageSize') ?? d);
};
