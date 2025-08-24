import { NextResponse } from 'next/server';
import { withTenantAuth } from '../../../lib/middleware/tenantMiddleware.js';
import { prisma } from '../../../lib/prisma.js';
import encryptionService from '../../../lib/encryption.js';

async function handleGetProfile(request, { user, tenant }) {
  try {
    const userProfile = await prisma.tenantUser.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        email: true,
        first_name: true,
        last_name: true,
        role: true,
        created_at: true,
        updated_at: true
      }
    });

    if (!userProfile) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      user: userProfile,
      tenant: {
        id: tenant.id,
        name: tenant.name,
        subdomain: tenant.subdomain
      }
    });

  } catch (error) {
    console.error('Get profile error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve profile' },
      { status: 500 }
    );
  }
}

async function handleUpdateProfile(request, { user, tenant }) {
  try {
    const updateData = await request.json();
    
    // Validate required fields
    if (!updateData.first_name?.trim() || !updateData.last_name?.trim()) {
      return NextResponse.json(
        { error: 'First name and last name are required' },
        { status: 400 }
      );
    }

    const updates = {
      first_name: updateData.first_name.trim(),
      last_name: updateData.last_name.trim(),
      updated_at: new Date()
    };

    // Handle password change if provided
    if (updateData.new_password) {
      if (!updateData.current_password) {
        return NextResponse.json(
          { error: 'Current password is required to change password' },
          { status: 400 }
        );
      }

      if (updateData.new_password.length < 8) {
        return NextResponse.json(
          { error: 'New password must be at least 8 characters long' },
          { status: 400 }
        );
      }

      // Get current user with password
      const currentUser = await prisma.tenantUser.findUnique({
        where: { id: user.id },
        select: { password: true }
      });

      if (!currentUser) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        );
      }

      // Verify current password
      const isCurrentPasswordValid = await encryptionService.verifyPassword(
        updateData.current_password,
        currentUser.password
      );

      if (!isCurrentPasswordValid) {
        return NextResponse.json(
          { error: 'Current password is incorrect' },
          { status: 400 }
        );
      }

      // Hash new password
      const hashedNewPassword = await encryptionService.hashPassword(updateData.new_password);
      updates.password = hashedNewPassword;
    }

    // Update user profile
    const updatedUser = await prisma.tenantUser.update({
      where: { id: user.id },
      data: updates,
      select: {
        id: true,
        email: true,
        first_name: true,
        last_name: true,
        role: true,
        created_at: true,
        updated_at: true
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      user: updatedUser
    });

  } catch (error) {
    console.error('Update profile error:', error);
    return NextResponse.json(
      { error: 'Failed to update profile: ' + error.message },
      { status: 500 }
    );
  }
}

export const GET = withTenantAuth(handleGetProfile);
export const PUT = withTenantAuth(handleUpdateProfile);