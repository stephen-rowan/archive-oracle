export async function fetchIssues() {
    try {
        const response = await fetch('/api/issues');
        const data = await response.json();
        
        // Check if the response contains an error or if data is not an array
        if (!response.ok || data.error || !Array.isArray(data)) {
            console.error("Failed to fetch issues:", data.error || "Invalid response format");
            return [];
        }
        
        return data;
    } catch (error) {
        console.error("Failed to fetch issues:", error);
        return [];
    }
}