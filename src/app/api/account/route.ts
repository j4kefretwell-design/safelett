import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { getStripe } from "@/lib/stripe";

const STORAGE_BUCKETS = [
  "certificate-documents",
  "tenancy-documents",
] as const;

function uniquePaths(paths: Array<string | null | undefined>): string[] {
  return [...new Set(paths.filter((path): path is string => Boolean(path)))];
}

async function removeStorageFiles(
  admin: ReturnType<typeof createAdminClient>,
  bucket: (typeof STORAGE_BUCKETS)[number],
  paths: string[]
) {
  for (let index = 0; index < paths.length; index += 100) {
    const { error } = await admin.storage
      .from(bucket)
      .remove(paths.slice(index, index + 100));
    if (error) throw new Error(`Could not delete ${bucket}: ${error.message}`);
  }
}

async function listStorageFiles(
  admin: ReturnType<typeof createAdminClient>,
  bucket: (typeof STORAGE_BUCKETS)[number],
  prefix: string
): Promise<string[]> {
  const files: string[] = [];

  for (let offset = 0; ; offset += 1000) {
    const { data, error } = await admin.storage.from(bucket).list(prefix, {
      limit: 1000,
      offset,
    });
    if (error) throw new Error(`Could not list ${bucket}: ${error.message}`);

    for (const item of data ?? []) {
      const path = `${prefix}/${item.name}`;
      if (item.id) {
        files.push(path);
      } else {
        files.push(...(await listStorageFiles(admin, bucket, path)));
      }
    }

    if (!data || data.length < 1000) break;
  }

  return files;
}

export async function DELETE(request: Request) {
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) {
    return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }
  const userId = user.id;

  try {
    const admin = createAdminClient();
    const [
      { data: properties, error: propertiesError },
      { data: tenancies, error: tenanciesError },
      { data: subscription, error: subscriptionError },
    ] = await Promise.all([
      admin.from("properties").select("id").eq("user_id", user.id),
      admin
        .from("tenancies")
        .select("id, agreement_path, deposit_cert_path, right_to_rent_path")
        .eq("user_id", user.id),
      admin
        .from("subscriptions")
        .select("stripe_customer_id")
        .eq("user_id", user.id)
        .maybeSingle(),
    ]);

    if (propertiesError) throw propertiesError;
    if (tenanciesError) throw tenanciesError;
    if (subscriptionError) throw subscriptionError;

    const propertyIds = (properties ?? []).map((property) => property.id);
    const tenancyIds = (tenancies ?? []).map((tenancy) => tenancy.id);
    let certificateIds: string[] = [];
    let certificatePaths: string[] = [];

    if (propertyIds.length > 0) {
      const { data: certificates, error } = await admin
        .from("certificates")
        .select("id, document_path")
        .in("property_id", propertyIds);
      if (error) throw error;
      certificateIds = (certificates ?? []).map(
        (certificate) => certificate.id
      );
      certificatePaths = uniquePaths(
        (certificates ?? []).map((certificate) => certificate.document_path)
      );
    }

    const tenancyPaths = uniquePaths(
      (tenancies ?? []).flatMap((tenancy) => [
        tenancy.agreement_path,
        tenancy.deposit_cert_path,
        tenancy.right_to_rent_path,
      ])
    );

    const [allCertificateFiles, allTenancyFiles] = await Promise.all([
      listStorageFiles(admin, STORAGE_BUCKETS[0], user.id),
      listStorageFiles(admin, STORAGE_BUCKETS[1], user.id),
    ]);

    await Promise.all([
      removeStorageFiles(
        admin,
        STORAGE_BUCKETS[0],
        uniquePaths([...certificatePaths, ...allCertificateFiles])
      ),
      removeStorageFiles(
        admin,
        STORAGE_BUCKETS[1],
        uniquePaths([...tenancyPaths, ...allTenancyFiles])
      ),
    ]);

    if (subscription?.stripe_customer_id?.startsWith("cus_")) {
      try {
        await getStripe().customers.del(subscription.stripe_customer_id);
      } catch (error) {
        const code =
          error && typeof error === "object" && "code" in error
            ? (error as { code?: string }).code
            : undefined;
        if (code !== "resource_missing") throw error;
      }
    }

    async function deleteByUserId(table: string) {
      const { error } = await admin.from(table).delete().eq("user_id", userId);
      if (error) throw new Error(`Could not delete ${table}: ${error.message}`);
    }

    async function deleteByIds(
      table: string,
      column: string,
      ids: string[]
    ) {
      if (ids.length === 0) return;
      const { error } = await admin.from(table).delete().in(column, ids);
      if (error) throw new Error(`Could not delete ${table}: ${error.message}`);
    }

    // Assistant history is also user-owned but is not part of the relational
    // portfolio dependency chain below.
    await deleteByUserId("assistant_chats");

    // Keep this dependency order explicit rather than relying on cascades.
    await deleteByIds("certificate_alerts", "certificate_id", certificateIds);
    await deleteByIds("certificates", "property_id", propertyIds);
    await deleteByUserId("contractors");
    await deleteByIds("property_contractors", "property_id", propertyIds);
    await deleteByIds("tenancy_alerts", "tenancy_id", tenancyIds);
    await deleteByUserId("tenancies");
    await deleteByUserId("tenants");
    await deleteByUserId("properties");
    await deleteByUserId("subscriptions");

    const { error: profileError } = await admin
      .from("user_profiles")
      .delete()
      .eq("id", user.id);
    if (profileError) {
      throw new Error(`Could not delete user_profiles: ${profileError.message}`);
    }

    const { error: authError } = await admin.auth.admin.deleteUser(user.id);
    if (authError) throw authError;

    return NextResponse.json({ deleted: true });
  } catch (error) {
    console.error("[account/delete] Failed:", error);
    return NextResponse.json(
      {
        error:
          "Account deletion could not be completed. Please contact support for assistance.",
      },
      { status: 500 }
    );
  }
}
