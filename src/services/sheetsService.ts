/**
 * Google Sheets Sync Service
 * 
 * This service pushes data to a Google Apps Script bridge which then updates Google Sheets.
 * 
 * Recommended Google Apps Script (deploy as Web App):
 * 
 * function doPost(e) {
 *   const data = JSON.parse(e.postData.contents);
 *   const sheetName = data.type; // 'users', 'farmers', 'orders', 'payments'
 *   const ss = SpreadsheetApp.getActiveSpreadsheet();
 *   let sheet = ss.getSheetByName(sheetName);
 *   if (!sheet) {
 *     sheet = ss.insertSheet(sheetName);
 *     sheet.appendRow(Object.keys(data.payload));
 *   }
 *   sheet.appendRow(Object.values(data.payload));
 *   return ContentService.createTextOutput(JSON.stringify({ status: 'success' }))
 *     .setMimeType(ContentService.MimeType.JSON);
 * }
 */

export async function syncToSheets(type: 'users' | 'farmers' | 'orders' | 'payments', payload: any) {
  try {
    const response = await fetch('/api/sync-sheets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, payload, timestamp: new Date().toISOString() }),
    });

    if (!response.ok) throw new Error('Sync failed');
    return await response.json();
  } catch (error) {
    console.warn('Sheets sync deferred:', error);
    // In a real app, you might queue this for retry
    return null;
  }
}
