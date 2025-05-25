import { Page } from '@playwright/test';

/**
 * Options for WebScrapingUtils constructor
 */
export interface WebScrapingOptions {
  /** Directory to save downloaded files */
  downloadDir?: string;
  /** Directory to save DOM snapshots */
  snapshotDir?: string;
}

/**
 * Options for table extraction
 */
export interface TableExtractionOptions {
  /** Use first row as header */
  headerRow?: 'first';
  /** Create headers if none found */
  createHeaders?: boolean;
  /** Extract HTML instead of text */
  extractHtml?: boolean;
  /** Extract links from cells */
  extractLinks?: boolean;
}

/**
 * Options for link extraction
 */
export interface LinkExtractionOptions {
  /** Include additional attributes */
  includeAttributes?: boolean;
  /** Include data attributes */
  includeDataAttributes?: boolean;
}

/**
 * Options for text extraction
 */
export interface TextExtractionOptions {
  /** Return objects with metadata instead of strings */
  asObject?: boolean;
}

/**
 * Options for structured data extraction
 */
export interface StructuredDataExtractionOptions {
  /** Extract HTML instead of text */
  extractHtml?: boolean;
  /** Extract specific attribute */
  extractAttribute?: string;
}

/**
 * Options for DOM snapshot
 */
export interface SnapshotOptions {
  /** Remove styles from snapshot */
  removeStyles?: boolean;
  /** Remove scripts from snapshot */
  removeScripts?: boolean;
  /** Minify the HTML output */
  minify?: boolean;
}

/**
 * Options for metadata extraction
 */
export interface MetadataExtractionOptions {
  /** Extract structured data */
  extractStructuredData?: boolean;
  /** Extract Open Graph data */
  extractOpenGraph?: boolean;
}

/**
 * Options for image extraction
 */
export interface ImageExtractionOptions {
  /** Include natural dimensions */
  includeNaturalDimensions?: boolean;
  /** Include additional attributes */
  includeAttributes?: boolean;
  /** Include data attributes */
  includeDataAttributes?: boolean;
}

/**
 * Options for file download
 */
export interface DownloadOptions {
  /** HTTP headers */
  headers?: Record<string, string>;
  /** Request timeout */
  timeout?: number;
  /** Follow redirects */
  followRedirects?: boolean;
}

/**
 * Options for form data extraction
 */
export interface FormExtractionOptions {
  /** Exclude field values */
  excludeValues?: boolean;
  /** Include field labels */
  includeLabels?: boolean;
}

/**
 * Web Scraping Utilities for Playwright
 */
export class WebScrapingUtils {
  /**
   * Constructor
   * @param page - Playwright page object
   * @param options - Configuration options
   */
  constructor(page: Page, options?: WebScrapingOptions);
  
  /**
   * Extract data from a table
   * @param tableSelector - Table selector
   * @param options - Options for extraction
   * @returns Extracted data
   */
  extractTableData(tableSelector: string, options?: TableExtractionOptions): Promise<Record<string, any>[]>;
  
  /**
   * Extract links from a page
   * @param selector - Links selector
   * @param options - Options for extraction
   * @returns Extracted links
   */
  extractLinks(selector?: string, options?: LinkExtractionOptions): Promise<Array<{
    text: string;
    href: string;
    id?: string;
    className?: string;
    target?: string;
    rel?: string;
    title?: string;
    dataAttributes?: Record<string, string>;
  }>>;
  
  /**
   * Extract text content from elements
   * @param selector - Elements selector
   * @param options - Options for extraction
   * @returns Extracted text
   */
  extractText(selector: string, options?: TextExtractionOptions): Promise<string[] | Array<{
    index: number;
    text: string;
    tag: string;
    id: string;
    className: string;
  }>>;
  
  /**
   * Extract structured data from a page
   * @param selectors - Map of field names to selectors
   * @param options - Options for extraction
   * @returns Extracted data
   */
  extractStructuredData(selectors: Record<string, string>, options?: StructuredDataExtractionOptions): Promise<Record<string, any>>;
  
  /**
   * Save DOM snapshot
   * @param name - Snapshot name
   * @param options - Options for snapshot
   * @returns Path to the snapshot
   */
  saveDOMSnapshot(name: string, options?: SnapshotOptions): Promise<string>;
  
  /**
   * Extract metadata from page
   * @param options - Options for extraction
   * @returns Page metadata
   */
  extractMetadata(options?: MetadataExtractionOptions): Promise<Record<string, any>>;
  
  /**
   * Extract images from page
   * @param selector - Image selector
   * @param options - Options for extraction
   * @returns Extracted images
   */
  extractImages(selector?: string, options?: ImageExtractionOptions): Promise<Array<{
    src: string;
    alt: string;
    width: number;
    height: number;
    naturalWidth?: number;
    naturalHeight?: number;
    id?: string;
    className?: string;
    loading?: string;
    complete?: boolean;
    dataAttributes?: Record<string, string>;
  }>>;
  
  /**
   * Download file from URL
   * @param url - URL to download
   * @param filename - Optional filename (if not provided, will be extracted from URL)
   * @param options - Download options
   * @returns Path to downloaded file
   */
  downloadFile(url: string, filename?: string, options?: DownloadOptions): Promise<string>;
  
  /**
   * Extract form data
   * @param formSelector - Form selector
   * @param options - Options for extraction
   * @returns Form data
   */
  extractFormData(formSelector: string, options?: FormExtractionOptions): Promise<{
    action: string;
    method: string;
    id: string;
    name: string;
    fields: Array<{
      name: string;
      id: string;
      type: string;
      required: boolean;
      disabled: boolean;
      value?: string;
      checked?: boolean;
      label?: string;
      options?: Array<{
        value: string;
        text: string;
        selected?: boolean;
      }>;
    }>;
  } | null>;
  
  /**
   * Extract data using CSS selectors with JSON paths
   * @param selectorMap - Map of JSON paths to CSS selectors
   * @param options - Options for extraction
   * @returns Extracted data
   */
  extractDataWithJsonPath(selectorMap: Record<string, string>, options?: StructuredDataExtractionOptions): Promise<Record<string, any>>;
  
  /**
   * Extract data from a list
   * @param listSelector - List selector (ul, ol, dl)
   * @param options - Options for extraction
   * @returns Extracted list items
   */
  extractList(listSelector: string, options?: { asObject?: boolean }): Promise<Array<string | {
    index: number;
    text: string;
    links?: Array<{
      text: string;
      href: string;
    }>;
  } | {
    term: string;
    description: string;
  }>>;
}