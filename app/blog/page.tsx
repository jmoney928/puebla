import type { Metadata } from "next";
import Blog from "@/components/blog/Blog";

export const metadata: Metadata = { title: "Blog · Puebla ’26", description: "Jack’s blog from the Puebla trip, Oct 19–28, 2026." };

export default function BlogPage() {
  return <Blog />;
}
