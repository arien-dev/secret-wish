import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { WishlistService } from "@/server/services/wishlist.service";
import { WishlistDetailClient } from "@/components/wishlist/WishlistDetailClient";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function WishlistDetailPage({ params }: PageProps) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const { id } = await params;
  const wishlist = await WishlistService.getWishlistById(id, user.id);

  if (!wishlist) {
    notFound();
  }

  return (
    <WishlistDetailClient
      initialWishlist={wishlist}
      currentUserId={user.id}
    />
  );
}
