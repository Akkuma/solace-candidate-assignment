import { db, sql } from "@/db/index";
import { advocates } from "@/db/schema";
import { advocateData } from "@/db/seed/advocates";

const encoder = new TextEncoder();

const getAdvocates = db.query.advocates.findMany({ columns: { createdAt: false } }).prepare("getAdvocates");
export async function GET() {
  // This is to support purely no DB or DB w/streaming
  if (sql && process.env.NEXT_PUBLIC_USE_STREAMING) {
    // We can either manually select the batch size or dynamically set batch size
    const count = await db.$count(advocates);
    const query = sql`
      SELECT id, first_name as "firstName", 
      last_name as "lastName", city, degree, 
      specialties, years_of_experience as "yearsOfExperience", 
      phone_number as "phoneNumber" FROM advocates`;
    const iterator = query.cursor(Math.ceil(count / 5));

    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const rows of iterator) {
            // Batch up all the rows reduces stringify overhead
            // If we used an alternative to JSON could do this more efficiently
            controller.enqueue(encoder.encode(JSON.stringify(rows) + "\n"));
          }
          controller.close();
        } catch (err) {
          console.error("Error during streaming:", err);
          controller.error(err);
        }
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "application/json",
        "Transfer-Encoding": "chunked",
      },
    });
  }

  const data = process.env.DATABASE_URL ? await getAdvocates.execute() : advocateData;

  return Response.json({ data });
}
