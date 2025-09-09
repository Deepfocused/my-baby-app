# 🎉 순돌이 탄생 축하 웹사이트

> 곧 태어날 나의 아기 '순돌이(태명)' 를 위해 만든 웹사이트

---

## ⚡ 개발하기

로컬 개발 서버 실행:

```bash
npm run dev
```

💥 scripts/gen-music-index.js 설명

```bash
재생할 음악파일 목록 및 메타 정보가 담긴 json 파일을 미리 만들어놓기 위함
```

---

## 🏗️ 빌드하기

프로덕션용 빌드:

```bash
npm run build
```

---

## 🚀 로컬 배포

빌드 후 로컬 미리보기:

```bash
npm run preview
```

---

## ⚙️ 설정 파일

실행을 위해 `.env` 파일에 다음 정보를 등록해야 함

```env
# ------------------------
# Superbase 설정
# ------------------------
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=

# Superbase Storage 버킷 이름 및 경로
BUCKET_NAME=
BUCKET_PATH=

# 관리자 페이지 계정
ADMIN_ID=
ADMIN_PW=

# 도메인 - 주소(예) http://localhost:8021 또는 https://my-baby-app.vercel.app)
DOMAIN=
```

> 💡 참고
>
> - Superbase는 가입 후 발급받으면 됨
> - 관리자 계정은 원하는 값으로 설정하면 됨

---

## 📝 SQL 테이블 & 트리거 설정

Superbase에서 SQL 테이블과 트리거를 설정해야 함

## 🅰️ 댓글 테이블 생성

### 1️⃣ 테이블 생성

```sql
create table if not exists public.comments (
  id uuid not null default gen_random_uuid(),
  username text not null,
  password text not null,
  text text not null,
  id_created timestamptz not null default now(),
  id_updated timestamptz not null default now(),
  constraint comments_pkey primary key (id)
);
```

### 2️⃣ 트리거용 함수 생성

```sql
# likes 업데이트시 에는 id_updated 업데이트 안 함!
create or replace function public.update_timestamp()
returns trigger
language plpgsql
set search_path = pg_catalog
as $$
begin
  if (NEW.likes is distinct from OLD.likes)
     and NEW.username = OLD.username
     and NEW.password = OLD.password
     and NEW.text = OLD.text then
    NEW.id_updated := OLD.id_updated;
  else
    NEW.id_updated := now();
  end if;
  return NEW;
end;
$$;
```

### 3️⃣ 트리거 생성

기존 트리거 삭제 후 새로 생성:

```sql
drop trigger if exists update_comments_timestamp on public.comments;

create trigger update_comments_timestamp
before update on public.comments
for each row
execute function public.update_timestamp();
```

## 🅱️ 이미지 설명 테이블 생성

### 1️⃣ 테이블 생성

```sql
create table public.photocomments (
  id uuid not null default gen_random_uuid (),
  photoid text not null,
  description text not null,
  constraint photocomments_pkey primary key (id),
  constraint photocomments_photoid_key unique (photoid)
) TABLESPACE pg_default;
```

---

## 🧑🏻‍💼 관리자 페이지

```bash
http://localhost:8021/admin -> 관리자 모드 진입 -> id, password 입력

기능 설명
1. 사진 업로드 및 삭제
2. 사진 설명 업로드
2. 댓글 삭제
```

---

## 🌐 Vercel 배포

> https://vercel.com/docs/frameworks/full-stack/sveltekit
