export interface Photo {
	id: string;
	url: string;
	name: string;
	timestamp: string;
}

export interface Comment {
	id: number;
	text: string;
	author: string;
	timestamp: string;
	date: Date;
}

export interface LoginForm {
	username: string;
	password: string;
}

export interface Props {
	isLoggedIn: boolean;
	currentUser: string;
	handleLogin: (username: string) => void;
	handleLogout: () => void;
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
