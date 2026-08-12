import { PageBody, PageHeader } from "@/components/app/page-header";

/**
 * Placeholder for sidebar destinations that exist in the navigation but have
 * no frames in the Figma file yet (Dashboard, Incidents, Policies).
 *
 * Deliberately says so rather than inventing a screen: a fabricated security
 * dashboard is worse than an honest empty one, and this makes the remaining
 * design work visible instead of hiding it behind plausible filler.
 */
export function NotDesignedYet({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <PageBody>
      <PageHeader title={title} description={description} />
      <div className="mt-8 rounded-app border border-dashed border-hair-strong bg-chrome px-6 py-16 text-center">
        <p className="text-app font-medium text-strong">This screen has not been designed yet</p>
        <p className="mx-auto mt-2 max-w-md text-meta text-dim">
          The PrismSek Figma file has no frames for {title.toLowerCase()}. The route and
          navigation entry exist so the shell is complete; the screen is built once the design
          lands.
        </p>
      </div>
    </PageBody>
  );
}
