export interface BusinessApprovalAccount {
    accountType: string;
    role: string;
    tenant: {
        isActive: boolean;
        businessVerified: boolean;
    };
}

export function isUnapprovedBusinessAdministrator(
    account: BusinessApprovalAccount,
): boolean {
    return (
        account.accountType === 'BUSINESS' &&
        account.role === 'BUSINESS_ADMIN' &&
        !account.tenant.isActive &&
        !account.tenant.businessVerified
    );
}
