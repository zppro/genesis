import { SignInButton } from "@clerk/remix";

export default function LoginPage() {
  return (
    <>
      <h1>Convex Chat</h1>
      <h2>
        <SignInButton />
      </h2>
    </>
  );
}