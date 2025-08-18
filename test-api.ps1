# Test Render API with curl
$apiKey = "rnd_fwSBtmlP5hkuFYbTWxFF83FHidRj"

# Get owner ID first
try {
    Write-Host "Getting owner information..."
    $ownerResponse = Invoke-RestMethod -Uri "https://api.render.com/v1/owners" -Headers @{"Authorization" = "Bearer $apiKey"}
    $ownerId = $ownerResponse[0].owner.id
    Write-Host "Owner ID: $ownerId"
} catch {
    Write-Host "Error getting owner: $($_.Exception.Message)"
    exit 1
}

# Create minimal payload
$payload = @{
    type = "web_service"
    name = "gabarita-ai-backend"
    ownerId = $ownerId
    repo = "https://github.com/techiaemp-netizen/gabarita-ai-backend"
} | ConvertTo-Json

Write-Host "Testing with minimal payload:"
Write-Host $payload

# Test with curl if available, otherwise use Invoke-RestMethod
try {
    $response = Invoke-RestMethod -Uri "https://api.render.com/v1/services" -Method POST -Headers @{"Authorization" = "Bearer $apiKey"; "Content-Type" = "application/json"} -Body $payload -ErrorAction Stop
    Write-Host "Success! Service created:"
    Write-Host ($response | ConvertTo-Json -Depth 10)
} catch {
    Write-Host "Error details:"
    Write-Host "Status Code: $($_.Exception.Response.StatusCode)"
    Write-Host "Status Description: $($_.Exception.Response.StatusDescription)"
    
    if ($_.Exception.Response) {
        try {
            $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
            $responseBody = $reader.ReadToEnd()
            Write-Host "Response Body: $responseBody"
        } catch {
            Write-Host "Could not read response body"
        }
    }
}