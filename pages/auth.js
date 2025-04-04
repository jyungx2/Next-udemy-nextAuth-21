import { useEffect, useState } from "react";
import { getSession } from "next-auth/react";
import AuthForm from "../components/auth/auth-form";
import { useRouter } from "next/router";

function AuthPage() {
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // 💥 클라이언트에서 getSession()호출은 아무 인자 없이 가능
  useEffect(() => {
    getSession().then((session) => {
      if (session) {
        router.replace("/");
      } else {
        setIsLoading(false);
      }
    });
  }, [router]);

  if (isLoading) {
    return <p>Loading...</p>;
  }
  return <AuthForm />;
}

export default AuthPage;
