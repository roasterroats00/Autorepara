# API Key Rotation Setup Guide

## Overview

The enrichment system now supports **multiple Gemini API keys** to bypass rate limiting and significantly speed up the enrichment process.

## Quick Start

### Option 1: Single API Key (Current Setup)

If you only have one API key, no changes needed:

```env
GEMINI_API_KEY=your_api_key_here
```

### Option 2: Multiple API Keys (Recommended)

For 3-5x faster enrichment:

```env
GEMINI_API_KEYS=key1,key2,key3,key4,key5
```

**Note:** Do NOT use both `GEMINI_API_KEY` and `GEMINI_API_KEYS`. If both are set, `GEMINI_API_KEYS` takes precedence.

## How to Get Multiple API Keys

1. **Create Google Accounts:**
   - Create 3-5 new Gmail accounts
   - Example: `yourname1@gmail.com`, `yourname2@gmail.com`, etc.

2. **Generate API Keys:**
   - Visit: https://aistudio.google.com/apikey
   - Sign in with each account (one at a time)
   - Click "Create API Key"
   - Copy each key

3. **Add to .env:**
   ```env
   GEMINI_API_KEYS=AIzaSyXXXXX,AIzaSyYYYYY,AIzaSyZZZZZ,AIzaSyAAAAA,AIzaSyBBBBB
   ```
   (Separate with commas, spaces are automatically trimmed)

## Performance Comparison

| Keys | Requests/Min | Time for 294 Workshops |
|------|--------------|------------------------|
| 1    | ~2-3         | 4-6 hours              |
| 3    | ~6-9         | 1.5-2 hours            |
| **5**| **~10-15**   | **~1 hour**            |

## How It Works

The system uses **round-robin rotation**:

```
Request 1 → API Key #1
Request 2 → API Key #2
Request 3 → API Key #3
Request 4 → API Key #1 (cycle repeats)
```

Each key only handles 1/N of the total requests, effectively multiplying your rate limit by N.

## Verification

When you start enrichment, check the console logs:

```
[Gemini] Loaded 5 API keys for rotation
[Gemini] Using API key #1/5
[Gemini] Using API key #2/5
[Gemini] Using API key #3/5
...
```

## Troubleshooting

### "No Gemini API keys found" Error

Make sure you have **at least one** of these in your `.env`:
- `GEMINI_API_KEY=...` (single key)
- `GEMINI_API_KEYS=...` (multiple keys)

### Rate Limiting Still Occurring

- Make sure keys are from **different Google accounts**
- Keys from the same account share the same quota
- Verify all keys are valid (test at https://aistudio.google.com)

### Want to Test First

Start with 2-3 keys before creating all 5:

```env
GEMINI_API_KEYS=key1,key2,key3
```

Monitor the logs and rate limit errors, then add more keys if needed.

## Recommended Setup

For best performance:
- **5 API keys** = ~1 hour for full enrichment
- Minimum 3 keys to see significant improvement
- All keys must be from different Google accounts
