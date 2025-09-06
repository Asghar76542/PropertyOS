import { NextRequest, NextResponse } from 'next/server'
import ZAI from 'z-ai-web-dev-sdk'

export async function POST(request: NextRequest) {
  try {
    const { query, propertyContext } = await request.json()

    if (!query) {
      return NextResponse.json(
        { error: 'Query is required' },
        { status: 400 }
      )
    }

    // Initialize ZAI SDK
    const zai = await ZAI.create()

    // Create a comprehensive prompt for property compliance
    const systemPrompt = `You are an expert UK property compliance advisor with deep knowledge of:
- Gas Safety Regulations
- Energy Performance Certificates (EPC)
- Electrical Safety Standards
- Fire Safety Regulations
- HMO Licensing
- Tenant Deposit Protection
- Right to Rent Checks
- Building Regulations
- Housing Health and Safety Rating System (HHSRS)
- Legionella Risk Assessment
- Asbestos Management
- Carbon Monoxide Alarm Requirements

Provide accurate, up-to-date compliance guidance for UK landlords. Include specific regulatory references where applicable and give practical, actionable advice. Consider the property context provided and tailor your response accordingly.`

    const userPrompt = `Compliance Query: ${query}

${propertyContext ? `Property Context: ${propertyContext}` : ''}

Please provide comprehensive compliance guidance including:
1. Regulatory requirements
2. Deadlines and timelines
3. Potential penalties for non-compliance
4. Recommended actions
5. Best practices`

    // Get AI completion
    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: systemPrompt
        },
        {
          role: 'user',
          content: userPrompt
        }
      ],
      temperature: 0.3, // Lower temperature for more factual responses
      max_tokens: 1000
    })

    const aiResponse = completion.choices[0]?.message?.content

    if (!aiResponse) {
      return NextResponse.json(
        { error: 'Failed to generate AI response' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      response: aiResponse,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Error in AI compliance advisor:', error)
    return NextResponse.json(
      { error: 'Failed to process AI request' },
      { status: 500 }
    )
  }
}