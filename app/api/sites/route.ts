import { NextRequest, NextResponse } from 'next/server';
import { SitesDbService } from '@/lib/sites-db';

// GET /api/sites - Get all sites
export async function GET() {
  try {
    const sites = await SitesDbService.getAllSites();
    return NextResponse.json(sites);
  } catch (error) {
    console.error('Error fetching sites:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sites' },
      { status: 500 }
    );
  }
}

// POST /api/sites - Create a new site
export async function POST(request: NextRequest) {
  try {
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

    const newSite = await SitesDbService.createSite(siteData);
    return NextResponse.json(newSite, { status: 201 });
  } catch (error) {
    console.error('Error creating site:', error);
    return NextResponse.json(
      { error: 'Failed to create site' },
      { status: 500 }
    );
  }
}