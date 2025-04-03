import UserProfile from "../components/profile/user-profile";

// ✅ 클라이언트뿐 아니라 서버에서도 사용할 수 있는 세션 확인 함수
import { getSession } from "next-auth/react";

function ProfilePage() {
  // ✅ 이 페이지는 유저가 로그인되어 있을 때만 접근 가능한 보호 페이지
  // getServerSideProps()에서 로그인 여부를 확인했기 때문에, 여기선 별도의 클라이언트(<UseProfile>에서 쓴 보호로직 삭제 ok) 보호 로직이 필요 없음
  return <UserProfile />;
}

// ✅ 이 함수는 요청이 들어올 때마다 서버에서 실행되며, 세션을 기준으로 보호 페이지 접근을 제어할 수 있음
export async function getServerSideProps(context) {
  // context.req: 이 페이지 요청을 보낸 유저의 정보"를 담고 있는 HTTP 요청 객체
  // ❓getSession({ req })에서 req만 넘기는 이유는:
  // 🔐 "요청(request) 객체 자체가 "쿠키"를 포함하고 있고,
  // getSession 내부에서 알아서 req.headers.cookie를 읽어 쿠키 유무(즉, 로그인 여부)를 판단하기 때문"
  // => 즉, getSession은 우리가 넘긴 req 박스를 열어서 거기서 headers.cookie를 확인하고 그 안에 있는 next-auth.session-token 같은 쿠키 값을 파싱해서 로그인 상태인지 판단한다. 즉, 우리가 직접 req.headers.cookie를 읽을 필요 없이, getSession()이 내부에서 대신 해주는 것
  const session = await getSession({ req: context.req });

  // ✅ 세션이 없다면 (로그인하지 않은 사용자라면) profile 페이지에 못들어오게 막고, /auth로 즉시 리다이렉트!
  if (!session) {
    return {
      // 🔁 "클라이언트로 HTML이 전달되기 전"(✨깜빡임 현상 안 나타나는  이유..), 서버 단계에서 /auth 페이지로 즉시 리다이렉트 시킴
      redirect: {
        destination: "/auth",
        permanent: false, // ❗ 일시적인 리다이렉트임을 명시 (검색 엔진에 캐싱되지 않도록)
      },
    };
  }

  // ✅ 세션이 존재하면 props를 반환해 정상적으로 페이지를 렌더링함
  return {
    props: {
      session, // (선택) 필요시 페이지 컴포넌트에 세션 데이터 전달 가능
    },
  };
}

export default ProfilePage;

/*
✅ 왜 getServerSideProps로 처리하는 게 더 좋은가요?
🔹 1. 클라이언트 로딩/깜빡임 문제 완벽 해결
useSession()이나 getSession()을 클라이언트에서 사용하면, 브라우저는 페이지를 먼저 렌더링하고, 그 다음에야 로그인 상태를 확인함.

그래서 로그인이 안 된 사용자라도 잠깐이나마 profile 페이지가 보였다가 auth로 리다이렉트됨. → ❌ 플래시 현상(Flicker, Flash of Unauthorized Content) 발생

✅ getServerSideProps()는 페이지가 렌더링되기 전에 서버에서 세션을 판단하므로,
아예 profile 페이지가 브라우저에 뜨지도 않음. 즉시 다른 경로로 리다이렉트됨.

🔹 2. 보안적으로 더 안전함
클라이언트에서만 보호 로직을 구현하면, 잠깐이라도 민감한 콘텐츠가 노출될 수 있음
반면 서버 측에서 리다이렉트를 처리하면, 민감한 정보는 아예 클라이언트에 도달하지 않음

🔹 3. 더 예측 가능하고 디버깅이 쉬움
getSession({ req })는 "서버에서 요청에 포함된 쿠키"로 로그인 상태를 정확히 판별하므로, 로딩 상태나 상태 관리에 의존할 필요가 없음
if (!session) 조건문 하나로 분기 처리가 확실하게 되기 때문에 로직도 간단하고 명확함

🔹 4. SEO 및 초기 렌더링 품질 향상
서버 측에서 인증 여부를 체크하고 그에 따라 페이지를 렌더링하면, 클라이언트는 즉시 올바른 결과를 받게 됨
특히 검색 엔진이나 브라우저의 프리로드 등에서 더 적절한 동작이 가능
*/
