export const safeGC = () => {
	try {
		if (global.gc) {
			global.gc();
		}
	} catch (e: any) {
		console.error(e?.message);
	}
};
