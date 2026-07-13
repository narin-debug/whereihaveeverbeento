"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Nav from "@/components/Nav";
import PostForm from "@/components/PostForm";
import { fetchPosts, postPhotoUrl, type Post } from "@/lib/posts";
import { useLocale, useTranslations } from "@/lib/locale-context";

export default function BlogPage() {
  const t = useTranslations();
  const locale = useLocale();
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    fetchPosts().then(setPosts);
  }, []);

  const handleAdded = (post: Post) => {
    setPosts((prev) => [post, ...prev]);
  };

  return (
    <>
      <Nav />
      <section className="mx-auto max-w-5xl px-6 pb-24 pt-32 md:px-12">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-2xl font-bold sm:text-3xl">{t("blogHeading")}</h1>
          <PostForm onAdded={handleAdded} />
        </div>

        {posts.length === 0 ? (
          <p className="text-sm text-muted">{t("blogEmpty")}</p>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <Link
                key={post.id}
                href={`/blog/${post.id}`}
                className="overflow-hidden rounded-2xl border border-border bg-surface transition-colors hover:border-accent"
              >
                {post.photoIds[0] && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={postPhotoUrl(post.photoIds[0])}
                    alt={post.title}
                    className="h-48 w-full bg-background object-cover"
                  />
                )}
                <div className="p-4">
                  <p className="font-bold">{post.title}</p>
                  <p className="mt-1 font-mono text-[11px] uppercase tracking-wide text-muted">
                    {new Date(post.createdAt).toLocaleDateString(
                      locale === "ko" ? "ko-KR" : "en-US",
                      { year: "numeric", month: "long", day: "numeric" },
                    )}
                  </p>
                  <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted">
                    {post.body}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
