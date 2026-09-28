#!/bin/bash

# Stitch file fetcher - handles Google Cloud Storage redirects
# Usage: ./fetch-stitch.sh "download_url" "output_path"

URL="$1"
OUTPUT="$2"

if [ -z "$URL" ] || [ -z "$OUTPUT" ]; then
    echo "Usage: $0 <download_url> <output_path>"
    exit 1
fi

echo "Downloading: $URL"
echo "Output: $OUTPUT"

# Create output directory if it doesn't exist
mkdir -p "$(dirname "$OUTPUT")"

# Use curl with redirects and user agent
curl -L -A "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" \
     -H "Accept: */*" \
     -H "Accept-Encoding: gzip, deflate" \
     -H "Connection: keep-alive" \
     --max-redirs 10 \
     -o "$OUTPUT" \
     "$URL"

if [ $? -eq 0 ]; then
    echo "Successfully downloaded to: $OUTPUT"
else
    echo "Failed to download: $URL"
    exit 1
fi