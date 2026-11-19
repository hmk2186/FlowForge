/**
 * Validates a target URL to protect against SSRF (Server-Side Request Forgery).
 * Rejects localhost, 127.0.0.1, internal private IP ranges, and invalid URL schemes.
 *
 * @param {string} targetUrl - URL to be tested
 * @returns {{ isValid: boolean, error?: string, parsedUrl?: URL }}
 */
const validateSafeUrl = (targetUrl) => {
  if (!targetUrl || typeof targetUrl !== 'string') {
    return { isValid: false, error: 'URL must be a non-empty string' };
  }

  let parsed;
  try {
    parsed = new URL(targetUrl.trim());
  } catch (err) {
    return { isValid: false, error: 'Invalid URL format' };
  }

  // Only allow http and https protocols
  if (!['http:', 'https:'].includes(parsed.protocol)) {
    return { isValid: false, error: 'Only HTTP and HTTPS protocols are supported' };
  }

  const hostname = parsed.hostname.toLowerCase();

  // Block localhost and loopback hostnames
  if (
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    hostname === '::1' ||
    hostname.endsWith('.local') ||
    hostname.endsWith('.internal')
  ) {
    return { isValid: false, error: 'Requests to localhost and internal hostnames are prohibited for security' };
  }

  // Block private IP address ranges
  // 10.0.0.0 - 10.255.255.255
  // 172.16.0.0 - 172.31.255.255
  // 192.168.0.0 - 192.168.255.255
  // 169.254.0.0 - 169.254.255.255 (link-local / AWS metadata)
  const ipv4Match = hostname.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (ipv4Match) {
    const p1 = parseInt(ipv4Match[1], 10);
    const p2 = parseInt(ipv4Match[2], 10);

    if (p1 === 10) {
      return { isValid: false, error: 'Requests to 10.x.x.x private network are blocked' };
    }
    if (p1 === 172 && p2 >= 16 && p2 <= 31) {
      return { isValid: false, error: 'Requests to 172.16-31.x.x private network are blocked' };
    }
    if (p1 === 192 && p2 === 168) {
      return { isValid: false, error: 'Requests to 192.168.x.x private network are blocked' };
    }
    if (p1 === 169 && p2 === 254) {
      return { isValid: false, error: 'Requests to metadata services (169.254.x.x) are blocked' };
    }
    if (p1 === 127) {
      return { isValid: false, error: 'Requests to loopback addresses (127.x.x.x) are blocked' };
    }
  }

  return { isValid: true, parsedUrl: parsed };
};

module.exports = { validateSafeUrl };
