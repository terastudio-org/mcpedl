# Migration Guide: From v1 to v2

This guide helps you migrate from the original MCPEDL API (v1) to the improved MCPEDL API (v2).

## What's New in v2

### 🚀 **Major Improvements**
- **TypeScript Support**: Full type safety and IntelliSense
- **Enhanced Error Handling**: Detailed error codes and messages
- **Rate Limiting**: Built-in rate limiting to respect API limits
- **Retry Logic**: Automatic retries with exponential backoff
- **Input Validation**: Validates all parameters before requests
- **Better Performance**: Optimized request handling
- **Comprehensive Testing**: Full test coverage with Jest
- **Code Quality**: ESLint and Prettier integration

### 📦 **New Dependencies**
- `p-retry`: For automatic request retries
- `bottleneck`: For rate limiting
- `@types/node`, `@types/jest`: TypeScript type definitions

## Migration Steps

### Step 1: Update Imports

**Before (v1):**
```javascript
const Mcpedl = require('./mcpedl');
const mc = new Mcpedl();
```

**After (v2):**
```typescript
import { McpedlAPI } from 'improved-mcpedl-api';
// or
import McpedlAPI from 'improved-mcpedl-api';

const mc = new McpedlAPI();
```

### Step 2: Update Method Calls

**Basic usage remains the same:**

```typescript
// Search - works the same
const results = await mc.search("1.21", 13);

// Detail - works the same  
const detail = await mc.detail("minecraft-pe-1-21-124-apk");

// Download - works the same
const download = await mc.download(6517);

// Latest - works the same
const latest = await mc.mclatest(1);
```

### Step 3: Add TypeScript Types (Optional but Recommended)

If you're using TypeScript, the new API provides comprehensive types:

```typescript
import { McpedlAPI, SearchResult, DetailResult, McpedlError } from 'improved-mcpedl-api';

const mc = new McpedlAPI();

// Type-safe results
const results: SearchResult = await mc.search("minecraft", 1);
const detail: DetailResult = await mc.detail("post-id");

// Type-safe error handling
try {
  const result = await mc.search("query");
} catch (error) {
  if (error instanceof McpedlError) {
    console.log(`Error code: ${error.code}`);
    console.log(`HTTP status: ${error.status}`);
    console.log(`Message: ${error.message}`);
  }
}
```

### Step 4: Configure API Behavior (New)

You can now customize the API behavior:

```typescript
const mc = new McpedlAPI({
  timeout: 15000,           // Request timeout (default: 10s)
  maxRetries: 5,            // Max retries (default: 3)
  retryDelay: 2000,         // Initial retry delay (default: 1s)
  rateLimit: {
    minTime: 2000,          // Min time between requests (default: 1s)
    maxConcurrent: 1        // Max concurrent requests (default: 2)
  },
  baseURL: 'https://mcpedl.org', // Custom base URL
  userAgent: 'MyApp/1.0'   // Custom user agent
});
```

### Step 5: Handle Enhanced Error Types

The new API provides more detailed error information:

**Before (v1):**
```javascript
try {
  const result = await mc.search("query");
} catch (err) {
  console.log("Error:", err.message || err);
}
```

**After (v2):**
```typescript
try {
  const result = await mc.search("query");
} catch (error) {
  if (error instanceof McpedlError) {
    // Access detailed error information
    console.log(`Code: ${error.code}`);           // e.g., "INVALID_QUERY"
    console.log(`Status: ${error.status}`);       // e.g., 404, 429
    console.log(`Message: ${error.message}`);     // e.g., "Search query must be a non-empty string"
    
    // Handle specific error types
    switch (error.code) {
      case 'RATE_LIMIT':
        console.log('Please wait before making more requests');
        break;
      case 'NOT_FOUND':
        console.log('The requested resource was not found');
        break;
      case 'INVALID_QUERY':
        console.log('Please provide a valid search query');
        break;
      default:
        console.log('An unknown error occurred');
    }
  }
}
```

### Step 6: Use New Configuration Methods

**Get current configuration:**
```typescript
const config = mc.getConfig();
console.log(`Current timeout: ${config.timeout}ms`);
console.log(`Current rate limit: ${config.rateLimit.minTime}ms`);
```

**Update configuration at runtime:**
```typescript
// Update specific settings
mc.updateConfig({
  maxRetries: 5,
  timeout: 20000
});

// Update rate limiting
mc.updateConfig({
  rateLimit: {
    minTime: 3000,
    maxConcurrent: 1
  }
});
```

## Breaking Changes

### None! 🎉

The improved API maintains **100% backward compatibility** with the original API. All existing code will continue to work without any changes.

However, there are some **enhancements** you should be aware of:

1. **Better Error Messages**: Errors now include more context and specific codes
2. **Automatic Retries**: Failed requests will be retried automatically
3. **Rate Limiting**: The API now respects rate limits to avoid being blocked
4. **Input Validation**: Invalid inputs are caught early with descriptive errors

## New Features

### 1. Enhanced Search Results

```typescript
const results = await mc.search("minecraft", 1);

// Results now include:
console.log(`Total results: ${results.list.length}`);
console.log(`Has next page: ${results.hasNextPage}`);
if (results.nextPage) {
  console.log(`Next page number: ${results.nextPage}`);
}
```

### 2. Detailed Information

```typescript
const detail = await mc.detail("post-id");

// Access comprehensive information:
console.log(`Title: ${detail.title}`);
console.log(`Main image: ${detail.img}`);
console.log(`Rating: ${detail.rating.value}/5 (${detail.rating.count} votes)`);
console.log(`Comments: ${detail.comment}`);

// Content sections
console.log(`Category: ${detail.info.category}`);
console.log(`Author: ${detail.info.author}`);
console.log(`Publish date: ${detail.info.postDate}`);

// Gallery items
detail.gallery.forEach(item => {
  console.log(`${item.type}: ${item.img}`);
});

// FAQ items
detail.faq.forEach(item => {
  console.log(`Q: ${item.question}`);
  console.log(`A: ${item.answer}`);
});

// Download options
detail.list.forEach(item => {
  console.log(`Version: ${item.name} v${item.version}`);
  item.files.forEach(file => {
    console.log(`  ${file.type}: ID ${file.id}`);
  });
});
```

### 3. Latest Content with Quick Downloads

```typescript
const latest = await mc.mclatest(1);

console.log(`Quick downloads: ${latest.quick.length}`);
latest.quick.forEach(item => {
  console.log(`${item.name} (File ID: ${item.file})`);
});

console.log(`Regular listings: ${latest.list.length}`);
latest.list.forEach(item => {
  console.log(`${item.name} (Rating: ${item.rating})`);
});
```

## Performance Improvements

### 1. Rate Limiting
- Prevents being blocked by the target server
- Respects server load with configurable delays
- Maximum concurrent requests control

### 2. Retry Logic
- Automatic retries on temporary failures
- Exponential backoff to avoid overwhelming servers
- Configurable retry count and delays

### 3. Better Request Handling
- Optimized HTTP client configuration
- Connection pooling and keep-alive
- Proper timeout handling

## Testing Your Migration

Create a test file to verify your migration:

```typescript
// test-migration.ts
import { McpedlAPI, McpedlError } from 'improved-mcpedl-api';

async function testMigration() {
  const mc = new McpedlAPI();
  
  try {
    // Test basic functionality
    console.log('Testing search...');
    const searchResults = await mc.search('minecraft');
    console.log(`Search successful: ${searchResults.list.length} results`);
    
    if (searchResults.list.length > 0) {
      console.log('Testing detail...');
      const detail = await mc.detail(searchResults.list[0].id);
      console.log(`Detail successful: ${detail.title}`);
      
      if (detail.list.length > 0 && detail.list[0].files.length > 0) {
        console.log('Testing download...');
        const download = await mc.download(detail.list[0].files[0].id);
        console.log(`Download successful: ${download.url}`);
      }
    }
    
    console.log('Testing latest...');
    const latest = await mc.mclatest();
    console.log(`Latest successful: ${latest.list.length} items`);
    
    console.log('✅ All tests passed!');
    
  } catch (error) {
    console.error('❌ Test failed:');
    if (error instanceof McpedlError) {
      console.log(`Code: ${error.code}`);
      console.log(`Message: ${error.message}`);
    } else {
      console.log(error);
    }
  }
}

testMigration();
```

## Support

If you encounter any issues during migration:

1. **Check the error codes**: The new API provides specific error codes
2. **Review the configuration**: Ensure your settings are appropriate
3. **Test with the examples**: Use the provided examples to verify functionality
4. **Check the documentation**: Comprehensive documentation is available

## Benefits of Upgrading

✅ **Better Reliability**: Automatic retries and better error handling  
✅ **Better Performance**: Rate limiting and connection optimization  
✅ **Better Developer Experience**: TypeScript support and comprehensive documentation  
✅ **Better Maintainability**: Well-tested code with CI/CD pipeline  
✅ **Future-Proof**: Modern JavaScript/TypeScript practices  

The improved API is fully backward compatible, so you can start benefiting from these improvements immediately without breaking existing code!