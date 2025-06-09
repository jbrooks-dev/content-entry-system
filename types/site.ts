export interface Site {
  id: string;
  name: string;
  devUrl: string;
  productionUrl: string;
  notes: string;
  client: string;
  host: string;
  customHost?: string; // Only used when host is 'Other'
  template: string;
  headerScripts: string;
  bodyScripts: string;
  footerScripts: string;
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}