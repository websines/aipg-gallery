"use client";

import { fetchUserLikedImages } from "@/app/_api/fetchUserLikedImages";
import { User } from "@supabase/supabase-js";
import { useQuery } from "@tanstack/react-query";
import { LoadingSpinner } from "../misc-components/LoadingSpinner";
import LikesGallery from "./LikesGallery";

const LikesPage = ({ user }: { user: User | null }) => {
  const { data, error, isLoading } = useQuery({
    queryKey: ["likedImages", user?.id],
    queryFn: () => fetchUserLikedImages(user?.id),
  });

  return (
    <div className="flex flex-row ">
      {isLoading && <LoadingSpinner />}
      {error && <div>{error.message}</div>}
      {data &&
        data.map((item) => (
          <div key={item.id}>
            <LikesGallery item={item} userID={user?.id} />
          </div>
        ))}
    </div>
  );
};

export default LikesPage;
