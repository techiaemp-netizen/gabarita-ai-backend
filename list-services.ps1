# List existing services
$apiKey = "rnd_fwSBtmlP5hkuFYbTWxFF83FHidRj"

try {
    Write-Host "Listing existing services..."
    $services = Invoke-RestMethod -Uri "https://api.render.com/v1/services" -Headers @{"Authorization" = "Bearer $apiKey"}
    
    Write-Host "Found $($services.Count) services:"
    foreach ($service in $services) {
        Write-Host "- Name: $($service.service.name)"
        Write-Host "  ID: $($service.service.id)"
        Write-Host "  Type: $($service.service.type)"
        Write-Host "  Status: $($service.service.serviceDetails.publishedAt)"
        Write-Host "  URL: $($service.service.serviceDetails.url)"
        Write-Host ""
    }
} catch {
    Write-Host "Error listing services:"
    Write-Host "Status Code: $($_.Exception.Response.StatusCode)"
    Write-Host "Status Description: $($_.Exception.Response.StatusDescription)"
    
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "Response Body: $responseBody"
    }
    
    Write-Error "Failed to list services: $($_.Exception.Message)"
}