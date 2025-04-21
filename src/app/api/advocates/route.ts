import { db } from '@/db/index';
import { advocates } from '@/db/schema';
import { advocateData } from '@/db/seed/advocates';

export async function GET() {
	const data = process.env.DATABASE_URL ? await db.select().from(advocates) : advocateData;

	return Response.json({ data });
}
