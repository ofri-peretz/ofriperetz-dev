// Visitor tracking endpoint - logs anonymous visitor data for future enrichment
// This data can be exported to RB2B, Clearbit, or other identification services later

interface VisitorEvent {
  timestamp: string;
  ip: string;
  userAgent: string;
  referrer: string;
  page: string;
  country?: string;
  city?: string;
  event?: string; // 'pageview', 'linkedin_click', 'github_click', etc.
}

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    
    // Get visitor info from headers
    const forwardedFor = getHeader(event, 'x-forwarded-for');
    const ip = forwardedFor?.split(',')[0]?.trim() || 'unknown';
    const userAgent = getHeader(event, 'user-agent') || 'unknown';
    const referrer = getHeader(event, 'referer') || body?.referrer || 'direct';
    
    // Get geo info from Vercel headers (free with Vercel deployment)
    const country = getHeader(event, 'x-vercel-ip-country') || undefined;
    const city = getHeader(event, 'x-vercel-ip-city') || undefined;
    
    const visitorEvent: VisitorEvent = {
      timestamp: new Date().toISOString(),
      ip,
      userAgent,
      referrer,
      page: body?.page || '/',
      country,
      city,
      event: body?.event || 'pageview',
    };
    
    // Log to console (visible in Vercel logs)
    // In production, you could send this to:
    // - A database (Supabase, PlanetScale)
    // - Analytics service (PostHog, Amplitude)
    // - Webhook (Zapier, Make.com)
    console.log('[VISITOR]', JSON.stringify(visitorEvent));
    
    return { success: true };
  } catch (error) {
    console.error('[VISITOR_ERROR]', error);
    return { success: false };
  }
});
