/*
 간단한 메모리 기반 세션 저장소 
 -> 아주 작은 개인 프로젝트라서... 커지면 redis 사용하즈아
 */
// 세션 맵, createdAt 은 사용 x
import crypto from 'crypto';

const sessions = new Map<string, { username: string; createdAt: number }>();

// 🔹 세션 생성
export const createSession: (username: string) => Promise<string> = async (username) => {
	const sessionId = crypto.createHash('sha256').update(username).digest('hex');
	sessions.set(sessionId, { username, createdAt: Date.now() });
	return sessionId;
};

// 🔹 세션 조회
export const getSession: (
	sessionId: string
) => Promise<{ username: string; createdAt: number } | undefined> = async (sessionId) => {
	return sessions.get(sessionId);
};

// 🔹 세션 삭제
export const deleteSession: (sessionId: string) => Promise<void> = async (sessionId) => {
	sessions.delete(sessionId);
};
