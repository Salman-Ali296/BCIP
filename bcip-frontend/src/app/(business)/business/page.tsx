import { redirect } from "next/navigation";

export default function BusinessHomePage(): never {
    redirect("/business/dashboard");
}
