const https = require('https');

https.get('https://ems.oceandevelopersltd.com/assets/index-CajqXBS8.js', res => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log('Total JS length:', data.length);
    
    // Search for navigation items, menus, and headings
    const phrases = [
      'Dashboard', 'Employees', 'Attendance', 'Leaves', 'Projects', 
      'Tasks', 'Payroll', 'Roles', 'Settings', 'CRM', 'Ocean Developers',
      'Recent Activities', 'Overview'
    ];
    
    for (const phrase of phrases) {
      const idx = data.indexOf(phrase);
      if (idx !== -1) {
        console.log(`Found "${phrase}" at context:`, data.substring(Math.max(0, idx - 40), Math.min(data.length, idx + 80)));
      }
    }
    
    // Look for route patterns like path:"/..."
    const routes = data.match(/path:\s*["'][^"']+["']/g);
    if (routes) {
      console.log('Routes found:', [...new Set(routes)].slice(0, 30));
    }
  });
});
