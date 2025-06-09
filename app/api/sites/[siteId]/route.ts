import { NextRequest, NextResponse } from 'next/server';
import { SitesDbService } from '@/lib/sites-db';

// GET /api/sites/[siteId] - Get site by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ siteId: string }> }
) {
  try {
    const { siteId } = await params;
    const site = await SitesDbService.getSiteById(siteId);
    
    if (!site) {
      return NextResponse.json(
        { error: 'Site not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(site);
  } catch (error) {
    console.error('Error fetching site:', error);
    return NextResponse.json(
      { error: 'Failed to fetch site' },
      { status: 500 }
    );
  }
}

// PUT /api/sites/[siteId] - Update site
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ siteId: string }> }
) {
  try {
    const { siteId } = await params;
    const body = await request.json();
    const { name, devUrl, productionUrl, notes } = body;

    if (!name?.trim()) {
      return NextResponse.json(
        { error: 'Site name is required' },
        { status: 400 }
      );
    }

    const siteData = {
      name: name.trim(),
      devUrl: devUrl?.trim() || '',
      productionUrl: productionUrl?.trim() || '',
      notes: notes?.trim() || ''
    };

    const updatedSite = await SitesDbService.updateSite(siteId, siteData);
    return NextResponse.json(updatedSite);
  } catch (error) {
    console.error('Error updating site:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    if (errorMessage === 'Site not found') {
      return NextResponse.json(
        { error: 'Site not found' },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to update site' },
      { status: 500 }
    );
  }
}

// DELETE /api/sites/[siteId] - Delete site
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ siteId: string }> }
) {
  try {
    const { siteId } = await params;
    await SitesDbService.deleteSite(siteId);
    return NextResponse.json({ message: 'Site deleted successfully' });
  } catch (error) {
    console.error('Error deleting site:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    if (errorMessage === 'Site not found') {
      return NextResponse.json(
        { error: 'Site not found' },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to delete site' },
      { status: 500 }
    );
  }
}