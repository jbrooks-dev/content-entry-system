import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { Site } from '@/types/site';

const DATA_FILE = path.join(process.cwd(), 'data', 'sites.json');

// Read sites from JSON file
async function readSites(): Promise<Site[]> {
  try {
    const data = await fs.readFile(DATA_FILE, 'utf8');
    const sites = JSON.parse(data);
    return sites.map((site: any) => ({
      ...site,
      createdAt: new Date(site.createdAt),
      updatedAt: new Date(site.updatedAt)
    }));
  } catch (error) {
    return [];
  }
}

// Write sites to JSON file
async function writeSites(sites: Site[]): Promise<void> {
  await fs.writeFile(DATA_FILE, JSON.stringify(sites, null, 2));
}

// GET /api/sites/[id] - Get a specific site
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const sites = await readSites();
    const site = sites.find(s => s.id === id);
    
    if (!site) {
      return NextResponse.json(
        { error: 'Site not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(site);
  } catch (error) {
    console.error('Error reading site:', error);
    return NextResponse.json(
      { error: 'Failed to read site' },
      { status: 500 }
    );
  }
}

// PUT /api/sites/[id] - Update a specific site
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, devUrl, productionUrl, notes } = body;

    if (!name?.trim()) {
      return NextResponse.json(
        { error: 'Site name is required' },
        { status: 400 }
      );
    }

    const sites = await readSites();
    const siteIndex = sites.findIndex(s => s.id === id);
    
    if (siteIndex === -1) {
      return NextResponse.json(
        { error: 'Site not found' },
        { status: 404 }
      );
    }

    // Update the site
    sites[siteIndex] = {
      ...sites[siteIndex],
      name: name.trim(),
      devUrl: devUrl || '',
      productionUrl: productionUrl || '',
      notes: notes || '',
      updatedAt: new Date()
    };

    await writeSites(sites);
    return NextResponse.json(sites[siteIndex]);
  } catch (error) {
    console.error('Error updating site:', error);
    return NextResponse.json(
      { error: 'Failed to update site' },
      { status: 500 }
    );
  }
}

// DELETE /api/sites/[id] - Delete a specific site
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const sites = await readSites();
    const siteIndex = sites.findIndex(s => s.id === id);
    
    if (siteIndex === -1) {
      return NextResponse.json(
        { error: 'Site not found' },
        { status: 404 }
      );
    }

    // Remove the site
    const deletedSite = sites.splice(siteIndex, 1)[0];
    await writeSites(sites);
    
    return NextResponse.json({ message: 'Site deleted successfully', site: deletedSite });
  } catch (error) {
    console.error('Error deleting site:', error);
    return NextResponse.json(
      { error: 'Failed to delete site' },
      { status: 500 }
    );
  }
}