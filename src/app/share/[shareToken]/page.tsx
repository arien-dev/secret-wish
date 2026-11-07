import { notFound } from "next/navigation";
import { ReservationService } from "@/server/services/reservation.service";
import { PublicWishlistClient } from "./PublicWishlistClient";

interface PageProps {
  params: Promise<{ shareToken: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { shareToken } = await params;
  const wishlist = await ReservationService.getPublicWishlist(shareToken);

  if (!wishlist) {
    return {
      title: "Wunschliste nicht gefunden — SecretWish",
    };
  }

  return {
    title: `${wishlist.title} — SecretWish`,
    description: wishlist.description || `Wunschliste von ${wishlist.ownerName}`,
  };
}

export default async function PublicWishlistPage({ params }: PageProps) {
  const { shareToken } = await params;
  const wishlist = await ReservationService.getPublicWishlist(shareToken);

  if (!wishlist) {
    notFound();
  }

  return (
    <PublicWishlistClient
      initialWishlist={wishlist}
      shareToken={shareToken}
    />
  );
}
