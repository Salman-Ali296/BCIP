import { redirect } from "next/navigation";

export default function CustomerHomePage(): never {
    redirect("/customer/dashboard");
}
