import { RepositoryAdminApp } from "@/components/repository/RepositoryAdminApp";
import { isAnthropicConfigured, isRepositorySupabaseConfigured } from "@/lib/env";

export default function RepositoryAdminPage() {
  return (
    <main className="repo-admin-page">
      <RepositoryAdminApp
        configured={isRepositorySupabaseConfigured()}
        anthropicConfigured={isAnthropicConfigured()}
      />
    </main>
  );
}
