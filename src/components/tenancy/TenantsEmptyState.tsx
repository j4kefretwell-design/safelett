import Link from "next/link";
import OptimizedFillImage from "@/components/OptimizedFillImage";
import { siteImages } from "@/lib/site-images";
import { btnNavyOutlineClassName, editorialPagePaddingClassName } from "@/lib/ui";

export default function TenantsEmptyState() {
  return (
    <div className="mt-10">
      <div
        className="relative h-40 w-full overflow-hidden sm:h-48"
        style={{ backgroundColor: siteImages.eranjanCottage.placeholderColor }}
      >
        <OptimizedFillImage
          image={siteImages.eranjanCottage}
          alt=""
          sizes="100vw"
          priority
          quality={55}
          className="object-cover"
          style={{ objectPosition: "center 40%" }}
        />
        <div className="absolute inset-0 bg-navy/45" aria-hidden />
      </div>
      <div
        className={`${editorialPagePaddingClassName} flex flex-col items-center py-16 text-center`}
      >
        <p className="font-serif text-2xl tracking-wide text-navy sm:text-3xl">
          No tenants added yet.
        </p>
        <Link
          href="/tenancy/tenants/new"
          className={`${btnNavyOutlineClassName} mt-8 w-full sm:w-auto`}
        >
          Add Tenant +
        </Link>
      </div>
    </div>
  );
}
