import {
  formatTenancyDate,
  getDaysUntilDate,
  type Tenancy,
} from "@/lib/tenancy";

interface TimelinePoint {
  id: string;
  label: string;
  date: string;
  daysRemaining: number;
}

function buildTimelinePoints(tenancy: Tenancy): TimelinePoint[] {
  const points: TimelinePoint[] = [
    {
      id: "start",
      label: "Tenancy Start",
      date: tenancy.start_date,
      daysRemaining: getDaysUntilDate(tenancy.start_date),
    },
  ];

  if (tenancy.rent_review_date) {
    points.push({
      id: "rent_review",
      label: "Rent Review",
      date: tenancy.rent_review_date,
      daysRemaining: getDaysUntilDate(tenancy.rent_review_date),
    });
  }

  if (tenancy.right_to_rent_expiry) {
    points.push({
      id: "right_to_rent",
      label: "Right to Rent Expiry",
      date: tenancy.right_to_rent_expiry,
      daysRemaining: getDaysUntilDate(tenancy.right_to_rent_expiry),
    });
  }

  points.push({
    id: "end",
    label: "Tenancy End",
    date: tenancy.end_date,
    daysRemaining: getDaysUntilDate(tenancy.end_date),
  });

  return points.sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );
}

/** Past = cocoa, upcoming = navy, overdue obligations = red */
function pointColor(point: TimelinePoint): string {
  if (point.daysRemaining >= 0) return "bg-navy";
  if (point.id === "start") return "bg-[#6B503C]";
  return "bg-urgent";
}

export default function TenancyTimeline({ tenancy }: { tenancy: Tenancy }) {
  const points = buildTimelinePoints(tenancy);
  if (points.length < 2) return null;

  const startMs = new Date(points[0].date).getTime();
  const endMs = new Date(points[points.length - 1].date).getTime();
  const range = Math.max(endMs - startMs, 1);
  const todayMs = new Date().setHours(0, 0, 0, 0);
  const todayPercent = Math.min(
    100,
    Math.max(0, ((todayMs - startMs) / range) * 100)
  );

  return (
    <section className="mx-auto max-w-6xl px-5 pb-10 sm:px-12 lg:px-16">
      <h2 className="font-serif text-xl tracking-wide text-tenancy-text">
        Timeline
      </h2>

      <div className="mt-10 overflow-x-auto overscroll-x-contain pb-2 [-webkit-overflow-scrolling:touch]">
        <div className="relative min-w-[28rem] px-4 pt-8 pb-4">
          <div className="absolute top-10 right-8 left-8 h-px bg-steel/25" />
          <div
            className="absolute top-10 left-8 h-px bg-navy/35"
            style={{ width: `calc((100% - 4rem) * ${todayPercent / 100})` }}
            aria-hidden="true"
          />

          <div
            className="absolute top-6 z-20 -translate-x-1/2"
            style={{
              left: `calc(2rem + (100% - 4rem) * ${todayPercent / 100})`,
            }}
            title="Today"
          >
            <div className="flex flex-col items-center">
              <div className="h-2.5 w-2.5 rotate-45 bg-gold" />
              <span className="mt-1.5 text-[9px] font-normal uppercase tracking-[0.16em] text-gold">
                Today
              </span>
            </div>
          </div>

          <ol className="relative z-10 flex justify-between gap-3">
            {points.map((point) => (
              <li
                key={point.id}
                className="flex max-w-[9rem] flex-1 flex-col items-center text-center"
              >
                <span
                  className={`mt-1.5 h-3.5 w-3.5 rounded-full ${pointColor(point)}`}
                  aria-hidden="true"
                />
                <p className="mt-5 text-[10px] font-normal uppercase tracking-[0.12em] text-steel">
                  {point.label}
                </p>
                <p className="mt-2 text-sm text-tenancy-text">
                  {formatTenancyDate(point.date)}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
