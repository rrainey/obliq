// app/api/generate-code/route.ts - LLM-generated code
import { NextRequest, NextResponse } from 'next/server';
import { Model } from '@/lib/models/modelSchema';
import { generateCCodeFromModel } from '@/lib/codeGeneration';

export async function POST(request: NextRequest) {
  try {
    // Parse the request body to get the model JSON
    const body = await request.json();
    const model: Model = body.model;

    if (!model || !model.sheets || model.sheets.length === 0) {
      return NextResponse.json(
        { error: 'Invalid model data provided' },
        { status: 400 }
      );
    }

    // Generate C code files
    const codeFiles = generateCCodeFromModel(model);

    // Return the generated files
    return NextResponse.json({
      success: true,
      message: 'Code generation completed successfully',
      modelName: model.name,
      files: codeFiles
    });

  } catch (error) {
    console.error('Error in code generation API:', error);
    return NextResponse.json(
      { error: 'Failed to generate code: ' + (error as Error).message },
      { status: 500 }
    );
  }
}

// Handle unsupported methods
export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed. Use POST to generate code.' },
    { status: 405 }
  );
}