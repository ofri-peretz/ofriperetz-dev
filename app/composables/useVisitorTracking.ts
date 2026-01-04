// Composable for tracking visitor events
// Tracks pageviews and specific actions (LinkedIn clicks, GitHub clicks, etc.)

export function useVisitorTracking() {
  const track = async (eventType: string, metadata?: Record<string, string>) => {
    try {
      await $fetch('/api/track', {
        method: 'POST',
        body: {
          event: eventType,
          page: window.location.pathname,
          referrer: document.referrer,
          ...metadata,
        },
      });
    } catch (e) {
      // Silently fail - don't break UX for tracking
      console.debug('[tracking]', e);
    }
  };

  // Track page view on mount
  const trackPageView = () => {
    track('pageview');
  };

  // Track LinkedIn profile click - this will show in LinkedIn's "Who viewed your profile"
  const trackLinkedInClick = () => {
    track('linkedin_click');
  };

  // Track GitHub click
  const trackGitHubClick = () => {
    track('github_click');
  };

  // Track resume/CV download intent
  const trackResumeClick = () => {
    track('resume_click');
  };

  // Track contact/meeting intent
  const trackContactClick = () => {
    track('contact_click');
  };

  return {
    track,
    trackPageView,
    trackLinkedInClick,
    trackGitHubClick,
    trackResumeClick,
    trackContactClick,
  };
}
