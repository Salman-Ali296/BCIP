import { Request, Response } from "express";
import { AccountType, Prisma, Role } from "@prisma/client";
import { prisma } from "../config/database";


export const getPendingBusinessVerifications = async (
  _req: Request,
  res: Response
): Promise<Response> => {
  const businesses = await prisma.tenant.findMany({
    where: {
      businessVerified: false,
      users: {
        some: {
          accountType: "BUSINESS",
          role: "BUSINESS_ADMIN",
        },
      },
    },
    select: {
      id: true,
      name: true,
      email: true,
      industry: true,
      createdAt: true,
      users: {
        where: { accountType: "BUSINESS", role: "BUSINESS_ADMIN" },
        select: {
          id: true,
          fullName: true,
          email: true,
          emailVerified: true,
        },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  return res.status(200).json({
    success: true,
    count: businesses.length,
    data: businesses,
  });
};

export const approveBusinessVerification = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const rawId = req.params.id;
    const id = Array.isArray(rawId) ? rawId[0] : rawId;

    if (!id || typeof id !== "string" || typeof req.body?.approved !== "boolean") {
      return res.status(400).json({ success: false, message: "A business ID and boolean approval decision are required." });
    }

    const tenant = await prisma.tenant.update({
      where: { id },
      data: {
        businessVerified: req.body.approved,
        isActive: req.body.approved,
      },
      select: { id: true, name: true, businessVerified: true, isActive: true },
    });
    return res.status(200).json({
      success: true,
      message: req.body.approved ? "Business verification approved." : "Business verification rejected.",
      data: tenant,
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return res.status(404).json({ success: false, message: "Business workspace not found." });
    }
    throw error;
  }
};

/**
 * GET /users
 * Get all users
 */
export const getAllUsers = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        role: true,
        accountType: true,
        emailVerified: true,
        isActive: true,
        tenantId: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.status(200).json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error) {
    console.error("Admin getAllUsers error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve users.",
    });
  }
};

/**
 * GET /users/:id
 * Get a single user
 */
export const getUserById = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { id } = req.params;

    if (!id || typeof id !== "string") {
      return res.status(400).json({
        success: false,
        message: "User ID is required.",
      });
    }

    const user = await prisma.user.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        role: true,
        accountType: true,
        emailVerified: true,
        isActive: true,
        tenantId: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    return res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error("Admin getUserById error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve user.",
    });
  }
};

/**
 * PUT /users/:id
 * Update user information
 */
export const updateUser = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    if (Object.prototype.hasOwnProperty.call(req.body ?? {}, "emailVerified")) {
      return res.status(400).json({
        success: false,
        message: "Email ownership can only be confirmed through the verification flow.",
      });
    }

    const { id } = req.params;

    if (!id || typeof id !== "string") {
      return res.status(400).json({
        success: false,
        message: "User ID is required.",
      });
    }

    const existingUser = await prisma.user.findUnique({
      where: {
        id,
      },
    });

    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    const {
      fullName,
      phone,
      role,
      accountType,
      isActive,
    } = req.body;

    const updateData: {
      fullName?: string;
      phone?: string | null;
      role?: Role;
      accountType?: AccountType;
      isActive?: boolean;
    } = {};

    /*
     * Full name
     */
    if (fullName !== undefined) {
      if (
        typeof fullName !== "string" ||
        fullName.trim().length < 2 ||
        fullName.trim().length > 100
      ) {
        return res.status(400).json({
          success: false,
          message: "Full name must contain between 2 and 100 characters.",
        });
      }

      updateData.fullName = fullName.trim();
    }

    /*
     * Phone
     */
    if (phone !== undefined) {
      if (phone !== null && typeof phone !== "string") {
        return res.status(400).json({
          success: false,
          message: "Invalid phone number.",
        });
      }

      updateData.phone =
        phone === null ? null : phone.trim() || null;
    }

    /*
     * Role
     */
    if (role !== undefined) {
      if (
        typeof role !== "string" ||
        !Object.values(Role).includes(role as Role)
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid user role.",
        });
      }

      updateData.role = role as Role;
    }

    /*
     * Account type
     */
    if (accountType !== undefined) {
      if (
        typeof accountType !== "string" ||
        !Object.values(AccountType).includes(accountType as AccountType)
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid account type.",
        });
      }

      updateData.accountType = accountType as AccountType;
    }

    /*
     * Active status
     */
    if (isActive !== undefined) {
      if (typeof isActive !== "boolean") {
        return res.status(400).json({
          success: false,
          message: "isActive must be a boolean.",
        });
      }

      updateData.isActive = isActive;
    }

    /*
     * No fields supplied
     */
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid fields were provided for update.",
      });
    }

    const updatedUser = await prisma.user.update({
      where: {
        id,
      },
      data: updateData,
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        role: true,
        accountType: true,
        emailVerified: true,
        isActive: true,
        tenantId: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return res.status(200).json({
      success: true,
      message: "User updated successfully.",
      data: updatedUser,
    });
  } catch (error) {
    console.error("Admin updateUser error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to update user.",
    });
  }
};

/**
 * DELETE /users/:id
 *
 * Soft delete / deactivate a user.
 * The database record is preserved for audit history.
 */
export const deleteUser = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { id } = req.params;

    if (!id || typeof id !== "string") {
      return res.status(400).json({
        success: false,
        message: "User ID is required.",
      });
    }

    const existingUser = await prisma.user.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
        email: true,
        isActive: true,
      },
    });

    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    /*
     * Already inactive
     */
    if (!existingUser.isActive) {
      return res.status(400).json({
        success: false,
        message: "User is already inactive.",
      });
    }

    /*
     * Soft delete:
     * Preserve the database record for audit/history.
     */
    const deactivatedUser = await prisma.user.update({
      where: {
        id,
      },
      data: {
        isActive: false,
      },
      select: {
        id: true,
        email: true,
        isActive: true,
      },
    });

    return res.status(200).json({
      success: true,
      message: "User deactivated successfully.",
      data: deactivatedUser,
    });
  } catch (error) {
    console.error("Admin deleteUser error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to deactivate user.",
    });
  }
};