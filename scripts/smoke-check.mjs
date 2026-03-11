const baseUrl = process.env.BASE_URL;

if (!baseUrl) {
  console.error('BASE_URL is required. Example: BASE_URL=https://your-worker.workers.dev npm run smoke');
  process.exit(1);
}

const run = async () => {
  const health = await fetch(`${baseUrl}/api/v1/health`);
  const healthText = await health.text();
  if (healthText.includes('Cloudflare Access') || healthText.includes('Sign in')) {
    throw new Error(
      'Endpoint protected by Cloudflare Access. Create Access bypass for /api/* or use service token headers.',
    );
  }
  if (!health.ok) {
    throw new Error(`Health check failed with status ${health.status}`);
  }
  const healthJson = JSON.parse(healthText);

  const otp = await fetch(`${baseUrl}/api/v1/auth/otp/request`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'smoke@example.com' }),
  });
  if (![200, 201].includes(otp.status)) {
    throw new Error(`OTP request failed with status ${otp.status}`);
  }
  const otpText = await otp.text();
  if (otpText.includes('Cloudflare Access') || otpText.includes('Sign in')) {
    throw new Error(
      'OTP endpoint protected by Cloudflare Access. Create Access bypass for /api/* or use service token headers.',
    );
  }
  const otpJson = JSON.parse(otpText);

  console.log('Smoke OK');
  console.log(JSON.stringify({ health: healthJson, otp: otpJson }, null, 2));
};

run().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
