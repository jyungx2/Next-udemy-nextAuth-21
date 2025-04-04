import { getSession } from "next-auth/react";
import { connectToDatabase } from "../../../lib/db";
import { hashPassword, verifyPassword } from "../../../lib/auth";

async function handler(req, res) {
  if (req.method !== "PATCH") {
    return;
  }

  // ✅ Code with which we protect our API route against unauthenticated access. => 유저 권한이 필요한 모든 페이지에서 필요한 코드!
  const session = await getSession({ req: req }); // 💥 서버(getServerSideProps, API Routes)에서 getSession()호출은 req 값에 클라이언트로부터 넘어온 적절한 값(= 여기서 req) 지정 (그렇지 않으면, null이나 undefined이 반환되어 오류 발생.)
  if (!session) {
    // 401 = standard status code for saying that authentication is missing.
    res.status(401).json({ message: "Not authenticated!" });
    return;
  }

  const userEmail = session.user.email;
  const oldPassword = req.body.oldPassword;
  const newPassword = req.body.newPassword;

  const client = connectToDatabase();
  const usersCollection = client.db().collection("users");

  const user = await usersCollection.findOne({ email: userEmail });
  if (!user) {
    res.status(404).json({ message: "User not found" });
    client.close();
    return;
  }

  const currentPassword = user.password;

  const passwordAreEqual = await verifyPassword(oldPassword, currentPassword);

  if (!passwordAreEqual) {
    // You are authenticated(=that's not why it's not 401) BUT, you're not authorized for this operation. (=> 403: Forbidden[접근은 했지만 거부됨] - simply do not have the permissions to perform this operation even though you're authenticated.)
    // You can also use 422 code.. (=> 422: Unprocessable Entity[입력은 했지만 의미상 문제] - 입력은 했지만, 처리할 수 없음 => 비밀번호 검증이 틀렸기 때문에 422도 사용가능.)
    res.status(403).json({ message: "Invalid password." });
    client.close();
    return;
  }

  const hashedPassword = await hashPassword(newPassword);

  await usersCollection.updateOne(
    { email: userEmail },
    { $set: { password: hashedPassword } }
  );

  client.close();
  res.status(200).json({ message: "Password updated!" });
}

export default handler;
