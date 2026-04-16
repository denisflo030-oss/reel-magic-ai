#!/bin/bash

# Reel Magic AI - Integration Test
# Usage: ./test-api.sh

set -e

BASE_URL="http://localhost:3000"
VIDEO_FILE="${1:-.test_video.mp4}"

echo "🧪 Reel Magic AI Integration Test"
echo "=================================="
echo ""

# Check if server is running
echo "1️⃣  Checking server health..."
curl -s "$BASE_URL/health" | jq . || {
    echo "❌ Server not running. Start with: npm run dev"
    exit 1
}
echo ""

# Get server info
echo "2️⃣  Checking server info..."
curl -s "$BASE_URL/api/info" | jq .
echo ""

# Upload a video (if file provided)
if [ -f "$VIDEO_FILE" ]; then
    echo "3️⃣  Uploading video..."
    UPLOAD_RESPONSE=$(curl -s -X POST -F "video=@$VIDEO_FILE" "$BASE_URL/api/videos/upload")
    echo "$UPLOAD_RESPONSE" | jq .
    
    VIDEO_ID=$(echo "$UPLOAD_RESPONSE" | jq -r '.data.videoId')
    echo "✅ Video uploaded with ID: $VIDEO_ID"
    echo ""
    
    # Get video info
    echo "4️⃣  Getting video info..."
    curl -s "$BASE_URL/api/videos/$VIDEO_ID" | jq .
    echo ""
    
    # Generate clips
    echo "5️⃣  Requesting clip generation (async)..."
    CLIP_RESPONSE=$(curl -s -X POST "$BASE_URL/api/clips/generate" \
        -H "Content-Type: application/json" \
        -d "{\"videoId\": \"$VIDEO_ID\", \"numClips\": 3}")
    echo "$CLIP_RESPONSE" | jq .
    
    JOB_ID=$(echo "$CLIP_RESPONSE" | jq -r '.data.jobId')
    echo "✅ Job started with ID: $JOB_ID"
    echo ""
    
    # Poll job status
    echo "6️⃣  Monitoring clip generation..."
    for i in {1..30}; do
        JOB_STATUS=$(curl -s "$BASE_URL/api/clips/status/$JOB_ID")
        STATUS=$(echo "$JOB_STATUS" | jq -r '.data.status')
        PROGRESS=$(echo "$JOB_STATUS" | jq -r '.data.progress')
        
        echo "[$i/30] Status: $STATUS | Progress: $PROGRESS%"
        
        if [ "$STATUS" = "completed" ]; then
            echo "✅ Processing complete!"
            echo "$JOB_STATUS" | jq .
            
            # Get first clip ID
            CLIP_ID=$(echo "$JOB_STATUS" | jq -r '.data.clips[0].clipId // empty')
            
            if [ -n "$CLIP_ID" ]; then
                echo ""
                echo "7️⃣  Getting clip details..."
                curl -s "$BASE_URL/api/clips/$CLIP_ID" | jq .
                echo ""
                
                echo "8️⃣  Attempting to download clip..."
                echo "Download URL: $BASE_URL/api/clips/download/$CLIP_ID"
                echo "Thumbnail URL: $BASE_URL/api/clips/thumbnail/$CLIP_ID"
                echo ""
                
                # Actually download (optional)
                # curl -s "$BASE_URL/api/clips/download/$CLIP_ID" -o "output-clip-$CLIP_ID.mp4"
            fi
            break
        elif [ "$STATUS" = "failed" ]; then
            echo "❌ Job failed!"
            echo "$JOB_STATUS" | jq .
            break
        fi
        
        sleep 2
    done
    
    # List clips
    echo ""
    echo "9️⃣  Listing all clips..."
    curl -s "$BASE_URL/api/clips?videoId=$VIDEO_ID" | jq .
else
    echo "⚠️  Video file not provided. Usage: ./test-api.sh <video-file>"
    echo ""
    echo "Test endpoints without video:"
    echo ""
    
    echo "✅ Health check:"
    curl -s "$BASE_URL/health" | jq .
    echo ""
    
    echo "✅ Server info:"
    curl -s "$BASE_URL/api/info" | jq .
fi

echo ""
echo "✅ Integration test complete!"
