import LogoutButton from "@/app/components/LogoutButton";
import VerifiedOnlyComponent from "@/app/components/VerifiedOnlyComponent";

export default function UserSettingPage() {
  return (
    <VerifiedOnlyComponent>
      <main>
        <LogoutButton />
      </main>
    </VerifiedOnlyComponent>
  );
}
