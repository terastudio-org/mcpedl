# MCPEDL API

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![ESLint](https://img.shields.io/badge/ESLint-4B3263?logo=eslint&logoColor=white)](https://eslint.org/)

A comprehensive and enhanced Node.js API for accessing MCPEDL.org content. This improved version provides better error handling, TypeScript support, rate limiting, retry mechanisms, and comprehensive documentation.

## Features

- 🚀 **Enhanced Performance**: Built-in rate limiting and retry mechanisms
- 🔒 **Type Safety**: Full TypeScript support with comprehensive type definitions
- 🛡️ **Robust Error Handling**: Detailed error messages with proper error codes
- ⚡ **Input Validation**: Validates all parameters before making requests
- 🔄 **Retry Logic**: Automatic retry for failed requests with exponential backoff
- 📝 **Comprehensive Documentation**: Detailed JSDoc comments and examples
- 🧪 **Tested**: Unit tests with Jest for reliability
- 🎨 **Code Quality**: ESLint and Prettier for consistent code style

## Installation

```bash
npm install github:terastudio-org/mcpedl
# or
yarn add github:terastudio-org/mcpedl
```

## Quick Start

```typescript
import { McpedlAPI } from 'mcpedl';

const mc = new McpedlAPI();

// Search for content
const searchResults = await mc.search('minecraft 1.21', 1);
console.log(searchResults);

// Get detailed information
const detail = await mc.detail('minecraft-pe-1-21-124-apk');
console.log(detail);

// Get download URL
const download = await mc.download(6517);
console.log(download);

// Get latest content
const latest = await mc.mclatest(1);
console.log(latest);
```

## Configuration

You can customize the API behavior by passing a configuration object:

```typescript
const mc = new McpedlAPI({
  timeout: 15000,           // Request timeout in milliseconds
  maxRetries: 5,            // Maximum retry attempts
  retryDelay: 2000,         // Initial retry delay in milliseconds
  rateLimit: {
    minTime: 2000,          // Minimum time between requests (ms)
    maxConcurrent: 1        // Maximum concurrent requests
  },
  baseURL: 'https://mcpedl.org', // Base URL for API requests
  userAgent: 'Custom User Agent'
});
```

## API Reference

### McpedlAPI Class

The main class for interacting with the MCPEDL API.

#### Constructor

```typescript
new McpedlAPI(config?: McpedlConfig): McpedlAPI
```

#### Methods

##### search(query, page?)

Searches for content on MCPEDL.

**Parameters:**
- `query` (string): Search query (required, non-empty)
- `page` (number): Page number (optional, default: 1, positive integer)

**Returns:** `Promise<SearchResult>`

**Example:**
```typescript
try {
  const results = await mc.search('texture pack', 2);
  console.log(`Found ${results.list.length} results`);
  console.log(`Has next page: ${results.hasNextPage}`);
  if (results.nextPage) {
    console.log(`Next page: ${results.nextPage}`);
  }
} catch (error) {
  console.error('Search failed:', error.message);
}
```

##### detail(id)

Retrieves detailed information about a specific post.

**Parameters:**
- `id` (string): Post ID (required, non-empty string)

**Returns:** `Promise<DetailResult>`

**Example:**
```typescript
try {
  const post = await mc.detail('minecraft-pe-1-21-124-apk');
  console.log(`Title: ${post.title}`);
  console.log(`Rating: ${post.rating.value}/5 (${post.rating.count} votes)`);
  console.log(`Category: ${post.info.category}`);
  console.log(`Downloads available: ${post.list.length}`);
  
  // Display gallery
  post.gallery.forEach(item => {
    console.log(`${item.type}: ${item.img}`);
  });
  
  // Display FAQ
  post.faq.forEach(item => {
    console.log(`Q: ${item.question}`);
    console.log(`A: ${item.answer}`);
  });
} catch (error) {
  console.error('Failed to get details:', error.message);
}
```

##### download(id)

Gets the download URL for a file.

**Parameters:**
- `id` (number): Download ID (required, positive integer)

**Returns:** `Promise<DownloadResult>`

**Example:**
```typescript
try {
  const downloadInfo = await mc.download(6517);
  console.log(`Download URL: ${downloadInfo.url}`);
  // Use the URL to download the file
} catch (error) {
  console.error('Failed to get download URL:', error.message);
}
```

##### mclatest(page?)

Gets the latest Minecraft content.

**Parameters:**
- `page` (number): Page number (optional, default: 1, positive integer)

**Returns:** `Promise<LatestResult>`

**Example:**
```typescript
try {
  const latest = await mc.mclatest(1);
  console.log(`Quick downloads: ${latest.quick.length}`);
  console.log(`Regular listings: ${latest.list.length}`);
  
  latest.quick.forEach(item => {
    console.log(`${item.name} (File ID: ${item.file})`);
  });
} catch (error) {
  console.error('Failed to get latest content:', error.message);
}
```

##### getConfig()

Returns the current configuration.

**Returns:** `Required<McpedlConfig>`

##### updateConfig(newConfig)

Updates the configuration at runtime.

**Parameters:**
- `newConfig` (Partial<McpedlConfig>): New configuration options

## Type Definitions

### SearchResult

```typescript
interface SearchResult {
  list: SearchItem[];
  hasNextPage: boolean;
  nextPage?: number;
}

interface SearchItem {
  name: string;
  id: string;
  img: string;
  rating: string;
}
```

### DetailResult

```typescript
interface DetailResult {
  title: string;
  img: string;
  rating: {
    count: string;
    value: string;
  };
  comment: string;
  content: string;
  info: PostInfo;
  gallery: GalleryItem[];
  faq: FAQItem[];
  list: DownloadItem[];
}

interface PostInfo {
  category: string;
  postDate: string;
  author: string;
  [key: string]: any;
}

interface GalleryItem {
  type: 'image' | 'video';
  img: string;
  name?: string;
  postTime?: string;
  duration?: string | null;
  video?: string | null;
}

interface FAQItem {
  question: string;
  answer: string;
}

interface DownloadItem {
  index: number;
  name: string;
  version: string;
  files: DownloadFile[];
}

interface DownloadFile {
  index: number;
  type: string;
  id: number;
  meta_title?: string | null;
}
```

### DownloadResult

```typescript
interface DownloadResult {
  url: string;
}
```

### LatestResult

```typescript
interface LatestResult {
  quick: QuickDownload[];
  list: SearchItem[];
}

interface QuickDownload {
  name: string;
  id: string;
  file: number;
}
```

## Error Handling

The API provides detailed error information through the `McpedlError` class:

```typescript
import { McpedlError } from 'improved-mcpedl-api';

try {
  const results = await mc.search('');
} catch (error) {
  if (error instanceof McpedlError) {
    console.error(`Error Code: ${error.code}`);
    console.error(`HTTP Status: ${error.status}`);
    console.error(`Message: ${error.message}`);
    if (error.originalError) {
      console.error('Original Error:', error.originalError);
    }
  }
}
```

### Error Codes

- `INVALID_QUERY`: Search query is empty or invalid
- `INVALID_PAGE`: Page number is invalid
- `INVALID_ID`: Post ID is empty or invalid
- `INVALID_DOWNLOAD_ID`: Download ID is invalid
- `NOT_FOUND`: Requested resource not found (404)
- `RATE_LIMIT`: Rate limit exceeded (429)
- `SERVER_ERROR`: Server error (5xx)
- `TIMEOUT`: Request timeout
- `REQUEST_FAILED`: General request failure
- `SEARCH_FAILED`: Search operation failed
- `DETAIL_FAILED`: Detail operation failed
- `DOWNLOAD_FAILED`: Download operation failed
- `DOWNLOAD_URL_NOT_FOUND`: Download URL not found
- `CONFIG_ERROR`: Configuration error

## Development

### Setup

```bash
git clone https://github.com/terastudio-org/mcpedl.git
cd mcpedl
npm install
```

### Available Scripts

- `npm run build` - Build the project
- `npm run dev` - Run in development mode
- `npm start` - Run the built version
- `npm test` - Run tests
- `npm test:watch` - Run tests in watch mode
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues
- `npm run format` - Format code with Prettier
- `npm run example` - Run the example
- `npm run clean` - Clean build directory

### Example Usage

Check the `examples/usage.ts` file for a comprehensive example.

## Advanced Usage Examples

### Batch Operations

```typescript
import { McpedlAPI } from 'improved-mcpedl-api';

const mc = new McpedlAPI({
  rateLimit: { minTime: 3000, maxConcurrent: 1 }
});

async function getMultipleDetails(ids: string[]) {
  const results = [];
  
  for (const id of ids) {
    try {
      const detail = await mc.detail(id);
      results.push({ id, success: true, data: detail });
    } catch (error) {
      results.push({ 
        id, 
        success: false, 
        error: error instanceof McpedlError ? error.message : 'Unknown error' 
      });
    }
  }
  
  return results;
}

// Usage
const ids = ['minecraft-pe-1-21-124-apk', 'texture-pack-example'];
const results = await getMultipleDetails(ids);
```

### Custom Configuration

```typescript
const mc = new McpedlAPI({
  timeout: 30000,           // 30 second timeout
  maxRetries: 5,            // More retries
  retryDelay: 3000,         // 3 second initial delay
  rateLimit: {
    minTime: 5000,          // 5 seconds between requests
    maxConcurrent: 1        // Only one request at a time
  },
  userAgent: 'MyApp/1.0 (Contact: developer@example.com)'
});

// Update configuration later
mc.updateConfig({
  maxRetries: 3,
  timeout: 20000
});
```

### Error Recovery Strategy

```typescript
import { McpedlAPI, McpedlError } from 'improved-mcpedl-api';

const mc = new McpedlAPI();

async function robustSearch(query: string, maxAttempts = 3) {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await mc.search(query);
    } catch (error) {
      if (error instanceof McpedlError) {
        if (error.code === 'RATE_LIMIT') {
          console.log(`Rate limited. Waiting before attempt ${attempt + 1}...`);
          await new Promise(resolve => setTimeout(resolve, 10000)); // Wait 10 seconds
          continue;
        }
        
        if (error.code === 'SERVER_ERROR' && attempt < maxAttempts) {
          console.log(`Server error on attempt ${attempt}. Retrying...`);
          await new Promise(resolve => setTimeout(resolve, 2000 * attempt));
          continue;
        }
        
        if (['INVALID_QUERY', 'NOT_FOUND'].includes(error.code!)) {
          throw error; // Don't retry for these errors
        }
      }
      
      if (attempt === maxAttempts) {
        throw error;
      }
    }
  }
}
```

## Migration from v1

The improved API maintains backward compatibility with the original API, but with enhanced features:

### Before (v1)
```javascript
const Mcpedl = require('./mcpedl');
const mc = new Mcpedl();
const results = await mc.search("1.21", 13);
```

### After (v2)
```typescript
import { McpedlAPI } from 'improved-mcpedl-api';

// Option 1: Drop-in replacement
const mc = new McpedlAPI();
const results = await mc.search("1.21", 13);

// Option 2: With enhanced features
const mc = new McpedlAPI({
  timeout: 15000,
  maxRetries: 5,
  rateLimit: { minTime: 2000, maxConcurrent: 1 }
});
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Disclaimer

This is an unofficial API for educational purposes. Please respect the terms of service of the target website and use this API responsibly.

## Author

terastudio-org
