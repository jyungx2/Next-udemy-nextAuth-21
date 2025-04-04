import { useRef, useState } from "react";
import classes from "./auth-form.module.css";
import { signIn } from "next-auth/react";
import { useRouter } from "next/router";

async function createUser(email, password) {
  const response = await fetch("/api/auth/signup", {
    method: "POST",
    body: JSON.stringify({ email, password }),
    headers: {
      "Content-Type": "application/json",
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "something went wrong!");
  }

  return data;
}

function AuthForm() {
  const emailInputRef = useRef();
  const passwordInputRef = useRef();
  const router = useRouter();

  const [isLogin, setIsLogin] = useState(true);

  function switchAuthModeHandler() {
    setIsLogin((prevState) => !prevState);
  }

  async function submitHandler(event) {
    event.preventDefault();

    const enteredEmail = emailInputRef.current.value;
    const enteredPassword = passwordInputRef.current.value;

    // optional: Add validation

    if (isLogin) {
      // log user in -> 🌟use signIn lib🌟
      // signIn(): 클라이언트에서 백엔드(next-auth 서버)로 로그인 요청을 보내는 함수 => 로그인 성공 여부를 서버가 판단 & 클라이언트는 결과를 받아서 로그인 처리 후, 리다이렉트 또는 에러 처리(result.error 객체 유무 판단)..
      // 🍓 credentials = Next Auth 설정 파일의 providers안에 등록한 id
      const result = await signIn("credentials", {
        redirect: false,
        // 로그인 정보 (CredentialsProvider에서 설정한 필드명과 일치해야 함)
        email: enteredEmail,
        password: enteredPassword,
        // callbackUrl: "/profile", => redirect: true일 때, 로그인 성공하면 해당 Url로 자동 이동 (만약 redirect: false이면 callbackUrl 작성해도 이동 x)
      });
      console.log(result);
      /* 반환값 (result 객체) :
      {
        error: null,         // 실패하면 에러 메시지
        status: 200,         // HTTP 상태 코드
        ok: true,            // 성공 여부
        url: "/profile"      // redirect: true일 경우 이동할 URL
      }
      */

      // 🍋 Next Auth설정 파일에서 throw new Error()에 보낸 메시지가 담겨오는 속성(error 여부 확인)
      if (!result.error) {
        // set some auth state
        router.replace("/profile");
      }
    } else {
      try {
        const result = await createUser(enteredEmail, enteredPassword);
        console.log(result);
      } catch (err) {
        console.log(err);
      }
    }
  }

  return (
    <section className={classes.auth}>
      <h1>{isLogin ? "Login" : "Sign Up"}</h1>
      <form onSubmit={submitHandler}>
        <div className={classes.control}>
          <label htmlFor="email">Your Email</label>
          <input type="email" id="email" required ref={emailInputRef} />
        </div>
        <div className={classes.control}>
          <label htmlFor="password">Your Password</label>
          <input
            type="password"
            id="password"
            required
            ref={passwordInputRef}
          />
        </div>
        <div className={classes.actions}>
          <button>{isLogin ? "Login" : "Create Account"}</button>
          <button
            type="button"
            className={classes.toggle}
            onClick={switchAuthModeHandler}
          >
            {isLogin ? "Create new account" : "Login with existing account"}
          </button>
        </div>
      </form>
    </section>
  );
}

export default AuthForm;
