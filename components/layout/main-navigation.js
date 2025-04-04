import Link from "next/link";

import classes from "./main-navigation.module.css";
import { signOut, useSession } from "next-auth/react";

function MainNavigation() {
  const { data: session, status } = useSession();
  const loading = status === "loading";
  console.log(session, status);

  // 서버에 /api/auth/signout 요청을 보냄 & 브라우저의 세션 쿠키(JWT 포함)를 제거 & 기본적으로 홈페이지("/")로 리디렉트됨
  function logoutHandler() {
    signOut();
  }

  return (
    <header className={classes.header}>
      <Link href="/">
        <div className={classes.logo}>Next Auth</div>
      </Link>
      <nav>
        <ul>
          {!session && !loading && (
            <li>
              <Link href="/auth">Login</Link>
            </li>
          )}
          {session && (
            <li>
              <Link href="/profile">Profile</Link>
            </li>
          )}
          {session && (
            <li>
              <button onClick={logoutHandler}>Logout</button>
            </li>
          )}
        </ul>
      </nav>
    </header>
  );
}

export default MainNavigation;
