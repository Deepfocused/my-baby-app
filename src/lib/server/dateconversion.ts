// UTC 문자열 → KST 문자열 변환
export const toKST: (utcString: string) => string = (utcString) => {
	return new Date(utcString).toLocaleString('ko-KR', {
		timeZone: 'Asia/Seoul'
	});
};
