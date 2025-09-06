import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      email,
      password,
      firstName,
      lastName,
      phone,
      userType,
      // Landlord fields
      companyName,
      businessAddress,
      businessCity,
      businessPostcode,
      // Tenant fields
      dateOfBirth,
      currentAddress,
      city,
      postcode,
      employmentStatus,
      monthlyIncome
    } = body

    // Validate required fields
    if (!email || !password || !firstName || !lastName || !phone || !userType) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { message: 'User with this email already exists' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create user with role-specific data
    const userData = {
      email,
      password: hashedPassword,
      firstName,
      lastName,
      phone,
      role: userType.toUpperCase() as 'LANDLORD' | 'TENANT',
      createdAt: new Date(),
      updatedAt: new Date()
    }

    const user = await prisma.user.create({
      data: userData
    })

    // Create role-specific profile
    if (userType === 'landlord') {
      await prisma.landlordProfile.create({
        data: {
          userId: user.id,
          companyName: companyName || null,
          businessAddress: businessAddress || '',
          businessCity: businessCity || '',
          businessPostcode: businessPostcode || '',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      })
    } else if (userType === 'tenant') {
      await prisma.tenantProfile.create({
        data: {
          userId: user.id,
          dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
          currentAddress: currentAddress || '',
          city: city || '',
          postcode: postcode || '',
          employmentStatus: employmentStatus || null,
          monthlyIncome: monthlyIncome || null,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      })
    }

    // Return success (don't send password)
    const { password: _, ...userWithoutPassword } = user

    return NextResponse.json({
      message: 'Account created successfully',
      user: userWithoutPassword
    }, { status: 201 })

  } catch (error) {
    console.error('Signup error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
