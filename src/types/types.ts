export interface Photo {
	id: string;
	url: string;
	name: string;
	timestamp: string;
}

// Postgres는 기본적으로 columns을 소문자로 처리 -> 이름 맞추기
export interface PhotoComent {
	photoid: string;
	description: string;
}

// Postgres는 기본적으로 columns을 소문자로 처리 -> 이름 맞추기
export interface Comment {
	id: string;
	username: string;
	text: string;
	timestamp: string;
	likes?: number | null; // ❤️ 수 추가
}

export interface LoginForm {
	username: string;
	password: string;
}

export interface Leaf {
	id: number;
	left: number;
	animationDelay: number;
	animationDuration: number;
	swayDuration: number;
	emoji: string;
}

export interface MusicItem {
	title: string;
	artist: string;
	src: string;
	thumbnail: string;
}
