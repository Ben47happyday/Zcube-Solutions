import { NextResponse } from "next/server";

// Static — never touches the database, so it stays cheap to poll. Render's
// healthCheckPath points here; a free uptime pinger (e.g. UptimeRobot,
// cron-job.org) hitting this every 5-10 minutes stops the free-tier
// service from sleeping after 15 minutes of no traffic.
export async function GET() {
  return NextResponse.json({ status: "ok" });
}
