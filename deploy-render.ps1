# Deploy script for Render
$apiKey = "rnd_fwSBtmlP5hkuFYbTWxFF83FHidRj"
$repoUrl = "https://github.com/techiaemp-netizen/gabarita-ai-backend"
$serviceName = "gabarita-ai-backend"

# Get owner ID
$ownerResponse = Invoke-RestMethod -Uri "https://api.render.com/v1/owners" -Headers @{"Authorization" = "Bearer $apiKey"}
$ownerId = $ownerResponse[0].owner.id

# Create service payload
$serviceData = @{
    type = "web_service"
    name = $serviceName
    ownerId = $ownerId
    repo = $repoUrl
    branch = "master"
    buildCommand = "pip install -r requirements.txt"
    startCommand = "python src/main.py"
    envVars = @(
        @{ key = "PYTHON_VERSION"; value = "3.11.0" }
        @{ key = "PORT"; value = "10000" }
    )
}

# Check if service already exists
try {
    $existingServices = Invoke-RestMethod -Uri "https://api.render.com/v1/services" -Headers @{"Authorization" = "Bearer $apiKey"}
    $existingService = $existingServices | Where-Object { $_.service.name -eq $serviceName }
    
    if ($existingService) {
        Write-Host "Service '$serviceName' already exists!"
        Write-Host "Service ID: $($existingService.service.id)"
        Write-Host "Service URL: $($existingService.service.serviceDetails.url)"
        exit 0
    }
} catch {
    Write-Host "Error checking existing services: $($_.Exception.Message)"
}

# Create service
try {
    Write-Host "Creating service with payload:"
    Write-Host ($serviceData | ConvertTo-Json -Depth 10)
    
    $response = Invoke-RestMethod -Uri "https://api.render.com/v1/services" -Method POST -Headers @{"Authorization" = "Bearer $apiKey"; "Content-Type" = "application/json"} -Body ($serviceData | ConvertTo-Json -Depth 10)
    Write-Host "Service created successfully!"
    Write-Host "Service ID: $($response.service.id)"
    Write-Host "Service URL: $($response.service.serviceDetails.url)"
} catch {
    Write-Host "Full error details:"
    Write-Host "Status Code: $($_.Exception.Response.StatusCode)"
    Write-Host "Status Description: $($_.Exception.Response.StatusDescription)"
    
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "Response Body: $responseBody"
    }
    
    Write-Error "Failed to create service: $($_.Exception.Message)"
}