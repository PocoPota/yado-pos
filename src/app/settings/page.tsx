import VerifiedOnlyComponent from "../components/VerifiedOnlyComponent";

export default function Settings() {
  return (
    <VerifiedOnlyComponent>
      <main>
        <ul>
          <li><a href="/settings/products">商品設定</a></li>
          <li><a href="/settings/user">ユーザー設定</a></li>
        </ul>
      </main>
    </VerifiedOnlyComponent>
  );
}
