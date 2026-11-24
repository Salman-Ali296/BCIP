export const PUBLIC_CUSTOMER_ACCESS_MESSAGE =
    'Customer access is public. Submit and track complaints without signing in.';

export function isPublicCustomerAccount(accountType: string): boolean {
    return accountType === 'CUSTOMER';
}
