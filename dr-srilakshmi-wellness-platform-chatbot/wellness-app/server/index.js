import dotenv from 'dotenv';
import cors from 'cors';
import express from 'express';

dotenv.config({ path: new URL('./.env', import.meta.url) });

const app = express();
const port = Number(process.env.PORT || 3001);
const clientOrigin = process.env.CLIENT_ORIGIN || 'http://localhost:5173';

app.use(cors({ origin: clientOrigin }));
app.use(express.json({ limit: '32kb' }));

function cleanPhone(value) {
  const digits = String(value || '').replace(/\D/g, '');
  return digits ? `+${digits}` : '';
}

function twilioConfigured() {
  return Boolean(
    process.env.TWILIO_ACCOUNT_SID &&
    process.env.TWILIO_AUTH_TOKEN &&
    !process.env.TWILIO_AUTH_TOKEN.includes('PASTE_NEW_')
  );
}

function templateVariables(message) {
  const raw = process.env.TWILIO_WHATSAPP_TEMPLATE_VARIABLES;
  if (!raw) return { 1: message };
  try {
    return Object.fromEntries(Object.entries(JSON.parse(raw)).map(([key, value]) => [key, String(value).replace('{{message}}', message)]));
  } catch {
    return { 1: message };
  }
}

async function sendTwilioMessage({ to, body, whatsapp = false, contentVariables }) {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const from = whatsapp ? process.env.TWILIO_WHATSAPP_FROM : process.env.TWILIO_SMS_FROM;
  if (!to || !from || !twilioConfigured()) return { status: 'demo', channel: whatsapp ? 'whatsapp' : 'sms' };

  const params = new URLSearchParams({ To: whatsapp ? `whatsapp:${to}` : to, From: from });
  if (whatsapp && process.env.TWILIO_WHATSAPP_CONTENT_SID) {
    params.set('ContentSid', process.env.TWILIO_WHATSAPP_CONTENT_SID);
    params.set('ContentVariables', JSON.stringify(contentVariables || templateVariables(body)));
  } else {
    params.set('Body', body);
  }

  const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString('base64')}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params,
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data?.message || `Twilio request failed (${response.status})`);
  return { status: 'sent', channel: whatsapp ? 'whatsapp' : 'sms', sid: data.sid };
}

app.get('/api/health', (_req, res) => res.json({ ok: true, twilioConfigured: twilioConfigured() }));

app.post('/api/notifications/booking', async (req, res) => {
  const { mobile, whatsapp, message, contentVariables } = req.body || {};
  if (!message || (!mobile && !whatsapp)) return res.status(400).json({ error: 'message and at least one phone number are required' });

  const jobs = [];
  if (whatsapp) jobs.push({ channel: 'whatsapp', promise: sendTwilioMessage({ to: cleanPhone(whatsapp), body: message, whatsapp: true, contentVariables }) });
  if (mobile) jobs.push({ channel: 'sms', promise: sendTwilioMessage({ to: cleanPhone(mobile), body: message }) });
  const settled = await Promise.all(jobs.map(async (job) => {
    try { return await job.promise; } catch (error) {
      const trialHint = error.message.includes('verified recipient') || error.message.includes('trial phone number')
        ? 'Twilio trial requires this destination to be verified. For WhatsApp, send the Sandbox join keyword first.'
        : error.message;
      console.error(`${job.channel} delivery failed:`, error.message);
      return { status: 'failed', channel: job.channel, error: trialHint };
    }
  }));
  res.json({ ok: settled.some((result) => result.status === 'sent' || result.status === 'demo'), results: settled });
});

const server = app.listen(port, () => console.log(`Wellness API listening on http://localhost:${port}`));

server.on('error', async (error) => {
  if (error.code === 'EADDRINUSE') {
    try {
      const response = await fetch(`http://localhost:${port}/api/health`);
      if (response.ok) {
        console.log(`Wellness API is already running on http://localhost:${port}`);
        process.exit(0);
      }
    } catch {
      // The port belongs to another service.
    }
    console.error(`Port ${port} is already in use by another service. Stop it or set PORT to a free port.`);
    process.exit(1);
  }
  console.error('Wellness API failed to start:', error.message);
  process.exit(1);
});