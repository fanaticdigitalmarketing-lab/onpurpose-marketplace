# SOCIAL MEDIA OPTIMIZATION RULES

## Overview
These rules were developed based on real-world debugging experience with Facebook's Sharing Debugger and other social media platforms.

## Rules


### 1. IMAGE RELIABILITY RULE

**Description:** Always use reliable image services that guarantee proper dimensions and availability

**What We Learned:** Facebook debugger showed httpbin.org image was failing with 'Image Too Small' error

**Implementation:** Switched to Unsplash Images API with specific photo ID and parameters

**Best Practices:**
- Use specific photo IDs instead of dynamic/random images
- Always specify exact dimensions (1200x630 for Facebook)
- Include auto=format for optimized delivery
- Test image URLs in browser before deploying
- Avoid experimental or unreliable image services

---


### 2. CACHE BUSTING RULE

**Description:** Implement proper cache control to ensure social media platforms see latest changes

**What We Learned:** Facebook was still seeing old httpbin.org URL despite local changes

**Implementation:** Added cache control headers and structured data

**Best Practices:**
- Add Cache-Control: no-cache, no-store, must-revalidate
- Include Pragma: no-cache for older browsers
- Set Expires: 0 for immediate expiration
- Use structured data to reinforce image information
- Clear CDN caches after major changes

---


### 3. COMPREHENSIVE META TAGS RULE

**Description:** Include all necessary meta tags for maximum social media compatibility

**What We Learned:** Missing some meta tags that help with caching and discovery

**Implementation:** Added complete Open Graph, Twitter Card, and SEO meta tags

**Best Practices:**
- Include all basic OG tags (title, description, image, url, type)
- Add image-specific tags (width, height, type, alt)
- Include Twitter Card tags for cross-platform compatibility
- Add structured data (JSON-LD) for search engines
- Include robots and referrer meta tags

---


### 4. DIMENSIONS COMPLIANCE RULE

**Description:** Always meet or exceed platform image dimension requirements

**What We Learned:** Facebook requires minimum 200x200, recommends 1200x630 for optimal display

**Implementation:** Used exact 1200x630 dimensions with proper aspect ratio

**Best Practices:**
- Facebook: 1200x630 (1.91:1 ratio) for optimal display
- Twitter: Same dimensions work for summary_large_image
- LinkedIn: 1200x627 recommended
- Instagram: 1080x1080 for square, 1200x630 for landscape
- Always specify width and height in meta tags

---


### 5. DEPLOYMENT VERIFICATION RULE

**Description:** Always verify changes are deployed to all locations

**What We Learned:** Local changes weren't reflected in live Facebook debugging

**Implementation:** Deployed to all locations and created verification system

**Best Practices:**
- Deploy to root, build/, and frontend/ directories
- Verify each deployment has the correct meta tags
- Test live URL after deployment
- Use verification scripts to confirm changes
- Clear CDN caches if necessary

---


### 6. SOCIAL MEDIA TESTING RULE

**Description:** Always test social media previews before considering changes complete

**What We Learned:** Facebook debugging revealed issues that weren't apparent locally

**Implementation:** Created comprehensive verification and testing system

**Best Practices:**
- Test with Facebook Sharing Debugger
- Test with Twitter Card Validator
- Test with LinkedIn Post Inspector
- Test with WhatsApp link preview
- Test with Discord link preview

---


## Usage
Always run these rules before deploying social media changes:

```bash
node social-media-optimization-rules.js
```

## Testing Platforms
- Facebook: https://developers.facebook.com/tools/debug/
- Twitter: https://cards-dev.twitter.com/validator
- LinkedIn: https://www.linkedin.com/post-inspector/
