import HeaderClient from "./header-client";
import { getCurrentUser } from "@/app/lib/dal";

export default async function Header() {
    const user = await getCurrentUser();

    return (
        <HeaderClient username={user?.username ?? null} />
    );
}