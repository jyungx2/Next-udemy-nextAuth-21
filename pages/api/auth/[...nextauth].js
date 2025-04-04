import NextAuth from "next-auth";
import CredentialProvider from "next-auth/providers/credentials";
import { connectToDatabase } from "../../../lib/db";
import { verifyPassword } from "../../../lib/auth";

export default NextAuth({
  session: {
    strategy: "jwt", // 세션을 저장할 때 데이터베이스를 사용하지 않고, JWT(JSON Web Token) 쿠키를 사용하겠다는 의미 (서버에 세션을 저장하지 않고, 브라우저 쿠키에 저장된 JWT로 사용자를 식별)
    // maxAge: 30 * 24 * 60 * 60, // 🔥 세션 만료 기간 설정도 가능 (선택)
  },
  providers: [
    CredentialProvider({
      id: "credentials", // ← 🍓바로 이 값과 연결!(생략가능, 기본값이 credentials... 여러개의 provider 필요시, 각기 다른 id 지정)
      async authorize(credentials) {
        const client = await connectToDatabase();
        const usersCollection = client.db().collection("users");

        const user = await usersCollection.findOne({
          email: credentials.email,
        });

        if (!user) {
          client.close();
          // 🍋 굳이 res.status(401)처럼 에러코드 지정해줄 필요 없는 이유: authorize()는 NextAuth 내부 서버의 로직 중 하나로, 우리가 직접 http 응답을 만드는ㄴ게 아니라, NextAuth가 authroize()에서 에러가 throw되면 자동으로 401(unauthorized) 상태코드로 응답하고, signIn() 함수에서 result.error 속성에 그 메시지를 담아 보낸다.
          throw new Error("No user found!");
        }

        const isValid = await verifyPassword(
          credentials.password,
          user.password
        );

        if (!isValid) {
          client.close();
          // 🍋 마찬가지로 401 에러 코드 자동반환되어 signIn()의 error속성으로 에러메시지 전달
          throw new Error("Could not log you in!");
        }

        client.close();

        // authorize()의 리턴값은 session.user(*reserved name)에 저장... => 결국 브라우저의 쿠키나 getSession()으로 클라이언트에서 접근 가능한 정보 (즉, 클라이언트에 노출될 수 있는 정보이기 때문에 → ❗ 비밀번호(심지어 해시된 비밀번호조차도) 포함시키면 아니된다!)
        // 나중에 getSession() 또는 useSession()을 호출하면 아래 이메일 정보 추출가능
        return { email: user.email }; // 일반적으로 email은 식별자 역할, 사용자 UI에 표시 or 특정 데이터 요청시 조건으로 사용 & 백엔다(api routes) 요청 시, 이 사용자가 누군지 판단가능지표

        // ✅ 아래와 같은 정보들이 자주 추가된다...
        // id: user._id.toString(),    // MongoDB의 ObjectId
        // role: user.role || "user",  // 관리자/일반회원 구분
      },
    }),
  ],
});
