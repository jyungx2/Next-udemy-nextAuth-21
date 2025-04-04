import { getSession } from "next-auth/react";

async function handler(req, res) {
  if (req.method !== "PATCH") {
    return;
  }

  // ✅ Code with which we protect our API route against unauthenticated access. => 유저 권한이 필요한 모든 페이지에서 필요한 코드!
  const session = await getSession({ req: req });
  if (!session) {
    // 401 = standard status code for saying that authentication is missing.
    res.status(401).json({ message: "Not authenticated!" });
    return;
  }
}

export default handler;
