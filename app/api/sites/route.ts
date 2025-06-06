import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { Site } from '@/types/site';

const DATA_FILE = path.join(process.cwd(), 'data', 'sites.json');

// Ensure data directory exists
async function ensureDataDir() {
  const dataDir = path.dirname(DATA_FILE);
  try {
    await fs.access(dataDir);
  } catch {
    await fs.mkdir(dataDir, { recursive: true });
  }
}

// Read sites from JSON file
async function readSites(): Promise<Site[]> {
  try {
    await ensureDataDir();
    const data = await fs.readFile(DATA_FILE, 'utf8');
    const sites = JSON.parse(data);
    return sites.map((site: any) => ({
      ...site,
      createdAt: new Date(site.createdAt),
      updatedAt: new Date(site.updatedAt)
    }));
  } catch (error) {
    // File doesn't exist or is invalid, return empty array
    return [];
  }
}

// Write sites to JSON file
async function writeSites(sites: Site[]): Promise<void> {
  await ensureDataDir();
  await fs.writeFile(DATA_FILE, JSON.stringify(sites, null, 2));
}

// GET /api/sites - Get all sites
export async function GET() {
  try {
    const sites = await readSites();
    return NextResponse.json(sites);
  } catch (error) {
    console.error('Error reading sites:', error);
    return NextResponse.json(
      { error: 'Failed to read sites' },
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

    const sites = await readSites();
    const now = new Date();
    const newSite: Site = {
      id: crypto.randomUUID(),
      name: name.trim(),
      devUrl: devUrl || '',
      productionUrl: productionUrl || '',
      notes: notes || '',
      createdAt: now,
      updatedAt: now
    };

    sites.push(newSite);
    await writeSites(sites);

    return NextResponse.json(newSite, { status: 201 });
  } catch (error) {
    console.error('Error creating site:', error);
    return NextResponse.json(
      { error: 'Failed to create site' },
      { status: 500 }
    );
  }
}