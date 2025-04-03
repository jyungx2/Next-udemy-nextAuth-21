import { useSession, getSession } from "next-auth/react";
import ProfileForm from "./profile-form";
import classes from "./user-profile.module.css";
import { useEffect, useState } from "react";

function UserProfile() {
  // ❌ 기본적으로 로그인되지 않은 사용자는 /profile 페이지를 볼 수 없어야 하므로 직접 세션을 체크해서 로그인 여부를 판단하고 리다이렉트 처리해야 함

  /**
   * 🔐 보호 페이지 로직 설명
   * - 로그인하지 않은 사용자는 /profile 페이지에 접근하면 안 됨
   * - useSession()은 초기 렌더링 시 session이 undefined, status는 'loading' 상태이며
   *   때때로 이 loading 상태가 계속 유지되어 플래시(깜빡임) 현상이 발생할 수 있음
   * - getSession()은 최신 세션 정보를 명확하게 가져오므로,
   *   로그인 여부를 확실하게 판별 가능 (null 또는 session 객체)
   * - 따라서 getSession() + useState를 이용해 직접 isLoading 상태를 관리하는 방식이 더 안전함
   **/

  /*
  // const { data, status } = useSession(); // ⚠️ 초기엔 session === undefined, status === 'loading'이라 확정적인 로그인 여부를 알 수 없음

  // ✅ 이 컴포넌트에서 사용할 로딩 상태를 직접 관리
  const [isLoading, setIsLoading] = useState(true); // ✅ 세션 확인 전까지 로딩 상태 유지
  // const [loadedSession, setLoadedSession] = useState();

  // ✅ 컴포넌트가 처음 렌더링 될 때 실행되는 side effect
  useEffect(() => {
    getSession().then((session) => {
      // getSession의 session 값은 딱 2가지로만 나뉘어 리다이렉트 기준 명확! (useSession은 session === undefined까지 3가지..=> 불분명)
      if (!session) {
        // ❌ 로그인하지 않은 사용자(session === null)일 경우, 로그인 페이지로 강제 리다이렉트
        window.location.href = "/auth";
      } else {
        // ✅ 세션이 있으면 로딩 상태 종료 → 본문 렌더링 허용
        setIsLoading(false);
      }
    });
  }, []);

  // 🔄 세션 확인 중일 때는 콘텐츠 숨기고 로딩 표시만 출력 (깜빡임 방지)
  if (isLoading) {
    return <p className={classes.profile}>Loading...</p>;
  }
  */

  // ✅ 세션이 확인되고 인증된 경우에만 아래 콘텐츠 렌더링
  return (
    <section className={classes.profile}>
      <h1>Your User Profile</h1>
      <ProfileForm />
    </section>
  );
}

export default UserProfile;
