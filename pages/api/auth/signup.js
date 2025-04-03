import { hashPassword } from "../../../lib/auth";
import { connectToDatabase } from "../../../lib/db";

async function handler(req, res) {
  // if (req.method !== "POST ") {
  //   return;
  // }

  if (req.method === "POST") {
    const data = req.body;
    const { email, password } = data;

    if (
      !email ||
      !email.includes("@") ||
      !password ||
      !password.trim().length > 7
    ) {
      res.status(422).json({
        message:
          "Invalid input - password should also be at least 7 characters long.",
      });
      return;
    }

    const client = await connectToDatabase();
    const db = client.db();

    // 중복 아이디 계정 방지 로직
    const existingUser = await db.collection("users").findOne({ email: email });

    if (existingUser) {
      res.status(422).json({ message: "User exists already!" });
      client.close();
      return;
    }

    const hashedPassword = await hashPassword(password);

    // 💥 await을 안붙이면 비동기 작업은 기다려주지 않기 때문에 성공 응답만 보내고, 실제 db에는 데이터 저장이 안됨!
    await db.collection("users").insertOne({
      email,
      password: hashedPassword,
    });

    res.status(201).json({ message: "Created User!" });
    client.close();
  }
}
export default handler;
