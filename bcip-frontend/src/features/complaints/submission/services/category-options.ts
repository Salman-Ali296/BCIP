import { CreditCard, Headphones, Package, ShieldAlert, Truck, Wrench, type LucideIcon } from "lucide-react";

export interface ComplaintCategoryOption {
    value: string;
    label: string;
    icon: LucideIcon;
}

export const COMPLAINT_CATEGORY_OPTIONS: ComplaintCategoryOption[] = [
    { value: "BILLING", label: "Billing", icon: CreditCard },
    { value: "DELIVERY", label: "Delivery", icon: Truck },
    { value: "PRODUCT_QUALITY", label: "Product quality", icon: Package },
    { value: "TECHNICAL", label: "Technical issue", icon: Wrench },
    { value: "CUSTOMER_SERVICE", label: "Customer service", icon: Headphones },
    { value: "OTHER", label: "Other", icon: ShieldAlert },
];
