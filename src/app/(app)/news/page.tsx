import NewsFeedClient from "@/components/news/NewsFeedClient";

export default function NewsPage() {
  return (
    <div className="dashboard-parchment-bg min-h-[calc(100vh-4rem)] w-full min-w-0 overflow-x-hidden">
      <NewsFeedClient />
    </div>
  );
}
